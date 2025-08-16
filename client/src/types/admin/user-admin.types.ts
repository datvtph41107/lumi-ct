export interface AdminUser {
    id: number;
    email?: string;
    username: string;
    fullName?: string;
    departmentId?: number;
    role?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateAdminUserDto {
    username: string;
    email?: string;
    password: string;
    fullName?: string;
    departmentId?: number;
    role?: string;
}

export interface UpdateAdminUserDto {
    email?: string;
    fullName?: string;
    departmentId?: number;
    role?: string;
    isActive?: boolean;
}

export interface UserRoleAssignment {
    roleId: string;
    scope?: 'global' | 'department' | 'contract';
    scopeId?: number;
}

export interface EffectivePermission {
    resource: string;
    action: string;
    conditions?: Record<string, any>;
}
