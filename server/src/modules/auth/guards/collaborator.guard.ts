// src/modules/contracts/guards/collaborator.guard.ts
import { CollaboratorService } from '@/modules/contract/collaborator.service';
import { CanActivate, ExecutionContext, Injectable, ForbiddenException, Inject, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { CollaboratorRole } from '@/core/domain/permission/collaborator-role.enum';

export const REQUIRED_ROLES_KEY = 'requiredRoles';
export const RequireRoles = (...roles: CollaboratorRole[]) => SetMetadata(REQUIRED_ROLES_KEY, roles);

@Injectable()
export class CollaboratorGuard implements CanActivate {
    constructor(
        private readonly collab: CollaboratorService,
        private readonly reflector: Reflector,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
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

        // Get required roles from decorator
        const requiredRoles = this.reflector.getAllAndOverride<CollaboratorRole[]>(
            REQUIRED_ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );

        // Default roles if none specified
        const roles = requiredRoles || [CollaboratorRole.OWNER, CollaboratorRole.EDITOR, CollaboratorRole.REVIEWER];

        // Check if user has required role
        const hasRole = await this.collab.hasRole(contractId, Number(user.sub), roles);
        
        if (!hasRole) {
            throw new ForbiddenException(`You do not have permission. Required roles: ${roles.join(', ')}`);
        }

        return true;
    }
}

@Injectable()
export class OwnerGuard implements CanActivate {
    constructor(private readonly collab: CollaboratorService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest<Request>();
        const user = (req as any).user;
        
        if (!user) {
            throw new ForbiddenException('Not authenticated');
        }

        const contractId = req.params?.id || req.params?.contractId || req.body?.contract_id;
        if (!contractId) {
            throw new ForbiddenException('Contract ID is required');
        }

        const isOwner = await this.collab.hasRole(contractId, Number(user.sub), [CollaboratorRole.OWNER]);
        
        if (!isOwner) {
            throw new ForbiddenException('Only contract owner can perform this action');
        }

        return true;
    }
}

@Injectable()
export class EditorGuard implements CanActivate {
    constructor(private readonly collab: CollaboratorService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest<Request>();
        const user = (req as any).user;
        
        if (!user) {
            throw new ForbiddenException('Not authenticated');
        }

        const contractId = req.params?.id || req.params?.contractId || req.body?.contract_id;
        if (!contractId) {
            throw new ForbiddenException('Contract ID is required');
        }

        const hasPermission = await this.collab.hasRole(contractId, Number(user.sub), [CollaboratorRole.OWNER, CollaboratorRole.EDITOR]);
        
        if (!hasPermission) {
            throw new ForbiddenException('Only owners and editors can perform this action');
        }

        return true;
    }
}
