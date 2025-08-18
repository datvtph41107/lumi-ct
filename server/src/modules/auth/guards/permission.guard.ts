import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthCoreService as AuthService } from '../../auth/auth/auth-core.service';
import type { HeaderRequest } from '@/core/shared/interface/header-payload-req.interface';

export interface PermissionMetadata {
    resource: string;
    action: string;
    conditions?: Record<string, any>;
}

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions: (...permissions: PermissionMetadata[]) => MethodDecorator =
    (...permissions: PermissionMetadata[]) =>
    (_target, _key, descriptor) => {
        if (!descriptor || typeof descriptor.value !== 'function') return descriptor;
        Reflect.defineMetadata(PERMISSIONS_KEY, permissions, descriptor.value);
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

        const request = context.switchToHttp().getRequest<HeaderRequest>();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('User not authenticated');
        }

        // Check if user has all required permissions
        for (const permission of requiredPermissions) {
            const hasPermission = await this.authService.hasPermission(
                Number(user.sub),
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
