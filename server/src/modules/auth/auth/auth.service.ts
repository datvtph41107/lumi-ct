import { User } from '@/core/domain/user';
import type { LoginRequest } from '@/core/dto/login/login.request';
import type { LoggerTypes } from '@/core/shared/logger/logger.types';
import {
    BadRequestException,
    Inject,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import type { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { TokenService } from '../jwt/jwt.service';
import { buildUserContext } from '@/common/utils/context/builder-user-context.utils';
import { Role, Status } from '@/core/shared/enums/base.enums';
import { v4 as uuidv4 } from 'uuid';

// ✅ Interface cho session data
interface SessionData {
    userId: number;
    sessionId: string;
    lastActivity: Date;
}

@Injectable()
export class UserAuthService {
    constructor(
        @Inject('LOGGER') private readonly logger: LoggerTypes,
        @Inject('DATA_SOURCE') private readonly db: DataSource,
        @Inject(TokenService) private readonly jwtService: TokenService,
    ) {}

    async login(req: LoginRequest) {
        try {
            const role = req.is_manager_login ? Role.MANAGER : Role.STAFF;
            const repo = this.db.getRepository(User);

            const user = await repo.findOne({
                where: {
                    username: req.username,
                    role,
                    status: Status.ACTIVE,
                },
                select: ['id', 'name', 'username', 'password', 'role', 'status', 'department_id'],
            });

            if (!user) {
                this.logger.APP.warn(`Login failed: User '${req.username}' with role '${role}' not found or inactive`);
                throw new BadRequestException('Invalid credentials');
            }

            if (req.is_manager_login && user.role !== Role.MANAGER) {
                this.logger.APP.warn(`Permission denied: ${req.username} tried to access manager login`);
                throw new UnauthorizedException('Access denied');
            }

            const isMatch = await bcrypt.compare(req.password, user.password);
            if (!isMatch) {
                this.logger.APP.warn(`Login failed: Incorrect password for ${req.username}`);
                throw new BadRequestException('Invalid credentials');
            }

            const context = await buildUserContext(user, this.db);
            const sessionId = uuidv4();
            const tokens = await this.jwtService.getUserTokens(user, context, sessionId);

            const tokenExpiry = Math.floor(Date.now() / 1000) + 15 * 60; // 15 minutes

            return {
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                token_expiry: tokenExpiry,
                session_id: sessionId,
            };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unexpected error during login';
            this.logger.APP.error(`Login error for ${req.username}: ${message}`);

            if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
                throw error;
            }
            throw new InternalServerErrorException('Internal server error');
        }
    }

    async refreshAccessToken(refreshToken: string) {
        try {
            const sessionData = await this.jwtService.verifyRefreshToken(refreshToken);

            const user = await this.db.getRepository(User).findOne({
                where: { id: sessionData.userId, status: Status.ACTIVE },
                select: ['id', 'name', 'username', 'role', 'status', 'department_id'],
            });

            if (!user) {
                throw new UnauthorizedException('User not found or inactive');
            }

            const context = await buildUserContext(user, this.db);
            const tokens = await this.jwtService.getUserTokens(user, context, sessionData.sessionId);

            const tokenExpiry = Math.floor(Date.now() / 1000) + 15 * 60;

            return {
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                token_expiry: tokenExpiry,
                session_id: sessionData.sessionId,
            };
        } catch (err) {
            this.logger.APP.error('Refresh token failed:', err);
            throw new UnauthorizedException('Invalid or expired refresh token');
        }
    }

    async logout(refreshToken: string): Promise<void> {
        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token is required');
        }

        try {
            const payload = this.jwtService.decode(refreshToken) as { jti?: string };
            if (!payload?.jti) {
                this.logger.APP.warn('Logout failed: jti missing in token');
                throw new UnauthorizedException('Invalid token');
            }

            await this.jwtService.revokeToken(payload.jti);
            this.logger.APP.info(`Revoked token with jti: ${payload.jti}`);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            this.logger.APP.error(`Logout error: ${message}`);
            throw new UnauthorizedException('Logout failed');
        }
    }

    async getCurrentUser(userId: number) {
        try {
            const user = await this.db.getRepository(User).findOne({
                where: { id: userId, status: Status.ACTIVE },
                select: ['id', 'name', 'username', 'role', 'status', 'department_id'],
            });

            if (!user) {
                throw new NotFoundException('User not found');
            }

            const context = await buildUserContext(user, this.db);

            return {
                id: user.id,
                name: user.name,
                username: user.username,
                role: user.role,
                status: user.status,
                permissions: context.permissions,
                department: context.department,
                profile: {
                    name: user.name,
                },
            };
        } catch (error) {
            this.logger.APP.error(`Get current user error: ${error}`);
            throw new NotFoundException('User not found');
        }
    }

    async verifyRefreshToken(refreshToken: string): Promise<SessionData> {
        return this.jwtService.verifyRefreshToken(refreshToken);
    }

    async updateLastActivity(refreshToken: string): Promise<void> {
        try {
            await this.jwtService.updateLastActivity(refreshToken);
        } catch (error) {
            this.logger.APP.error(`updateLastActivity error: ${error}`);
            throw new UnauthorizedException('Invalid session');
        }
    }

    async changePassword(userId: number, currentPassword: string, newPassword: string) {
        try {
            const user = await this.db.getRepository(User).findOne({
                where: { id: userId, status: Status.ACTIVE },
                select: ['id', 'password'],
            });

            if (!user) {
                throw new NotFoundException('User not found');
            }

            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                throw new BadRequestException('Current password is incorrect');
            }

            const hashedPassword = await bcrypt.hash(newPassword, 12);
            await this.db.getRepository(User).update(userId, { password: hashedPassword });

            this.logger.APP.info(`Password changed for user ${userId}`);
            return { message: 'Password changed successfully' };
        } catch (error) {
            this.logger.APP.error(`Change password error: ${error}`);
            throw error;
        }
    }
}
