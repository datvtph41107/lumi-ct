import { Request } from 'express';
import { PermissionPayload } from './jwt-payload.interface';
import { Department } from '@/core/domain/department';

export interface HeaderUserPayload {
    sub: number;
    username: string;
    permissions: PermissionPayload;
    department: Department | null;
    roles?: string[];
    scope?: string[];
    iat?: number; // issued at
    exp?: number; // expiry
    jti?: string; // token ID
    sessionId?: string;
}

export interface HeaderRequest extends Request {
    user: HeaderUserPayload;
    // data?: Record<string, unknown> | null;
}
