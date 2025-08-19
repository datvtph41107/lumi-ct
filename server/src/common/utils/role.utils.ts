import { Role } from '@/core/shared/enums/base.enums';

export interface UserRoleContext {
    roles?: Role[] | string[];
    role?: Role | string;
}

/**
 * Chuẩn hóa role về dạng string in hoa
 */
function normalizeRole(role: Role | string | undefined): string | undefined {
    if (!role) return undefined;
    return typeof role === 'string' ? role.toUpperCase() : role;
}

/**
 * Lấy danh sách tất cả role (roles[] + role) dưới dạng string
 */
function getAllRoles(user: UserRoleContext): string[] {
    const roles: (Role | string)[] = [...(user.roles ?? []), ...(user.role ? [user.role] : [])];
    return roles.map(normalizeRole).filter((r): r is string => !!r);
}

/**
 * Check nếu user có role cụ thể
 */
export function hasRole(user: UserRoleContext, target: Role | string): boolean {
    const normalizedTarget = normalizeRole(target);
    return getAllRoles(user).includes(normalizedTarget!);
}

/**
 * Check if user has manager role
 */
export function isManager(user: UserRoleContext): boolean {
    return hasRole(user, Role.MANAGER);
}

/**
 * Check if user has staff role
 */
export function isStaff(user: UserRoleContext): boolean {
    return hasRole(user, Role.STAFF);
}

/**
 * Get user's primary role as string
 */
export function getPrimaryRole(user: UserRoleContext): string {
    if (isManager(user)) return 'MANAGER';
    if (isStaff(user)) return 'STAFF';
    return 'UNKNOWN';
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: UserRoleContext, roles: (Role | string)[]): boolean {
    return roles.some((role) => hasRole(user, role));
}
