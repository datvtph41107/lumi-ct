import { BaseService } from './base.service';
import type { LoginRequest } from '~/types/auth/auth.types';
import type { ApiResponse, LoginResponse, UserResponse, SessionData } from '~/core/types/api.types';
import type { UserPermissions } from '~/types/auth/permissions.types';

export class AuthService extends BaseService {
    constructor() {
        super();
    }

    async login(body: LoginRequest): Promise<ApiResponse<LoginResponse>> {
        return this.request.public.post<LoginResponse, LoginRequest>('auth/login', body);
    }

    async getCurrentUser(): Promise<ApiResponse<UserResponse>> {
        return this.request.private.get<UserResponse>('auth/me');
    }

    async logout(): Promise<ApiResponse<void>> {
        return this.request.private.post<void>('auth/logout');
    }

    async verifySession(): Promise<ApiResponse<SessionData>> {
        return this.request.private.get<SessionData>('auth/verify-session');
    }

    async refreshToken(): Promise<ApiResponse<{ accessToken: string; tokenExpiry: number; sessionId: string }>> {
        return this.request.private.post<{ accessToken: string; tokenExpiry: number; sessionId: string }>(
            'auth/refresh-token',
        );
    }

    async updateActivity(): Promise<ApiResponse<void>> {
        return this.request.private.post<void>('auth/update-activity');
    }

    async getUserPermissions(): Promise<ApiResponse<UserPermissions>> {
        return this.request.private.get<UserPermissions>('auth/permissions');
    }
}

export const authService = new AuthService();
