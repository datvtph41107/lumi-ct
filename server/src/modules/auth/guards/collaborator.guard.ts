// src/modules/contracts/guards/collaborator.guard.ts
import { CollaboratorService } from '@/modules/contract/collaborator.service';
import { CanActivate, ExecutionContext, Injectable, ForbiddenException, Inject } from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class CollaboratorGuard implements CanActivate {
    constructor(private readonly collab: CollaboratorService) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest<Request>();
        const user = (req as any).user;
        const contractId = req.params?.id;
        if (!user) throw new ForbiddenException('Not authenticated');

        // allow if user is system admin? implement as needed
        // else check collaborator role
        const allowed = await this.collab.hasRole(contractId, Number(user.sub), ['owner', 'editor', 'reviewer']);
        if (!allowed) throw new ForbiddenException('You do not have permission');
        return true;
    }
}
