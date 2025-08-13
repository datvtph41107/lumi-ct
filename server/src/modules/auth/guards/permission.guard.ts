import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { PERMISSION_KEY } from '@/core/shared/decorators/permission.decorator';
import { PermissionService } from '@/modules/contract/permission.service';

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly permissionService: PermissionService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermission = this.reflector.getAllAndOverride<string>(
            PERMISSION_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!requiredPermission) {
            // No permission required, allow access
            return true;
        }

        const req = context.switchToHttp().getRequest<Request>();
        const user = (req as any).user;

        if (!user) {
            throw new ForbiddenException('Not authenticated');
        }

        // Get contract ID from different possible sources
        const contractId = req.params?.id || req.params?.contractId || req.body?.contract_id;
        if (!contractId) {
            throw new ForbiddenException('Contract ID is required');
        }

        const hasPermission = await this.permissionService.hasPermission(
            contractId,
            Number(user.sub),
            requiredPermission,
        );

        if (!hasPermission) {
            throw new ForbiddenException(`You do not have permission: ${requiredPermission}`);
        }

        return true;
    }
}
