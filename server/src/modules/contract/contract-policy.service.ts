import { Injectable, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Role as SystemRole } from '@/core/shared/enums/base.enums';
import { Contract } from '@/core/domain/contract/contract.entity';
import { CollaboratorService } from './collaborator.service';
import { CollaboratorRole } from '@/core/domain/permission/collaborator-role.enum';

export interface ContractCapabilities {
    is_owner: boolean;
    can_view: boolean;
    can_edit: boolean;
    can_review: boolean;
    can_export: boolean;
    can_manage_collaborators: boolean;
    can_approve: boolean;
}

@Injectable()
export class ContractPolicyService {
    constructor(
        @Inject('DATA_SOURCE') private readonly db: DataSource,
        private readonly collab: CollaboratorService,
    ) {}

    private isManager(user: { roles?: any[]; role?: any }): boolean {
        if (Array.isArray(user?.roles)) return user.roles.includes(SystemRole.MANAGER);
        return (user?.role || '').toString().toUpperCase() === 'MANAGER';
    }

    async canView(contractId: string, user: { sub: number; roles?: any[]; role?: any }): Promise<boolean> {
        if (this.isManager(user)) return true;
        const contract = await this.db.getRepository(Contract).findOne({ where: { id: contractId } });
        if (!contract) return false;
        if (contract.is_public) return true;
        return this.collab.canView(contractId, user.sub);
    }

    async canEdit(contractId: string, user: { sub: number; roles?: any[]; role?: any }): Promise<boolean> {
        if (this.isManager(user)) return true;
        const allowed = await this.collab.canEdit(contractId, user.sub);
        if (!allowed) return false;
        const contract = await this.db.getRepository(Contract).findOne({ where: { id: contractId } });
        // If contract is pending, only owner or manager can edit
        if (contract && String(contract.status).toLowerCase() === 'pending') {
            return this.collab.isOwner(contractId, user.sub);
        }
        return true;
    }

    async canExport(contractId: string, user: { sub: number; roles?: any[]; role?: any }): Promise<boolean> {
        if (this.isManager(user)) return true;
        return this.collab.canExport(contractId, user.sub);
    }

    async canApprove(_contractId: string, user: { roles?: any[]; role?: any }): Promise<boolean> {
        return this.isManager(user);
    }

    async canManageCollaborators(contractId: string, user: { sub: number; roles?: any[]; role?: any }): Promise<boolean> {
        if (this.isManager(user)) return true;
        // Owner or explicit flag on collaborator
        const entRole = await this.collab.getRole(contractId, user.sub);
        if (entRole === CollaboratorRole.OWNER) return true;
        const ent = await (this as any).collab['collabRepo'].findOne({ where: { contract_id: contractId, user_id: user.sub, active: true } });
        return !!ent?.can_manage_collaborators;
    }

    async getCapabilities(contractId: string, user: { sub: number; roles?: any[]; role?: any }): Promise<ContractCapabilities> {
        const [is_owner, can_view, can_edit, can_review, can_export, can_manage_collaborators, can_approve] = await Promise.all([
            this.collab.isOwner(contractId, user.sub),
            this.canView(contractId, user),
            this.canEdit(contractId, user),
            this.collab.canReview(contractId, user.sub),
            this.canExport(contractId, user),
            this.canManageCollaborators(contractId, user),
            this.canApprove(contractId, user),
        ]);
        return { is_owner, can_view, can_edit, can_review, can_export, can_manage_collaborators, can_approve };
    }
}

