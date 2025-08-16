import { BaseService } from './base.service';
import type { ApiResponse } from '~/core/types/api.types';

export interface Permission {
    id: string;
    resource: string;
    action: string;
    display_name?: string;
    description?: string;
    is_active: boolean;
}

export interface Role {
    id: string;
    name: string;
    display_name?: string;
    description?: string;
    is_active: boolean;
    permissions: string[];
    scope: string;
    scope_id?: number;
}

export interface UserPermissions {
    permissions: Permission[];
    roles: Role[];
    effective_permissions: string[];
}

class PermissionService extends BaseService {
    async getUserPermissions(): Promise<ApiResponse<UserPermissions>> {
        return await this.request.private.get<UserPermissions>('/auth/permissions');
    }

    async checkPermission(resource: string, action: string): Promise<ApiResponse<{ hasPermission: boolean }>> {
        return await this.request.private.post<{ hasPermission: boolean }, { resource: string; action: string }>(
            '/auth/check-permission',
            { resource, action }
        );
    }

    async getUserRoles(): Promise<ApiResponse<Role[]>> {
        return await this.request.private.get<Role[]>('/auth/roles');
    }

    async assignRoleToUser(userId: number, roleId: string, scope?: string, scopeId?: number): Promise<ApiResponse<{ success: boolean }>> {
        return await this.request.private.post<{ success: boolean }, { role_id: string; scope?: string; scope_id?: number }>(
            `/users/${userId}/roles`,
            { role_id: roleId, scope, scope_id: scopeId }
        );
    }

    async removeRoleFromUser(userId: number, roleId: string): Promise<ApiResponse<{ success: boolean }>> {
        return await this.request.private.delete<{ success: boolean }>(`/users/${userId}/roles/${roleId}`);
    }

    async getRolePermissions(roleId: string): Promise<ApiResponse<{ permissions: Permission[] }>> {
        return await this.request.private.get<{ permissions: Permission[] }>(`/roles/${roleId}/permissions`);
    }

    async setRolePermissions(roleId: string, permissions: string[]): Promise<ApiResponse<{ success: boolean }>> {
        return await this.request.private.put<{ success: boolean }, { permissions: string[] }>(
            `/roles/${roleId}/permissions`,
            { permissions }
        );
    }
}

export const permissionService = new PermissionService();