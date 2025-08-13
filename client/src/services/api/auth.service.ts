import { BaseService } from './base.service';
import type { 
    LoginCredentials, 
    RegisterData, 
    AuthResponse, 
    RefreshTokenResponse, 
    LogoutResponse,
    User,
    ChangePasswordData,
    UpdateProfileData,
    ForgotPasswordData,
    ResetPasswordData
} from '~/types/auth/auth.types';

class AuthService extends BaseService {
    constructor() {
        super('/auth');
    }

    async login(credentials: LoginCredentials): Promise<{ data: AuthResponse }> {
        const response = await this.post<AuthResponse>('/login', credentials, {
            withCredentials: true // Important for httpOnly cookies
        });
        return response;
    }

    async register(data: RegisterData): Promise<{ data: AuthResponse }> {
        const response = await this.post<AuthResponse>('/register', data, {
            withCredentials: true
        });
        return response;
    }

    async logout(): Promise<{ data: LogoutResponse }> {
        const response = await this.post<LogoutResponse>('/logout', {}, {
            withCredentials: true
        });
        return response;
    }

    async refreshToken(): Promise<{ data: RefreshTokenResponse }> {
        const response = await this.post<RefreshTokenResponse>('/refresh', {}, {
            withCredentials: true
        });
        return response;
    }

    async getCurrentUser(): Promise<{ data: User }> {
        const response = await this.get<User>('/me', {
            withCredentials: true
        });
        return response;
    }

    async changePassword(data: ChangePasswordData): Promise<{ data: { message: string } }> {
        const response = await this.post<{ message: string }>('/change-password', data, {
            withCredentials: true
        });
        return response;
    }

    async updateProfile(data: UpdateProfileData): Promise<{ data: User }> {
        const formData = new FormData();
        
        if (data.full_name) formData.append('full_name', data.full_name);
        if (data.email) formData.append('email', data.email);
        if (data.avatar) formData.append('avatar', data.avatar);

        const response = await this.put<User>('/profile', formData, {
            withCredentials: true,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response;
    }

    async forgotPassword(data: ForgotPasswordData): Promise<{ data: { message: string } }> {
        const response = await this.post<{ message: string }>('/forgot-password', data);
        return response;
    }

    async resetPassword(data: ResetPasswordData): Promise<{ data: { message: string } }> {
        const response = await this.post<{ message: string }>('/reset-password', data);
        return response;
    }

    async verifyEmail(token: string): Promise<{ data: { message: string } }> {
        const response = await this.post<{ message: string }>('/verify-email', { token });
        return response;
    }

    async resendVerificationEmail(): Promise<{ data: { message: string } }> {
        const response = await this.post<{ message: string }>('/resend-verification', {}, {
            withCredentials: true
        });
        return response;
    }
}

export const authService = new AuthService();
