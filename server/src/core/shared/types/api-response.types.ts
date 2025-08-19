/**
 * Standard API response types
 */

export interface ApiSuccessResponse<T = any> {
    success: true;
    data?: T;
    message?: string;
}

export interface ApiErrorResponse {
    success: false;
    error: string;
    message?: string;
    details?: any;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page?: number;
    limit?: number;
}

// User Management Types
export interface UserResponse {
    id: number;
    username: string;
    role: string;
    isActive: boolean;
    department?: {
        id: number;
        name: string;
        code: string;
    };
}

export interface CreateUserRequest {
    username: string;
    password: string;
    role: 'MANAGER' | 'STAFF';
    departmentId?: number;
}

export interface UpdateUserRequest {
    username?: string;
    role?: 'MANAGER' | 'STAFF';
    departmentId?: number;
    isActive?: boolean;
}

// Role Management Types
export interface RoleResponse {
    id: string;
    name: string;
    displayName?: string;
    description?: string;
}

export interface RoleAssignmentRequest {
    roles: Array<{
        roleId: string;
        scope?: string;
        scopeId?: number;
    }>;
}

export interface UserRolesResponse {
    roles: string[];
}

// Permission Types
export interface PermissionResponse {
    resource: string;
    action: string;
    conditions?: any;
}

export interface RolePermissionsResponse {
    permissions: PermissionResponse[];
}

export interface PermissionCatalogResponse {
    resources: string[];
    actions: string[];
}

export interface UserCapabilitiesResponse {
    capabilities: {
        is_manager: boolean;
    };
}

// Department Types
export interface DepartmentResponse {
    id: number;
    name: string;
    code: string;
    managerId?: number;
    manager?: {
        id: number;
        username: string;
    };
}

export interface UpdateDepartmentManagerRequest {
    id_manager: number;
}

// Auth Types
export interface LoginResponse {
    accessToken: string;
    tokenExpiry: number;
    user: {
        id: number;
        username: string;
        role: string;
        isManager: boolean;
        department: {
            id: number;
            name: string;
            code: string;
        } | null;
        permissions: any;
    };
}

export interface RefreshTokenResponse {
    accessToken: string;
    sessionId: string;
    tokenExpiry: number;
}

export interface SessionVerificationResponse {
    isValid: boolean;
    sessionId?: string;
    lastActivity?: string;
}
