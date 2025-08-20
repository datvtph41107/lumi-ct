import { Role } from '@/core/shared/enums/base.enums';

export interface UserRoleContext {
    role?: Role | string;
    roles?: Array<Role | string>;
}

export function isManager(ctx: UserRoleContext | undefined | null): boolean {
    if (!ctx) return false;
    const roles: Array<string> = (
        (Array.isArray(ctx.roles) ? ctx.roles : [ctx.role]).filter(Boolean) as Array<Role | string>
    ).map((r) => String(r).toUpperCase());
    return roles.includes('MANAGER');
}

export function getPrimaryRole(ctx: UserRoleContext | undefined | null): string | undefined {
    if (!ctx) return undefined;
    const roles: Array<string> = (
        (Array.isArray(ctx.roles) ? ctx.roles : [ctx.role]).filter(Boolean) as Array<Role | string>
    ).map((r) => String(r).toUpperCase());
    return roles[0];
}
