import React, { ReactNode } from 'react';
import { useAuth } from '~/contexts/AuthContext';
import type { Permission, Role } from '~/types/auth/auth.types';

interface PermissionGuardProps {
    children: ReactNode;
    permissions?: Permission[];
    roles?: Role[];
    requireAll?: boolean;
    fallback?: ReactNode;
    resource?: string;
    action?: string;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
    children,
    permissions = [],
    roles = [],
    requireAll = false,
    fallback = null,
    resource,
    action,
}) => {
    const { user } = useAuth();

    if (!user) {
        return <>{fallback}</>;
    }

    // Check if user has required role
    const hasRequiredRole = roles.length === 0 || roles.includes(user.role as Role);

    // Check if user has required permissions
    const hasRequiredPermissions = (() => {
        if (permissions.length === 0) return true;

        const userPermissions = user.permissions || {};
        
        if (requireAll) {
            return permissions.every(permission => userPermissions[permission]);
        } else {
            return permissions.some(permission => userPermissions[permission]);
        }
    })();

    // Check resource-specific permissions
    const hasResourcePermission = (() => {
        if (!resource || !action) return true;

        const userPermissions = user.permissions || {};
        const resourcePermission = `${resource}_${action}` as Permission;
        
        return userPermissions[resourcePermission] || userPermissions[action as Permission];
    })();

    const hasAccess = hasRequiredRole && hasRequiredPermissions && hasResourcePermission;

    if (!hasAccess) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};

// Higher-order component for permission checking
export const withPermission = <P extends object>(
    Component: React.ComponentType<P>,
    permissions?: Permission[],
    roles?: Role[],
    requireAll = false
) => {
    return (props: P) => (
        <PermissionGuard permissions={permissions} roles={roles} requireAll={requireAll}>
            <Component {...props} />
        </PermissionGuard>
    );
};

// Hook for permission checking
export const usePermission = () => {
    const { user } = useAuth();

    const hasPermission = (permission: Permission): boolean => {
        if (!user) return false;
        return user.permissions?.[permission] || false;
    };

    const hasRole = (role: Role): boolean => {
        if (!user) return false;
        return user.role === role;
    };

    const hasAnyPermission = (permissions: Permission[]): boolean => {
        if (!user) return false;
        return permissions.some(permission => user.permissions?.[permission]);
    };

    const hasAllPermissions = (permissions: Permission[]): boolean => {
        if (!user) return false;
        return permissions.every(permission => user.permissions?.[permission]);
    };

    const hasResourcePermission = (resource: string, action: string): boolean => {
        if (!user) return false;
        const userPermissions = user.permissions || {};
        const resourcePermission = `${resource}_${action}` as Permission;
        return userPermissions[resourcePermission] || userPermissions[action as Permission];
    };

    return {
        hasPermission,
        hasRole,
        hasAnyPermission,
        hasAllPermissions,
        hasResourcePermission,
        user,
    };
};