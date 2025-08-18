/**
 * Authentication and authorization type definitions
 */

import { Department } from '@/core/domain/department';
import { Role, AdminRole, Permission } from '@/core/shared/enums/base.enums';

// JWT Payload types
export interface BaseJwtPayload {
    client_id?: string;
    scope?: string[];
    iat?: number;
    exp?: number;
    jti?: string;
    sessionId?: string;
}

export interface UserContext {
    permissions: {
        create_contract: boolean;
        create_report: boolean;
        read: boolean;
        update: boolean;
        delete: boolean;
        approve: boolean;
        assign: boolean;
    };
    department: Department | null;
}

export interface UserJwtPayload extends BaseJwtPayload {
    sub: number;
    username: string;
    email: string;
    roles: Role[];
    permissions: PermissionSet;
    department?: {
        id: number;
        name: string;
        code: string;
    };
}

export interface AdminJwtPayload extends BaseJwtPayload {
    sub: number;
    username: string;
    roles: AdminRole[];
}

// Permission types
export interface PermissionSet {
    [Permission.CREATE_CONTRACT]: boolean;
    [Permission.CREATE_REPORT]: boolean;
    [Permission.READ]: boolean;
    [Permission.UPDATE]: boolean;
    [Permission.DELETE]: boolean;
    [Permission.APPROVE]: boolean;
    [Permission.ASSIGN]: boolean;
}

export interface PermissionCheck {
    resource: string;
    action: string;
    conditions?: Record<string, unknown>;
}

export interface UserPermissions {
    userId: number;
    permissions: PermissionSet | RolePermission[];
    roles: Role[];
    scopes: Record<string, unknown>;
}

export interface RolePermission {
    resource: string;
    action: string;
    conditions_schema?: Record<string, unknown>;
    is_active: boolean;
}

// Authentication types
export interface LoginCredentials {
    username: string;
    password: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface SessionData {
    userId: number;
    sessionId: string;
    userAgent?: string;
    ipAddress?: string;
    createdAt: Date;
    expiresAt: Date;
}

// Request context types
export interface AuthenticatedRequest {
    user: UserJwtPayload;
    sessionId: string;
}

export interface RequestWithUser extends Request {
    user: UserJwtPayload;
    cookies: Record<string, string>;
}
