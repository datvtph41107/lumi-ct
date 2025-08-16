import { BaseService } from './base.service';
import type { ApiResponse } from '~/core/types/api.types';
import type {
    AdminUser,
    CreateAdminUserDto,
    UpdateAdminUserDto,
    UserRoleAssignment,
    EffectivePermission,
} from '~/types/admin/user-admin.types';

class AdminUserService extends BaseService {
    async listUsers(params?: { search?: string; role?: string; departmentId?: number; page?: number; limit?: number }) {
        const query = new URLSearchParams();
        if (params?.search) query.append('search', params.search);
        if (params?.role) query.append('role', params.role);
        if (params?.departmentId) query.append('departmentId', String(params.departmentId));
        if (params?.page) query.append('page', String(params.page));
        if (params?.limit) query.append('limit', String(params.limit));
        const url = `/admin/users${query.toString() ? `?${query.toString()}` : ''}`;
        return this.request.private.get<{ data: AdminUser[]; total: number }>(url);
    }

    async createUser(data: CreateAdminUserDto): Promise<ApiResponse<AdminUser>> {
        return this.request.private.post<AdminUser, CreateAdminUserDto>('/admin/users', data);
    }

    async updateUser(userId: number, data: UpdateAdminUserDto): Promise<ApiResponse<AdminUser>> {
        return this.request.private.put<AdminUser, UpdateAdminUserDto>(`/admin/users/${userId}`, data);
    }

    async deactivateUser(userId: number): Promise<ApiResponse<{ success: boolean }>> {
        return this.request.private.delete<{ success: boolean }>(`/admin/users/${userId}`);
    }

    async getUserRoles(userId: number): Promise<ApiResponse<{ roles: string[] }>> {
        return this.request.private.get<{ roles: string[] }>(`/admin/users/${userId}/roles`);
    }

    async assignRoles(userId: number, assignments: UserRoleAssignment[]): Promise<ApiResponse<{ success: boolean }>> {
        return this.request.private.post<{ success: boolean }, { roles: UserRoleAssignment[] }>(
            `/admin/users/${userId}/roles`,
            { roles: assignments },
        );
    }

    async getEffectivePermissions(userId: number): Promise<ApiResponse<{ permissions: EffectivePermission[] }>> {
        return this.request.private.get<{ permissions: EffectivePermission[] }>(`/admin/users/${userId}/permissions`);
    }
}

export const adminUserService = new AdminUserService();
