import type { Admin } from '@/core/domain/admin';
import type { User } from '@/core/domain/user/user.entity';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { AdminJwtPayload, UserContext, UserJwtPayload } from '@/core/shared/interface/jwt-payload.interface';
import type { HeaderUserPayload } from '@/core/shared/interface/header-payload-req.interface';
import type { DataSource } from 'typeorm';
import { RevokedToken } from '@/core/domain/token/revoke-token.entity';
import type { LoggerTypes } from '@/core/shared/logger/logger.types';
import { UserSession } from '@/core/domain/user';

// ✅ Entity mới cho session management

interface SessionData {
    userId: number;
    sessionId: string;
    lastActivity: Date;
}

@Injectable()
export class TokenService {
    private readonly clientId = process.env.CLIENT_OAUTH_PASSWORD as string;
    private readonly accessTokenExpireSeconds = 1 * 60; // 15 minutes
    private readonly refreshTokenExpireSeconds = 7 * 24 * 60 * 60; // 7 days
    private readonly sessionTimeoutMinutes = 30;

    constructor(
        @Inject(JwtService) private readonly jwtService: JwtService,
        @Inject('DATA_SOURCE') private readonly db: DataSource,
        @Inject('REFRESH_JWT_SERVICE') private readonly refreshJwtService: JwtService,
        @Inject('LOGGER') private readonly logger: LoggerTypes,
    ) {}

    async getUserTokens(
        user: User,
        context: UserContext,
        sessionId: string,
    ): Promise<{ access_token: string; refresh_token: string }> {
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
        };

        const refreshTokenPayload = {
            sub: user.id,
            jti,
            iat: now,
            sessionId,
        };

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

        const refreshTokenPayload = {
            sub: admin.id,
            jti,
            iat: now,
            sessionId,
        };

