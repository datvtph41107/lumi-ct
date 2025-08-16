import React from 'react';
import { useAuth } from '~/hooks/useAuth';
import type { Permission } from '~/types/auth/auth.types';

interface PermissionGuardProps {
    children: React.ReactNode;
    permissions?: Permission[];
    roles?: string[];
    requireAll?: boolean;
    fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
    children,
    permissions = [],
    roles = [],
    requireAll = false,
    fallback = null,
}) => {
    const { user } = useAuth();

    if (!user) {
        return <>{fallback}</>;
    }

    const hasRequiredPermissions = () => {
        if (permissions.length === 0) return true;

        const userPermissions = user.permissions || {};
        const userPermissionKeys = Object.keys(userPermissions).filter(key => userPermissions[key as keyof typeof userPermissions]);

        if (requireAll) {
            return permissions.every(permission => userPermissionKeys.includes(permission));
        } else {
            return permissions.some(permission => userPermissionKeys.includes(permission));
        }
    };

    const hasRequiredRoles = () => {
        if (roles.length === 0) return true;

        if (requireAll) {
            return roles.every(role => user.role === role);
        } else {
            return roles.some(role => user.role === role);
        }
    };

    const hasAccess = hasRequiredPermissions() && hasRequiredRoles();

    if (!hasAccess) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};

export default PermissionGuard;