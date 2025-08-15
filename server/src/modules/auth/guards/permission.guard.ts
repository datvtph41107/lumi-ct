import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../services/auth-core.service';

export interface PermissionMetadata {
    resource: string;
    action: string;
    conditions?: Record<string, any>;
}

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions =
    (...permissions: PermissionMetadata[]) =>
    (target: any, key?: string, descriptor?: any) => {
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

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('User not authenticated');
        }

        // Check if user has all required permissions
        for (const permission of requiredPermissions) {
            const hasPermission = await this.authService.hasPermission(
                user.id,
                permission.resource,
                permission.action,
                {
                    ...permission.conditions,
                    ...request.body,
                    ...request.params,
                    ...request.query,
                },
            );

            if (!hasPermission) {
                throw new ForbiddenException(`Insufficient permissions: ${permission.resource}:${permission.action}`);
            }
        }

        return true;
    }
}
