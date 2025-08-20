import React, { useEffect, useState } from 'react';
import { authCoreService } from './AuthCoreService';
import LoadingSpinner from '~/components/LoadingSpinner';

const defaultSpinner = <LoadingSpinner size="medium" message="Loading permissions..." />;

interface PermissionGuardProps {
    children: React.ReactNode;
    resource: string;
    action: string;
    context?: Record<string, unknown>;
    fallback?: React.ReactNode;
    showFallback?: boolean;
    loadingFallback?: React.ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
    children,
    resource,
    action,
    context = {},
    fallback = null,
    showFallback = false,
    loadingFallback,
}) => {
    const [isLoading, setIsLoading] = useState(!authCoreService.isPermissionsLoaded());

    useEffect(() => {
        const loadPermissions = async () => {
            if (!authCoreService.isPermissionsLoaded()) {
                setIsLoading(true);
                try {
                    await authCoreService.loadUserPermissions();
                } catch (error) {
                    console.error('Failed to load permissions:', error);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        void loadPermissions();
    }, []);

    if (isLoading) {
        return <>{loadingFallback ?? defaultSpinner}</>;
    }

    const hasPermission = authCoreService.hasPermission(resource, action, context);

    if (!hasPermission) {
        return showFallback ? <>{fallback}</> : null;
    }

    return <>{children}</>;
};

export default PermissionGuard;
