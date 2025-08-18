import { Injectable, Inject, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { HeaderRequest, HeaderUserPayload } from '../../../core/shared/interface/header-payload-req.interface';
import { LoggerTypes } from '@/core/shared/logger/logger.types';
import { DataSource } from 'typeorm';
import { ERROR_MESSAGES } from '@/core/shared/constants/error-message';

@Injectable()
export class AuthValidatorService {
    /**
     * @param requiredRoles - (@Roles)
     * @param requiredPermissions  -  (@Permissions).
     * @param db - TypeORM DataSource.
     * @returns boolean
     */

    constructor(@Inject('LOGGER') private readonly logger: LoggerTypes) {}

    async validateRequestPermissions(
        user: HeaderUserPayload,
        meta: { permissions?: string[]; departments?: string[] },
        _db: DataSource,
    ): Promise<boolean> {
        if (!user) {
            this.logger.APP.error('Payload request null');
            throw new UnauthorizedException(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
        }

        const userId = Number(user.sub);
        if (isNaN(userId)) {
            this.logger.APP.error('Invalid user ID format', { userSub: user.sub });
            throw new ForbiddenException('Invalid user ID');
        }
        // Permissions are carried in JWT payload as booleans under user.permissions

        const { permissions = [], departments = [] } = meta;

        const hasPermissions = permissions.every((prs) => (user as any)?.permissions?.[prs] === true);
        if (!hasPermissions) {
            this.logger.APP.warn(`User ID ${userId} lacks required permissions: ${permissions.join(', ')}`);
            throw new ForbiddenException(ERROR_MESSAGES.AUTH.FORBIDDEN);
        }

        if (departments.length > 0 && user.department?.code) {
            const isDepartmentAllowed = departments.includes(user.department.code);
            if (!isDepartmentAllowed) {
                this.logger.APP.warn(
                    `User ID ${userId} does not belong to required departments: ${departments.join(', ')}`,
                );
                throw new ForbiddenException(ERROR_MESSAGES.AUTH.FORBIDDEN);
                //You do not have permission to the department
            }
        }

        this.logger.APP.info(`User ID ${userId} passed permission and department checks`);
        return true;
    }

    async validateRequestRoles(
        request: HeaderRequest,
        requiredRoles: string[],
        jwtService: JwtService,
    ): Promise<boolean> {
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            this.logger.APP.error('Missing or invalid token');
            throw new UnauthorizedException(ERROR_MESSAGES.TOKEN.INVALID);
        }
        let payload: HeaderUserPayload;

        try {
            payload = await jwtService.verifyAsync(token, {
                algorithms: ['RS256'],
                secret: (process.env.ACCESS_TOKEN_PUBLIC_KEY || '').replace(/\\n/g, '\n'),
            });
        } catch (err) {
            if (err instanceof TokenExpiredError) {
                this.logger.APP.warn('Token has expired');
                throw new UnauthorizedException(ERROR_MESSAGES.TOKEN.EXPIRED);
            }
            this.logger.APP.error('Token verification failed', err);
            throw new UnauthorizedException(ERROR_MESSAGES.TOKEN.INVALID);
        }

        // request.payload = payload;
        if (!payload.roles?.some((r) => requiredRoles.includes(r))) {
            this.logger.APP.error(
                `Access denied. Required: ${requiredRoles.join(', ')}, Found: ${payload.roles?.join(',')}`,
            );
            throw new ForbiddenException(`Access denied. Required: ${requiredRoles.join(', ')}`);
        }

        return true;
    }

    private extractTokenFromHeader(request: { headers: { authorization?: string } }): string | undefined {
        const authHeader = request.headers.authorization;
        if (!authHeader) return undefined;

        const [type, token] = authHeader.split(' ');
        return type === 'Bearer' ? token : undefined;
    }
}
