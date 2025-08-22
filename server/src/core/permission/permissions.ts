export type Resource = 'contract' | 'template' | 'user' | 'notification' | 'system' | 'department';

export type Action =
	| 'read'
	| 'create'
	| 'update'
	| 'delete'
	| 'approve'
	| 'review'
	| 'export'
	| 'manage_collaborators'
	| 'manage_roles'
	| 'manage_system'
	| 'manage_templates'
	| 'manage_users';

export type Permission = `${Resource}.${Action}` | '*';

export const buildPermission = (resource: Resource, action: Action): Permission => `${resource}.${action}` as Permission;

export const PERMISSIONS = {
	contract: {
		read: 'contract.read' as Permission,
		create: 'contract.create' as Permission,
		update: 'contract.update' as Permission,
		delete: 'contract.delete' as Permission,
		approve: 'contract.approve' as Permission,
		review: 'contract.review' as Permission,
		export: 'contract.export' as Permission,
		manage_collaborators: 'contract.manage_collaborators' as Permission,
	},
	template: {
		read: 'template.read' as Permission,
		create: 'template.create' as Permission,
		update: 'template.update' as Permission,
		delete: 'template.delete' as Permission,
		manage_templates: 'template.manage_templates' as Permission,
	},
	user: {
		read: 'user.read' as Permission,
		create: 'user.create' as Permission,
		update: 'user.update' as Permission,
		delete: 'user.delete' as Permission,
		manage_users: 'user.manage_users' as Permission,
	},
	notification: {
		read: 'notification.read' as Permission,
		create: 'notification.create' as Permission,
		update: 'notification.update' as Permission,
		delete: 'notification.delete' as Permission,
	},
	system: {
		read: 'system.read' as Permission,
		manage_system: 'system.manage_system' as Permission,
	},
	department: {
		read: 'department.read' as Permission,
		manage_roles: 'department.manage_roles' as Permission,
	},
} as const;

export type RoleToPermissions = Record<string, Permission[]>;

export const mergeGrants = (...sets: Array<Permission[]>): Permission[] => {
	const flat = sets.flat();
	if (flat.includes('*')) return ['*'];
	return Array.from(new Set(flat));
};

export const hasPermission = (grants: Permission[], perm: Permission): boolean => {
	if (grants.includes('*')) return true;
	return grants.includes(perm);
};