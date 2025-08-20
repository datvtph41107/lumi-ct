// User interface phù hợp với backend response
export interface User {
    id: number;
    name: string;
    username: string;
    email?: string;
    role: string; // e.g. "ADMIN", "MANAGER"
    status: string; // e.g. "active", "inactive"
    department_id?: number; // optional nếu có
    department?: {
        id: number;
        name: string;
        code: string;
    } | null;
    permissions: {
        create_contract: boolean;
        create_report: boolean;
        read: boolean;
        update: boolean;
        delete: boolean;
        approve: boolean;
        assign: boolean;
    };
}

export interface LoginRequest {
    username: string;
    password: string;
    is_manager_login?: boolean;
}

export interface LoginResponse {
    accessToken: string;
    tokenExpiry: number;
}

// Role constants - sử dụng string để match với backend
export const ROLE = {
    STAFF: 'STAFF',
    MANAGER: 'MANAGER',
    ADMIN: 'ADMIN',
};

export type Role = (typeof ROLE)[keyof typeof ROLE]; // "USER" | "STAFF" | "MANAGER" | "ADMIN"

// Permission constants - match với backend response
export const PERMISSION = {
    // Basic permissions từ backend
    APPROVE: 'approve',
    ASSIGN: 'assign',
    READ: 'read',
    WRITE: 'write',
    DELETE: 'delete',

    // Contract permissions
    CONTRACTS_READ: 'contracts_read',
    CONTRACTS_CREATE: 'contracts_create',
    CONTRACTS_UPDATE: 'contracts_update',
    CONTRACTS_DELETE: 'contracts_delete',
    CONTRACTS_MANAGE: 'contracts_manage',

    // Admin permissions
    ADMIN_ACCESS: 'admin_access',
    USER_MANAGEMENT: 'user_management',
    SYSTEM_SETTINGS: 'system_settings',

    // Team permissions
    TEAM_MANAGEMENT: 'team_management',
    REPORTS_ACCESS: 'reports_access',
} as const;

export type Permission = (typeof PERMISSION)[keyof typeof PERMISSION];

// Route Access Interface - Đơn giản hóa
export interface RouteAccess {
    roles?: Role[];
    permissions?: Permission[];
    requireAll?: boolean; // false = chỉ cần 1 trong các yêu cầu, true = cần tất cả
}

// API Response Types
export interface ApiResponse<T = unknown> {
    success: boolean;
    data: T;
    message: string;
}

export interface LoginApiResponse {
    success: boolean;
    data: {
        user: User;
        accessToken: string;
        tokenExpiry: number;
    };
    message: string;
}

export interface RefreshTokenResponse {
    success: boolean;
    data: {
        accessToken: string;
        tokenExpiry: number;
    };
    message: string;
}

// Helper type để check user status
export const USER_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended',
    PENDING: 'pending',
} as const;

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];
