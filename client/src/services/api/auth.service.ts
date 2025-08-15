import { BaseService } from './base.service';
import type { LoginRequest, LoginResponse, User, RefreshTokenResponse } from '~/types/auth/auth.types';
import type { ApiResponse } from '~/core/types/api.types';

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

    async verifySession(): Promise<ApiResponse<User>> {
        return this.request.private.get<User>('auth/verify-session');
    }

    async refreshToken(): Promise<ApiResponse<RefreshTokenResponse>> {
        return this.request.private.post<RefreshTokenResponse>('auth/refresh-token');
    }

    async updateActivity(): Promise<ApiResponse<void>> {
        return this.request.private.post<void>('auth/update-activity');
    }
}

export const authService = new AuthService();
