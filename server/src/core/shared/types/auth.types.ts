/**
 * Authentication and authorization type definitions
 */

import { Department } from '@/core/domain/department';
import { Role, AdminRole } from '@/core/shared/enums/base.enums';
import { CollaboratorRole } from '@/core/domain/permission/collaborator-role.enum';

// JWT Payload types
export interface BaseJwtPayload {
    client_id?: string;
    scope?: string[];
    iat?: number;
    exp?: number;
    jti?: string;
    sessionId?: string;
}

export interface PermissionSet {
    create_contract: boolean;
    create_report: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    approve: boolean;
    assign: boolean;
}

export interface UserContext {
    permissions: PermissionSet;
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

// Permission types used by AuthService and guards
export interface RolePermission {
    resource: string;
    action: string;
    is_active: boolean;
    conditions_schema?: Record<string, unknown>;
}

export interface UserPermissions {
    userId: number;
    permissions: RolePermission[];
    roles: any[];
    scopes: Record<string, unknown>;
}

export interface PermissionCheck {
    resource: string;
    action: string;
    conditions?: Record<string, unknown>;
}

// Collaborator capability view for frontend and guards
export interface CollaboratorCapabilities {
    is_owner: boolean;
    can_edit: boolean; // true if owner or manager
    can_review: boolean; // true if reviewer or owner or manager
    can_view: boolean; // true if viewer/reviewer/owner or manager
    role?: CollaboratorRole | null;
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
