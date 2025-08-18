export interface LoginRequest {
    username: string;
    password: string;
    is_manager_login?: boolean;
}
export type LoginFormValues = LoginRequest;

export type LoginCredentials = LoginRequest;
export interface RegisterData {
    username: string;
    password: string;
    email?: string;
}