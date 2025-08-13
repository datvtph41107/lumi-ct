export interface User {
    id: number;
    username: string;
    email: string;
    full_name: string;
    avatar?: string;
    role: UserRole;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
    MANAGER = 'manager'
}

export interface LoginCredentials {
    email: string;
    password: string;
    remember_me?: boolean;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    confirm_password: string;
    full_name: string;
}

export interface AuthResponse {
    user: User;
    message: string;
}

export interface RefreshTokenResponse {
    user: User;
    message: string;
}

export interface LogoutResponse {
    message: string;
}

export interface ChangePasswordData {
    current_password: string;
    new_password: string;
    confirm_password: string;
}

export interface UpdateProfileData {
    full_name?: string;
    avatar?: File;
    email?: string;
}

export interface ForgotPasswordData {
    email: string;
}

export interface ResetPasswordData {
    token: string;
    password: string;
    confirm_password: string;
}