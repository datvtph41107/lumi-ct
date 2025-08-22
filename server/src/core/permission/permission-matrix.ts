import { Injectable, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Role } from '@/core/shared/enums/base.enums';
import { Collaborator } from '@/core/domain/permission/collaborator.entity';
import { CollaboratorRole } from '@/core/domain/permission/collaborator-role.enum';
import { PERMISSIONS, Permission, RoleToPermissions, mergeGrants } from './permissions';

	export const BASE_MATRIX: RoleToPermissions = {
		[Role.STAFF]: [
			PERMISSIONS.contract.read,
			PERMISSIONS.contract.create,
			PERMISSIONS.contract.update,
			PERMISSIONS.contract.export,
			PERMISSIONS.template.read,
		],
		[Role.MANAGER]: ['*'],
	};

export interface EffectivePermissions {
	global: Permission[];
	byResource: Record<string, Permission[]>;
}

@Injectable()
export class PermissionService {
	constructor(@Inject('DATA_SOURCE') private readonly db: DataSource) {}

	getGlobalGrants(userRoles: string[]): Permission[] {
		const roleGrants = userRoles.map((r) => BASE_MATRIX[r] || []);
		return mergeGrants(...roleGrants);
	}

	async getContractGrantsForUser(contractId: string, userId: number): Promise<Permission[]> {
		const repo = this.db.getRepository(Collaborator);
		const collab = await repo.findOne({ where: { contract_id: contractId, user_id: userId, active: true } });
		if (!collab) return [];
		switch (collab.role as CollaboratorRole) {
			case CollaboratorRole.OWNER:
				return [
					PERMISSIONS.contract.read,
					PERMISSIONS.contract.update,
					PERMISSIONS.contract.export,
					PERMISSIONS.contract.manage_collaborators,
				];
			case CollaboratorRole.EDITOR:
				return [PERMISSIONS.contract.read, PERMISSIONS.contract.update, PERMISSIONS.contract.export];
			case CollaboratorRole.REVIEWER:
				return [PERMISSIONS.contract.read, PERMISSIONS.contract.review];
			case CollaboratorRole.VIEWER:
				return [PERMISSIONS.contract.read];
			default:
				return [];
		}
	}

	async getEffectivePermissions(user: { id: number; roles: string[] }): Promise<EffectivePermissions> {
		const global = this.getGlobalGrants(user.roles);
		return { global, byResource: {} };
	}
}