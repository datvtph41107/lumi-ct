export interface Permission {
    resource: string;
    action: string;
    conditions_schema?: Record<string, any>;
}

export interface Role {
    id: string;
    name: string;
    description?: string;
}

export interface UserRole {
    role: Role;
    scope?: string;
    scope_id?: number;
}

export interface UserPermissions {
    permissions: Permission[];
    roles: Role[];
    scopes: Record<string, any>;
}
