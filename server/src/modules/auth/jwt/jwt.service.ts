import { Admin } from '@/core/domain/admin/admin.entity';
import { User } from '@/core/domain/user/user.entity';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AdminJwtPayload, UserContext, UserJwtPayload } from '@/core/shared/types/auth.types';
import { DataSource } from 'typeorm';
import { RevokedToken } from '@/core/domain/token/revoke-token.entity';
import { LoggerTypes } from '@/core/shared/logger/logger.types';
import { UserSession } from '@/core/domain/user/user-session.entity';
import { AuthTokens, SessionData as AuthSessionData } from '@/core/shared/types/auth.types';

@Injectable()
export class TokenService {
    private readonly clientId = process.env.CLIENT_OAUTH_PASSWORD as string;
    private readonly accessTokenExpireSeconds = 15 * 60;
    private readonly refreshTokenExpireSeconds = 7 * 24 * 60 * 60;
    private readonly sessionTimeoutMinutes = 30;

    constructor(
        @Inject(JwtService) private readonly jwtService: JwtService,
        @Inject('DATA_SOURCE') private readonly db: DataSource,
        @Inject('REFRESH_JWT_SERVICE') private readonly refreshJwtService: JwtService,
        @Inject('LOGGER') private readonly logger: LoggerTypes,
    ) {}

    async getUserTokens(user: User, context: UserContext, sessionId: string): Promise<AuthTokens> {
        const jti = uuidv4();
        const now = Math.floor(Date.now() / 1000);

        const accessTokenPayload: UserJwtPayload = {
            sub: user.id,
            username: user.username,
            roles: [user.role],
            permissions: context.permissions,
            department: context.department,
            client_id: this.clientId,
            scope: ['read'],
            jti,
            iat: now,
            sessionId,
        } as UserJwtPayload;

        const refreshTokenPayload = { sub: user.id, jti, iat: now, sessionId } as any;

        await this.createUserSession(user.id, sessionId, jti);

        return {
            access_token: this.signToken(accessTokenPayload, this.accessTokenExpireSeconds),
            refresh_token: this.signTokenHS256(refreshTokenPayload, this.refreshTokenExpireSeconds),
        };
    }

    getAdminTokens(admin: Admin): { access_token: string; refresh_token: string } {
        const jti = uuidv4();
        const now = Math.floor(Date.now() / 1000);
        const sessionId = uuidv4();

        const accessTokenPayload: AdminJwtPayload = {
            sub: admin.id,
            roles: [admin.role],
            client_id: this.clientId,
            scope: ['read', 'write'],
            jti,
            iat: now,
            sessionId,
        };

        const refreshTokenPayload = { sub: admin.id, jti, iat: now, sessionId } as any;

        return {
            access_token: this.signToken(accessTokenPayload, this.accessTokenExpireSeconds),
            refresh_token: this.signTokenHS256(refreshTokenPayload, this.refreshTokenExpireSeconds),
        };
    }

    private signToken(payload: any, expiresIn: number): string {
        return this.jwtService.sign(payload, { expiresIn, algorithm: 'RS256' });
    }

    private signTokenHS256(payload: any, expiresIn: number): string {
        return this.refreshJwtService.sign(payload, { expiresIn });
    }

    async revokeToken(jti: string): Promise<void> {
        const repo = this.db.getRepository(RevokedToken);
        const exists = await repo.findOneBy({ jti });
        if (!exists) await repo.save(repo.create({ jti, revokedAt: new Date() }));
        await this.revokeSessionByJti(jti);
    }

    async isTokenRevoked(jti: string): Promise<boolean> {
        const repo = this.db.getRepository(RevokedToken);
        return !!(await repo.findOneBy({ jti }));
    }

    async verifyRefreshToken(token: string): Promise<SessionData> {
        try {
            const payload = this.refreshJwtService.verify<HeaderUserPayload & { sessionId: string }>(token);
            if (!payload.jti || !payload.sessionId) throw new Error('Missing jti or sessionId');
            const revoked = await this.isTokenRevoked(payload.jti);
            if (revoked) throw new UnauthorizedException('Refresh token has been revoked');

            const session = await this.getSession(payload.sessionId);
            if (!session) throw new UnauthorizedException('Session not found');

            const now = new Date();
            const lastActivity = new Date(session.last_activity);
            const timeDiff = (now.getTime() - lastActivity.getTime()) / (1000 * 60);
            if (timeDiff > this.sessionTimeoutMinutes) {
                await this.revokeSession(payload.sessionId);
                throw new UnauthorizedException('Session expired due to inactivity');
            }
            await this.updateSessionActivity(payload.sessionId);

            return { userId: session.user_id, sessionId: payload.sessionId, lastActivity: session.last_activity };
        } catch (err) {
            this.logger.APP.error(`verifyRefreshToken error: ${err}`);
            throw new UnauthorizedException('Invalid or expired refresh token');
        }
    }

