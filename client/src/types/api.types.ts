// Base API Types
export type ApiResponse<T = unknown> = import('~/core/types/api.types').ApiResponse<T>;

export interface ApiError {
    message: string;
    statusCode: number;
    error?: string;
    details?: unknown;
}

export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

// Auth Types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    accessToken: string;
    user: User;
}

export interface User {
    id: string;
    email: string;
    name: string;
    role: string;
}

export interface RefreshTokenResponse {
    accessToken: string;
}
