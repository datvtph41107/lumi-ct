import { CollaboratorService } from '@/modules/contract/collaborator.service';
import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import { CollaboratorRole } from '@/core/domain/permission/collaborator-role.enum';
import { UserJwtPayload } from '@/core/shared/types/auth.types';

interface RequestWithUser extends Request {
    user?: UserJwtPayload;
}

@Injectable()
export class CollaboratorGuard implements CanActivate {
    constructor(private readonly collaboratorService: CollaboratorService) {}
    
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

        // Check collaborator role
        const hasAccess = await this.collaboratorService.hasRole(
            contractId, 
            user.sub, 
            [
                CollaboratorRole.OWNER,
                CollaboratorRole.EDITOR,
                CollaboratorRole.VIEWER,
            ]
        );
        
        if (!hasAccess) {
            throw new ForbiddenException('You do not have permission to access this contract');
        }
        
        return true;
    }
}
