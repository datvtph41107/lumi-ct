import { CollaboratorService } from '@/modules/contract/collaborator.service';
import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { UserJwtPayload } from '@/core/shared/types/auth.types';
import { COLLAB_ROLES_METADATA_KEY } from '@/core/shared/decorators/setmeta.decorator';
import { CollaboratorRole } from '@/core/domain/permission/collaborator-role.enum';

interface RequestWithUser extends Request {
    user?: UserJwtPayload;
}

@Injectable()
export class CollaboratorGuard implements CanActivate {
    constructor(
        private readonly collaboratorService: CollaboratorService,
        private readonly reflector: Reflector,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<RequestWithUser>();
        const user = request.user;
        const contractId = request.params?.id;

        if (!user) {
            throw new ForbiddenException('Not authenticated');
        }

        if (!contractId) {
            throw new ForbiddenException('Contract ID is required');
        }

        // Determine required collaborator roles from metadata; default to view
        const requiredRoles = this.reflector.getAllAndOverride<CollaboratorRole[]>(COLLAB_ROLES_METADATA_KEY, [
            context.getHandler(),
            context.getClass(),
        ]) || [CollaboratorRole.OWNER, CollaboratorRole.REVIEWER, CollaboratorRole.VIEWER];

        // Managers bypass collaborator checks
        if ((user.roles || []).includes('MANAGER' as any)) {
            return true;
        }
        const hasAccess = await this.collaboratorService.hasRole(contractId, user.sub, requiredRoles);

        if (!hasAccess) {
            throw new ForbiddenException('You do not have permission to access this contract');
        }

        return true;
    }
}
