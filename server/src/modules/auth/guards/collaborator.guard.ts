// src/modules/contracts/guards/collaborator.guard.ts
import { CollaboratorService } from '@/modules/contract/collaborator.service';
import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import type { Request } from 'express';
import { CollaboratorRole } from '@/core/domain/permission/collaborator-role.enum';
import type { HeaderRequest, HeaderUserPayload } from '@/core/shared/interface/header-payload-req.interface';

@Injectable()
export class CollaboratorGuard implements CanActivate {
    constructor(private readonly collab: CollaboratorService) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest<Request & HeaderRequest>();
        const user = (req as HeaderRequest).user as HeaderUserPayload | undefined;
        const contractId = req.params?.id;
        if (!user) throw new ForbiddenException('Not authenticated');

        // allow if user is system admin? implement as needed
        // else check collaborator role
        const allowed = await this.collab.hasRole(contractId, Number(user.sub), [
            CollaboratorRole.OWNER,
            CollaboratorRole.EDITOR,
            CollaboratorRole.VIEWER,
        ]);
        if (!allowed) throw new ForbiddenException('You do not have permission');
        return true;
    }
}
