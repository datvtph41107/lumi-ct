import { Role } from '@/core/shared/enums/base.enums';

export interface UserRoleContext {
    roles?: Role[] | string[];
    role?: Role | string;
}

/**
 * Check if user has manager role
 */
export function isManager(user: UserRoleContext): boolean {
    if (Array.isArray(user?.roles)) {
        return user.roles.some(role => 
            role === Role.MANAGER || 
            (typeof role === 'string' && role.toUpperCase() === 'MANAGER')
        );
    }
    
    if (user?.role) {
        return user.role === Role.MANAGER || 
               (typeof user.role === 'string' && user.role.toUpperCase() === 'MANAGER');
    }
    
    return false;
}

/**
 * Check if user has staff role
 */
export function isStaff(user: UserRoleContext): boolean {
    if (Array.isArray(user?.roles)) {
        return user.roles.some(role => 
            role === Role.STAFF || 
            (typeof role === 'string' && role.toUpperCase() === 'STAFF')
        );
    }
    
    if (user?.role) {
        return user.role === Role.STAFF || 
               (typeof user.role === 'string' && user.role.toUpperCase() === 'STAFF');
    }
    
    return false;
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
    return roles.some(role => {
        if (role === Role.MANAGER || role === 'MANAGER') return isManager(user);
        if (role === Role.STAFF || role === 'STAFF') return isStaff(user);
        return false;
    });
}