import { BaseService } from './base.service';
import type { LoginRequest, User } from '~/types/auth/auth.types';
import type { ApiResponse, LoginResponse, SessionData } from '~/core/types/api.types';
import type { UserPermissions } from '~/types/auth/permissions.types';

export class AuthService extends BaseService {
    constructor() {
        super();
    }

    async login(body: LoginRequest): Promise<ApiResponse<LoginResponse>> {
        return this.request.public.post<LoginResponse, LoginRequest>('auth/login', body);
    }

    async getCurrentUser(): Promise<ApiResponse<User>> {
        return this.request.private.get<User>('auth/me');
    }

    async logout(): Promise<ApiResponse<void>> {
        return this.request.private.post<void>('auth/logout');
    }

    async verifySession(): Promise<ApiResponse<SessionData>> {
        return this.request.private.get<SessionData>('auth/verify-session');
    }

    async refreshToken(): Promise<ApiResponse<LoginResponse>> {
        // Use public client to avoid auth interceptor recursion
        return this.request.public.post<LoginResponse>('auth/refresh-token');
    }

    async updateActivity(): Promise<ApiResponse<void>> {
        return this.request.private.post<void>('auth/update-activity');
    }

    async getUserPermissions(): Promise<ApiResponse<UserPermissions>> {
        return this.request.private.get<UserPermissions>('auth/permissions');
    }
}

export const authService = new AuthService();
