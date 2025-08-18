import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthService as AuthService } from '../auth/auth.service';
import { UserJwtPayload } from '@/core/shared/types/auth.types';

export interface PermissionMetadata {
    resource: string;
    action: string;
    conditions?: Record<string, unknown>;
}

interface RequestWithUser extends Request {
    user?: UserJwtPayload;
}

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions =
    (...permissions: PermissionMetadata[]) =>
    (target: unknown, key?: string, descriptor?: PropertyDescriptor) => {
        if (descriptor?.value) {
            Reflect.defineMetadata(PERMISSIONS_KEY, permissions, descriptor.value);
        }
        return descriptor;
    };

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private authService: AuthService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions = this.reflector.getAllAndOverride<PermissionMetadata[]>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredPermissions) {
            return true;
        }

        const request = context.switchToHttp().getRequest<RequestWithUser>();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('User not authenticated');
        }

        // Check if user has all required permissions
        for (const permission of requiredPermissions) {
            const hasPermission = await this.authService.hasPermission(
                user.sub,
                permission.resource,
                permission.action,
                {
                    ...permission.conditions,
                    ...(request.body as Record<string, unknown>),
                    ...(request.params as Record<string, unknown>),
                    ...(request.query as Record<string, unknown>),
                },
            );

            if (!hasPermission) {
                throw new ForbiddenException(`Insufficient permissions: ${permission.resource}:${permission.action}`);
            }
        }

        return true;
    }
}
export { PermissionGuard as PermissionsGuard };
