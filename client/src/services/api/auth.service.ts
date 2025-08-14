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
  ResetPasswordData,
  UserPermissions,
  UserRole
} from '~/types/auth/auth.types';

class AuthService extends BaseService {
  constructor() {
    super('/auth');
  }

  async login(credentials: LoginCredentials): Promise<{ data: AuthResponse }> {
    const response = await this.post<AuthResponse>('/login', credentials, {
      withCredentials: true
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

  async getCurrentUser(): Promise<{ data: { user: User } }> {
    const response = await this.get<{ user: User }>('/me', {
      withCredentials: true
    });
    return response;
  }

  async getUserPermissions(): Promise<{ data: { permissions: UserPermissions; roles: UserRole[] } }> {
    const response = await this.get<{ permissions: UserPermissions; roles: UserRole[] }>('/permissions', {
      withCredentials: true
    });
    return response;
  }

  async updateActivity(): Promise<{ data: { message: string } }> {
    const response = await this.post<{ message: string }>('/activity', {}, {
      withCredentials: true
    });
    return response;
  }

  async getActiveSessions(): Promise<{ data: any[] }> {
    const response = await this.get<any[]>('/sessions', {
      withCredentials: true
    });
    return response;
  }

  async revokeSession(sessionId: string): Promise<{ data: { message: string } }> {
    const response = await this.delete<{ message: string }>(`/sessions/${sessionId}`, {
      withCredentials: true
    });
    return response;
  }

  async logoutAllSessions(): Promise<{ data: { message: string } }> {
    const response = await this.post<{ message: string }>('/logout-all', {}, {
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

  // Helper method to get cookies
  getCookies(): { [key: string]: string } {
    const cookies: { [key: string]: string } = {};
    document.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    });
    return cookies;
  }

  // Helper method to check if user has valid session
  hasValidSession(): boolean {
    const cookies = this.getCookies();
    return !!(cookies.refreshToken && cookies.sessionId);
  }

  // Helper method to clear all cookies
  clearCookies(): void {
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.trim().split('=');
      if (name) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });
  }
}

export const authService = new AuthService();
