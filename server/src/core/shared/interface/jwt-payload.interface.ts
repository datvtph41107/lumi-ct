import { Department } from '@/core/domain/department';
import { Role, AdminRole } from '@/core/shared/enums/base.enums';

interface HeaderOption {
    client_id?: string;
    scope?: string[];
    iat?: number;
    exp?: number;
    jti?: string;
    sessionId?: string;
}

export interface UserJwtPayload extends HeaderOption {
    sub: number;
    username: string;
    roles: Role[];
    permissions: PermissionPayload;
    department: Department | null;
}

export interface AdminJwtPayload extends HeaderOption {
    sub: number;
    roles: AdminRole[];
}

export interface UserContext {
    permissions: PermissionPayload;
    department: Department | null;
}

export interface PermissionPayload {
    create_contract: boolean;
    create_report: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    approve: boolean;
    assign: boolean;
}
