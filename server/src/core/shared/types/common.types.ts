/**
 * Common type definitions for the application
 */

// Base types
export type ID = string | number;
export type Timestamp = Date | string;

// API Response types
export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
}

export interface ApiErrorResponse {
    success: false;
    message: string | string[];
    error: {
        name?: string;
        details?: unknown;
    };
}

export interface ApiSuccessResponse<T = unknown> {
    success: true;
    message: string;
    data: T;
}

// Pagination types
export interface PaginationQuery {
    page?: number;
    limit?: number;
    search?: string;
}

export interface PaginationMeta {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
}

export interface PaginatedResponse<T> {
    items: T[];
    meta: PaginationMeta;
}

// Filter types
export interface DateRangeFilter {
    date_from?: string;
    date_to?: string;
}

export interface BaseFilter extends PaginationQuery, DateRangeFilter {
    [key: string]: unknown;
}

// Context types
export interface RequestContext {
    userId: number;
    roles: string[];
    permissions: Record<string, boolean>;
    department?: string;
}

export interface UserContext {
    id: number;
    username: string;
    email: string;
    roles: string[];
    permissions: Record<string, boolean>;
    department?: {
        id: number;
        name: string;
        code: string;
    };
}

// Database operation types
export interface CreateResult {
    id: ID;
    created_at: Date;
}

export interface UpdateResult {
    affected: number;
    updated_at: Date;
}

export interface DeleteResult {
    affected: number;
    deleted_at: Date;
}

// Error types
export interface ValidationError {
    field: string;
    message: string;
    value?: unknown;
}

export interface BusinessError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}
