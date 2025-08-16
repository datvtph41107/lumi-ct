export interface RoleDto {
	id: string;
	name: string;
	displayName?: string;
	description?: string;
	priority?: number;
}

export interface RoleListResponse {
	data: RoleDto[];
	total: number;
}

export interface PermissionBinding {
	resource: string;
	action: string;
	conditions?: Record<string, any>;
}

export interface PermissionCatalog {
	resources: string[];
	actions: string[];
}