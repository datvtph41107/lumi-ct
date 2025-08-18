export interface UserResponse {
    id: number;
    name: string;
    username: string;
    role: string;
    status: string;
    department_id?: number;
    department_name?: string;
    created_at: Date;
    updated_at: Date;
}

export interface RoleResponse {
    id: string;
    name: string;
    displayName?: string;
    description?: string;
    priority?: number;
    created_at: Date;
    updated_at: Date;
}

export interface PermissionResponse {
    id: string;
    resource: string;
    action: string;
    display_name?: string;
    is_active: boolean;
    conditions_schema?: Record<string, any>;
}

export interface UserPermissionResponse {
    user_id: number;
    permissions: PermissionResponse[];
}

export interface RolePermissionResponse {
    role_id: string;
    permissions: PermissionResponse[];
}

export interface SystemNotificationResponse {
    id: string;
    title: string;
    message: string;
    type: string;
    department_ids?: number[];
    user_ids?: number[];
    scheduled_at?: Date;
    repeat_pattern?: string;
    created_at: Date;
    updated_at: Date;
}

export interface AuditLogResponse {
    id: string;
    user_id: number;
    user_name: string;
    action: string;
    resource: string;
    resource_id?: string;
    details?: Record<string, any>;
    ip_address?: string;
    user_agent?: string;
    created_at: Date;
}

export interface PermissionCatalogResponse {
    resources: string[];
    actions: string[];
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
}