    async updateLastActivity(refreshToken: string): Promise<void> {
        try {
            const payload = this.refreshJwtService.verify<{ sessionId: string }>(refreshToken);
            if (payload.sessionId) await this.updateSessionActivity(payload.sessionId);
        } catch (err) {
            this.logger.APP.error(`updateLastActivity error: ${err}`);
        }
    }

    decode(token: string): any {
        return this.refreshJwtService.decode(token);
    }

    private async createUserSession(userId: number, sessionId: string, jti: string): Promise<void> {
        try {
            const repo = this.db.getRepository(UserSession);
            await repo.save(
                repo.create({
                    session_id: sessionId,
                    user_id: userId,
                    jti,
                    created_at: new Date(),
                    last_activity: new Date(),
                    is_active: true,
                } as any),
            );
        } catch (error) {
            this.logger.APP.error(`Create session error: ${error}`);
        }
    }

    private async getSession(sessionId: string): Promise<UserSession | null> {
        const repo = this.db.getRepository(UserSession);
        return repo.findOne({ where: { session_id: sessionId, is_active: true } });
    }

    private async updateSessionActivity(sessionId: string): Promise<void> {
        try {
            const repo = this.db.getRepository(UserSession);
            await repo.update({ session_id: sessionId, is_active: true }, { last_activity: new Date() } as any);
        } catch (error) {
            this.logger.APP.error(`Update session activity error: ${error}`);
        }
    }

    public async revokeSession(sessionId: string): Promise<void> {
        try {
            const repo = this.db.getRepository(UserSession);
            await repo.update({ session_id: sessionId } as any, { is_active: false, revoked_at: new Date() } as any);
        } catch (error) {
            this.logger.APP.error(`Revoke session error: ${error}`);
        }
    }

    public async revokeSessionByJti(jti: string): Promise<void> {
        try {
            const repo = this.db.getRepository(UserSession);
            await repo.update({ jti } as any, { is_active: false, revoked_at: new Date() } as any);
        } catch (error) {
            this.logger.APP.error(`Revoke session by jti error: ${error}`);
        }
    }

    async cleanupExpiredTokens(): Promise<void> {
        try {
            const batchSize = 1000;
            const revokedTokenRepo = this.db.getRepository(RevokedToken);
            const expiredDate = new Date();
            expiredDate.setDate(expiredDate.getDate() - 7);

            let deletedCount = 0;
            do {
                const expiredTokens = await revokedTokenRepo
                    .createQueryBuilder('token')
                    .select('token.id')
                    .where('token.revokedAt < :date', { date: expiredDate })
                    .orderBy('token.revokedAt', 'ASC')
                    .limit(batchSize)
                    .getMany();
                const ids = expiredTokens.map((t) => t.id);
                if (ids.length > 0) await revokedTokenRepo.delete(ids);
                deletedCount = ids.length;
            } while (deletedCount === batchSize);

            const sessionRepo = this.db.getRepository(UserSession);
            const sessionExpiredDate = new Date();
            sessionExpiredDate.setMinutes(sessionExpiredDate.getMinutes() - this.sessionTimeoutMinutes);

            let updatedCount = 0;
            do {
                const result = await sessionRepo
                    .createQueryBuilder()
                    .update(UserSession)
                    .set({ is_active: false, revoked_at: new Date() } as any)
                    .where('last_activity < :date AND is_active = true', { date: sessionExpiredDate })
                    .limit(batchSize)
                    .execute();
                updatedCount = result.affected || 0;
            } while (updatedCount === batchSize);

            const oldSessionDate = new Date();
            oldSessionDate.setDate(oldSessionDate.getDate() - 30);
            await sessionRepo
                .createQueryBuilder()
                .delete()
                .where('is_active = false AND revoked_at < :date', { date: oldSessionDate })
                .execute();

            this.logger.APP.info('Cleaned up expired tokens and sessions');
        } catch (error) {
            this.logger.APP.error(`Token cleanup error: ${error}`);
        }
    }

    async getSessionStatistics(): Promise<{
        totalActiveSessions: number;
        totalExpiredSessions: number;
        totalRevokedTokens: number;
    }> {
        const sessionRepo = this.db.getRepository(UserSession);
        const revokedTokenRepo = this.db.getRepository(RevokedToken);
        const [activeSessions, expiredSessions, revokedTokens] = await Promise.all([
            sessionRepo.count({ where: { is_active: true } as any }),
            sessionRepo.count({ where: { is_active: false } as any }),
            revokedTokenRepo.count(),
        ]);
        return {
            totalActiveSessions: activeSessions,
            totalExpiredSessions: expiredSessions,
            totalRevokedTokens: revokedTokens,
        };
    }
}
