/**
 * Authentication and authorization type definitions
 */

import { Department } from '@/core/domain/department';
import { Role, AdminRole } from '@/core/shared/enums/base.enums';

// JWT Payload types
export interface BaseJwtPayload {
    client_id?: string;
    scope?: string[];
    iat?: number;
    exp?: number;
    jti?: string;
    sessionId?: string;
}

export interface UiCapabilities {
    is_manager: boolean;
}

export interface UserContext {
    capabilities: UiCapabilities;
    department: Department | null;
}

export interface UserJwtPayload extends BaseJwtPayload {
    sub: number;
    username: string;
    email: string;
    roles: Role[];
    permissions: UiCapabilities; // kept name for backward compat with HeaderUserPayload
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

// Removed dynamic permission engine types to simplify model.

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
