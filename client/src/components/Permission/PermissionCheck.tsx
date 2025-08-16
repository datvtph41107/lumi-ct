import React from 'react';
import { usePermissions } from '~/core/permissions';
import type { Permission } from '~/types/auth/auth.types';

interface PermissionCheckProps {
    children: React.ReactNode;
    permission: Permission;
    fallback?: React.ReactNode;
    showFallback?: boolean;
}

export const PermissionCheck: React.FC<PermissionCheckProps> = ({
    children,
    permission,
    fallback = null,
    showFallback = false,
}) => {
    const { hasPermission } = usePermissions();

    if (hasPermission(permission)) {
        return <>{children}</>;
    }

    if (showFallback) {
        return <>{fallback}</>;
    }

    return null;
};

interface MultiPermissionCheckProps {
    children: React.ReactNode;
    permissions: Permission[];
    requireAll?: boolean;
    fallback?: React.ReactNode;
    showFallback?: boolean;
}

export const MultiPermissionCheck: React.FC<MultiPermissionCheckProps> = ({
    children,
    permissions,
    requireAll = false,
    fallback = null,
    showFallback = false,
}) => {
    const { hasAnyPermission, hasAllPermissions } = usePermissions();

    const hasAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);

    if (hasAccess) {
        return <>{children}</>;
    }

    if (showFallback) {
        return <>{fallback}</>;
    }

    return null;
};

export default PermissionCheck;