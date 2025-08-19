import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
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
// Deprecated duplicate guard
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

        return true;
    }
}
export { PermissionGuard as PermissionsGuard };
