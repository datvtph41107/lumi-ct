import { PERMISSIONS, Permission } from './permissions';
import { Role } from '@/core/shared/enums/base.enums';

export type RoleToPermissions = Record<string, Permission[]>;

export const BASE_MATRIX: RoleToPermissions = {
	[Role.USER]: [
		PERMISSIONS.contract.read,
		PERMISSIONS.contract.create,
		PERMISSIONS.contract.update,
		PERMISSIONS.contract.export,
		PERMISSIONS.template.read,
	],
	[Role.MANAGER]: [
		'*',
	],
	[Role.ADMIN]: [
		'*',
	],
};

export const mergeGrants = (...sets: Array<Permission[]>): Permission[] => {
	const flat = sets.flat();
	if (flat.includes('*')) return ['*'];
	return Array.from(new Set(flat));
};

export const hasPermission = (grants: Permission[], perm: Permission): boolean => {
	if (grants.includes('*')) return true;
	return grants.includes(perm);
};