        return {
            access_token: this.signToken(accessTokenPayload, this.accessTokenExpireSeconds),
            refresh_token: this.signTokenHS256(refreshTokenPayload, this.refreshTokenExpireSeconds),
        };
    }

    private signToken(payload: any, expiresIn: number): string {
        return this.jwtService.sign(payload, {
            expiresIn,
            algorithm: 'RS256',
        });
    }

    private signTokenHS256(payload: any, expiresIn: number): string {
        return this.refreshJwtService.sign(payload, {
            expiresIn,
        });
    }

    async revokeToken(jti: string): Promise<void> {
        const repo = this.db.getRepository(RevokedToken);
        const exists = await repo.findOneBy({ jti });

        if (!exists) {
            await repo.save(repo.create({ jti, revokedAt: new Date() }));
        }

        // ✅ Cũng revoke session
        await this.revokeSessionByJti(jti);
    }

    async isTokenRevoked(jti: string): Promise<boolean> {
        const repo = this.db.getRepository(RevokedToken);
        return !!(await repo.findOneBy({ jti }));
    }

    async verifyRefreshToken(token: string): Promise<SessionData> {
        try {
            const payload = this.refreshJwtService.verify<HeaderUserPayload & { sessionId: string }>(token);

            if (!payload.jti || !payload.sessionId) {
                throw new Error('Missing jti or sessionId');
            }

            const revoked = await this.isTokenRevoked(payload.jti);
            if (revoked) {
                throw new UnauthorizedException('Refresh token has been revoked');
            }

            const session = await this.getSession(payload.sessionId);
            if (!session) {
                throw new UnauthorizedException('Session not found');
            }

            const now = new Date();
            const lastActivity = new Date(session.last_activity);
            const timeDiff = (now.getTime() - lastActivity.getTime()) / (1000 * 60); // minutes

            if (timeDiff > this.sessionTimeoutMinutes) {
                await this.revokeSession(payload.sessionId);
                throw new UnauthorizedException('Session expired due to inactivity');
            }
            await this.updateSessionActivity(payload.sessionId);

            return {
                userId: payload.sub,
                sessionId: payload.sessionId,
                lastActivity: session.last_activity,
            };
        } catch (err) {
            this.logger.APP.error(`verifyRefreshToken error: ${err}`);
            throw new UnauthorizedException('Invalid or expired refresh token');
        }
    }

    // ✅ Method để update last activity
    async updateLastActivity(refreshToken: string): Promise<void> {
        try {
            const payload = this.refreshJwtService.verify<{ sessionId: string }>(refreshToken);
            if (payload.sessionId) {
                await this.updateSessionActivity(payload.sessionId);
            }
        } catch (err) {
            this.logger.APP.error(`updateLastActivity error: ${err}`);
        }
    }

    decode(token: string): any {
        return this.refreshJwtService.decode(token);
    }

    // ✅ Session management methods
    private async createUserSession(userId: number, sessionId: string, jti: string): Promise<void> {
        try {
            const repo = this.db.getRepository(UserSession);
            await repo.save(
                repo.create({
                    session_id: sessionId,
                    userId,
                    jti,
                    createdAt: new Date(),
                    lastActivity: new Date(),
                    isActive: true,
                }),
            );
        } catch (error) {
            this.logger.APP.error(`Create session error: ${error}`);
        }
    }

    private async getSession(sessionId: string): Promise<UserSession | null> {
        const repo = this.db.getRepository(UserSession);
        return repo.findOne({
            where: { session_id: sessionId, is_active: true },
        });
    }

    private async updateSessionActivity(sessionId: string): Promise<void> {
        try {
            const repo = this.db.getRepository(UserSession);
            await repo.update({ session_id: sessionId, is_active: true }, { last_activity: new Date() });
        } catch (error) {
            this.logger.APP.error(`Update session activity error: ${error}`);
        }
    }

    private async revokeSession(sessionId: string): Promise<void> {
        try {
            const repo = this.db.getRepository(UserSession);
            await repo.update({ session_id: sessionId }, { is_active: false, logout_at: new Date() });
        } catch (error) {
            this.logger.APP.error(`Revoke session error: ${error}`);
        }
    }

    private async revokeSessionByJti(jti: string): Promise<void> {
        try {
            const repo = this.db.getRepository(UserSession);
            await repo.update({ refresh_token: jti }, { is_active: false, logout_at: new Date() });
        } catch (error) {
            this.logger.APP.error(`Revoke session by jti error: ${error}`);
        }
    }

    // ✅ Enhanced cleanup with better performance
    async cleanupExpiredTokens(): Promise<void> {
        try {
            const batchSize = 1000; // Process in batches

            // ✅ Cleanup expired revoked tokens
            const revokedTokenRepo = this.db.getRepository(RevokedToken);
            const expiredDate = new Date();
            expiredDate.setDate(expiredDate.getDate() - 7);

            let deletedCount = 0;
            do {
                const expiredTokens = await revokedTokenRepo
                    .createQueryBuilder('token')
                    .select('token.id')
                    .where('token.revokedAt < :date', { date: expiredDate })
                    .orderBy('token.revokedAt', 'ASC') // đảm bảo nhất quán
                    .limit(batchSize)
                    .getMany();

                const ids = expiredTokens.map((t) => t.id);

                if (ids.length > 0) {
                    await revokedTokenRepo.delete(ids);
                }

                deletedCount = ids.length;
            } while (deletedCount === batchSize);

            // ✅ Cleanup expired sessions
            const sessionRepo = this.db.getRepository(UserSession);
            const sessionExpiredDate = new Date();
            sessionExpiredDate.setMinutes(sessionExpiredDate.getMinutes() - this.sessionTimeoutMinutes);

            let updatedCount = 0;
            do {
                const result = await sessionRepo
                    .createQueryBuilder()
                    .update()
                    .set({ is_active: false, logout_at: new Date() })
                    .where('lastActivity < :date AND isActive = true', { date: sessionExpiredDate })
                    .limit(batchSize)
                    .execute();

                updatedCount = result.affected || 0;
            } while (updatedCount === batchSize);

            // ✅ Delete old inactive sessions (older than 30 days)
            const oldSessionDate = new Date();
            oldSessionDate.setDate(oldSessionDate.getDate() - 30);

            await sessionRepo
                .createQueryBuilder()
                .delete()
                .where('isActive = false AND revokedAt < :date', { date: oldSessionDate })
                .execute();

            this.logger.APP.info('Cleaned up expired tokens and sessions');
        } catch (error) {
            this.logger.APP.error(`Token cleanup error: ${error}`);
        }
    }

    // ✅ Get session statistics
    async getSessionStatistics(): Promise<{
        totalActiveSessions: number;
        totalExpiredSessions: number;
        totalRevokedTokens: number;
    }> {
        const sessionRepo = this.db.getRepository(UserSession);
        const revokedTokenRepo = this.db.getRepository(RevokedToken);

        const [activeSessions, expiredSessions, revokedTokens] = await Promise.all([
            sessionRepo.count({ where: { is_active: true } }),
            sessionRepo.count({ where: { is_active: false } }),
            revokedTokenRepo.count(),
        ]);

        return {
            totalActiveSessions: activeSessions,
            totalExpiredSessions: expiredSessions,
            totalRevokedTokens: revokedTokens,
        };
    }
}
