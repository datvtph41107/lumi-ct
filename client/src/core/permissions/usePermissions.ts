import { useAuth } from '~/hooks/useAuth';
import type { Permission } from '~/types/auth/auth.types';

export const usePermissions = () => {
    const { user } = useAuth();

    const hasPermission = (permission: Permission): boolean => {
        if (!user || !user.permissions) return false;
        return user.permissions[permission] === true;
    };

    const hasAnyPermission = (permissions: Permission[]): boolean => {
        return permissions.some(permission => hasPermission(permission));
    };

    const hasAllPermissions = (permissions: Permission[]): boolean => {
        return permissions.every(permission => hasPermission(permission));
    };

    const hasRole = (role: string): boolean => {
        if (!user) return false;
        return user.role === role;
    };

    const hasAnyRole = (roles: string[]): boolean => {
        return roles.some(role => hasRole(role));
    };

    const hasAllRoles = (roles: string[]): boolean => {
        return roles.every(role => hasRole(role));
    };

    const canAccess = (permissions?: Permission[], roles?: string[], requireAll = false): boolean => {
        if (!user) return false;

        const hasRequiredPermissions = permissions ? 
            (requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions)) : 
            true;

        const hasRequiredRoles = roles ? 
            (requireAll ? hasAllRoles(roles) : hasAnyRole(roles)) : 
            true;

        return hasRequiredPermissions && hasRequiredRoles;
    };

    const getUserPermissions = (): Permission[] => {
        if (!user || !user.permissions) return [];
        return Object.keys(user.permissions).filter(key => user.permissions[key as keyof typeof user.permissions]) as Permission[];
    };

    const getUserRole = (): string => {
        return user?.role || '';
    };

    return {
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        hasRole,
        hasAnyRole,
        hasAllRoles,
        canAccess,
        getUserPermissions,
        getUserRole,
        user,
    };
};