import { BaseService } from './base.service';
import type { LoginRequest, User } from '~/types/auth/auth.types';
import type { ApiResponse, LoginResponse, RefreshTokenResponse, SessionData } from '~/core/types/api.types';

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

    async refreshToken(): Promise<ApiResponse<RefreshTokenResponse>> {
        // Use public client to avoid private interceptor token dependency
        return this.request.public.post<RefreshTokenResponse>('auth/refresh-token');
    }

    async updateActivity(): Promise<ApiResponse<void>> {
        return this.request.private.post<void>('auth/update-activity');
    }

    async getUserPermissions(): Promise<ApiResponse<any>> {
        return this.request.private.get<any>('auth/permissions');
    }
}

export const authService = new AuthService();
