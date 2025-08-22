import { Injectable, Inject } from '@nestjs/common';
import type { PolicyContext, ResourcePolicy } from '../policy.types';
import { CollaboratorService } from '@/modules/contract/collaborator.service';
import { Role } from '@/core/shared/enums/base.enums';

@Injectable()
export class ContractResourcePolicy implements ResourcePolicy<string> {
	resource: string = 'contract';

	constructor(private readonly collaborators: CollaboratorService) {}

	async canView(contractId: string, ctx: PolicyContext): Promise<boolean> {
		if ((ctx.roles || []).includes(Role.MANAGER)) return true;
		return this.collaborators.canView(contractId, ctx.userId);
	}

	async canCreate(_payload: any, ctx: PolicyContext): Promise<boolean> {
		// Allow staff and managers; tighten via dept policy later
		return (ctx.roles || []).some((r) => [Role.MANAGER, Role.STAFF].includes(r as any));
	}

	async canUpdate(contractId: string, _payload: any, ctx: PolicyContext): Promise<boolean> {
		if ((ctx.roles || []).includes(Role.MANAGER)) return true;
		return this.collaborators.canEdit(contractId, ctx.userId);
	}

	async canDelete(contractId: string, ctx: PolicyContext): Promise<boolean> {
		// Only managers or owners can delete
		if ((ctx.roles || []).includes(Role.MANAGER)) return true;
		return this.collaborators.isOwner(contractId, ctx.userId);
	}

	async getCapabilities(contractId: string, ctx: PolicyContext): Promise<Record<string, boolean>> {
		const [can_view, can_update, can_delete] = await Promise.all([
			this.canView(contractId, ctx),
			this.canUpdate(contractId, {}, ctx),
			this.canDelete(contractId, ctx),
		]);
		return { can_view, can_update, can_delete };
	}
}