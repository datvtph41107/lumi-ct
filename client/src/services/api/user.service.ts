import { BaseService } from './base.service';
import type { User } from '~/types/auth/auth.types';
import type { ApiResponse } from '~/core/types/api.types';

export interface CreateUserRequest {
    username: string;
    password: string;
    email: string;
    full_name: string;
    role: string;
    department_id?: number;
    is_active?: boolean;
}

export interface UpdateUserRequest {
    username?: string;
    email?: string;
    full_name?: string;
    role?: string;
    department_id?: number;
    is_active?: boolean;
}

export interface UserFilters {
    search?: string;
    role?: string;
    status?: string;
    department_id?: number;
    page?: number;
    limit?: number;
}

export interface UsersResponse {
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export class UserService extends BaseService {
    constructor() {
        super();
    }

    async getUsers(filters?: UserFilters): Promise<ApiResponse<UsersResponse>> {
        const params = new URLSearchParams();
        
        if (filters?.search) params.append('search', filters.search);
        if (filters?.role) params.append('role', filters.role);
        if (filters?.status) params.append('status', filters.status);
        if (filters?.department_id) params.append('department_id', filters.department_id.toString());
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());

        const queryString = params.toString();
        const url = queryString ? `admin/users?${queryString}` : 'admin/users';
        
        return this.request.private.get<UsersResponse>(url);
    }

    async getUser(userId: string): Promise<ApiResponse<User>> {
        return this.request.private.get<User>(`admin/users/${userId}`);
    }

    async createUser(userData: CreateUserRequest): Promise<ApiResponse<User>> {
        return this.request.private.post<User, CreateUserRequest>('admin/users', userData);
    }

    async updateUser(userId: string, userData: UpdateUserRequest): Promise<ApiResponse<User>> {
        return this.request.private.put<User, UpdateUserRequest>(`admin/users/${userId}`, userData);
    }

    async deleteUser(userId: string): Promise<ApiResponse<void>> {
        return this.request.private.delete<void>(`admin/users/${userId}`);
    }

    async bulkDeleteUsers(userIds: string[]): Promise<ApiResponse<void>> {
        return this.request.private.post<void, { userIds: string[] }>('admin/users/bulk-delete', { userIds });
    }

    async activateUser(userId: string): Promise<ApiResponse<User>> {
        return this.request.private.patch<User>(`admin/users/${userId}/activate`);
    }

    async deactivateUser(userId: string): Promise<ApiResponse<User>> {
        return this.request.private.patch<User>(`admin/users/${userId}/deactivate`);
    }

    async suspendUser(userId: string, reason?: string): Promise<ApiResponse<User>> {
        return this.request.private.patch<User, { reason?: string }>(`admin/users/${userId}/suspend`, { reason });
    }

    async resetPassword(userId: string): Promise<ApiResponse<{ temporaryPassword: string }>> {
        return this.request.private.post<{ temporaryPassword: string }>(`admin/users/${userId}/reset-password`);
    }

    async changePassword(userId: string, newPassword: string): Promise<ApiResponse<void>> {
        return this.request.private.post<void, { newPassword: string }>(`admin/users/${userId}/change-password`, { newPassword });
    }

    async assignRole(userId: string, role: string): Promise<ApiResponse<User>> {
        return this.request.private.patch<User, { role: string }>(`admin/users/${userId}/assign-role`, { role });
    }

    async assignDepartment(userId: string, departmentId: number): Promise<ApiResponse<User>> {
        return this.request.private.patch<User, { departmentId: number }>(`admin/users/${userId}/assign-department`, { departmentId });
    }

    async getUserPermissions(userId: string): Promise<ApiResponse<Record<string, boolean>>> {
        return this.request.private.get<Record<string, boolean>>(`admin/users/${userId}/permissions`);
    }

    async updateUserPermissions(userId: string, permissions: Record<string, boolean>): Promise<ApiResponse<void>> {
        return this.request.private.patch<void, { permissions: Record<string, boolean> }>(`admin/users/${userId}/permissions`, { permissions });
    }

    async getUserActivity(userId: string, filters?: { startDate?: string; endDate?: string; page?: number; limit?: number }): Promise<ApiResponse<any>> {
        const params = new URLSearchParams();
        
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());

        const queryString = params.toString();
        const url = queryString ? `admin/users/${userId}/activity?${queryString}` : `admin/users/${userId}/activity`;
        
        return this.request.private.get<any>(url);
    }

    async exportUsers(filters?: UserFilters, format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
        const params = new URLSearchParams();
        
        if (filters?.search) params.append('search', filters.search);
        if (filters?.role) params.append('role', filters.role);
        if (filters?.status) params.append('status', filters.status);
        if (filters?.department_id) params.append('department_id', filters.department_id.toString());
        params.append('format', format);

        const queryString = params.toString();
        const url = queryString ? `admin/users/export?${queryString}` : 'admin/users/export';
        
        const response = await this.request.private.get<Blob>(url, {
            responseType: 'blob',
        });
        
        return response.data;
    }
}

export const userService = new UserService();