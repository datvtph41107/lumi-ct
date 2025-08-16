import React, { useEffect, useState, useMemo } from 'react';
import { authCoreService } from './AuthCoreSerivce';
import LoadingSpinner from '~/components/LoadingSpinner';

// Spinner mặc định (không để trong default param)
const defaultSpinner = <LoadingSpinner size="medium" message="Loading permissions..." />;

interface PermissionGuardProps {
    children: React.ReactNode;
    resource: string;
    action: string;
    context?: Record<string, any>;
    fallback?: React.ReactNode;
    showFallback?: boolean;
    loadingFallback?: React.ReactNode;
    onPermissionDenied?: () => void;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
    children,
    resource,
    action,
    context = {},
    fallback = null,
    showFallback = false,
    loadingFallback,
    onPermissionDenied,
}) => {
    const [isLoading, setIsLoading] = useState(!authCoreService.isPermissionsLoaded());
    const [error, setError] = useState<string | null>(null);

    // Memoize context to avoid unnecessary re-renders
    const memoizedContext = useMemo(() => context, [JSON.stringify(context)]);

    useEffect(() => {
        const loadPermissions = async () => {
            if (!authCoreService.isPermissionsLoaded()) {
                setIsLoading(true);
                setError(null);
                try {
                    await authCoreService.loadUserPermissions();
                } catch (error) {
                    console.error('Failed to load permissions:', error);
                    setError('Failed to load permissions. Please try again.');
                } finally {
                    setIsLoading(false);
                }
            }
        };
        loadPermissions();
    }, []);

    // Show loading state
    if (isLoading) {
        return <>{loadingFallback ?? defaultSpinner}</>;
    }

    // Show error state
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                <div className="text-center">
                    <p className="text-red-600 mb-2">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const hasPermission = authCoreService.hasPermission(resource, action, memoizedContext);

    if (!hasPermission) {
        // Call callback if provided
        if (onPermissionDenied) {
            onPermissionDenied();
        }
        
        return showFallback ? <>{fallback}</> : null;
    }

    return <>{children}</>;
};

// Tạo helper để tránh lặp code cho Contract Guards
function createContractGuard(action: string) {
    return ({
        children,
        contractId,
        context = {},
        fallback,
        loadingFallback,
        onPermissionDenied,
    }: {
        children: React.ReactNode;
        contractId?: number;
        context?: Record<string, any>;
        fallback?: React.ReactNode;
        loadingFallback?: React.ReactNode;
        onPermissionDenied?: () => void;
    }) => (
        <PermissionGuard
            resource="contract"
            action={action}
            context={{ contractId, ...context }}
            fallback={fallback}
            loadingFallback={loadingFallback}
            onPermissionDenied={onPermissionDenied}
        >
            {children}
        </PermissionGuard>
    );
}

export const ContractCreateGuard = createContractGuard('create');
export const ContractReadGuard = createContractGuard('read');
export const ContractUpdateGuard = createContractGuard('update');
export const ContractDeleteGuard = createContractGuard('delete');
export const ContractApproveGuard = createContractGuard('approve');
export const ContractRejectGuard = createContractGuard('reject');

export const TemplateManageGuard: React.FC<{
    children: React.ReactNode;
    fallback?: React.ReactNode;
    loadingFallback?: React.ReactNode;
    onPermissionDenied?: () => void;
}> = ({ children, fallback, loadingFallback, onPermissionDenied }) => (
    <PermissionGuard 
        resource="template" 
        action="manage" 
        fallback={fallback} 
        loadingFallback={loadingFallback}
        onPermissionDenied={onPermissionDenied}
    >
        {children}
    </PermissionGuard>
);

export const DashboardViewGuard: React.FC<{
    children: React.ReactNode;
    dashboardType?: string;
    fallback?: React.ReactNode;
    loadingFallback?: React.ReactNode;
    onPermissionDenied?: () => void;
}> = ({ children, dashboardType, fallback, loadingFallback, onPermissionDenied }) => (
    <PermissionGuard
        resource="dashboard"
        action="view"
        context={{ dashboardType }}
        fallback={fallback}
        loadingFallback={loadingFallback}
        onPermissionDenied={onPermissionDenied}
    >
        {children}
    </PermissionGuard>
);

export const AnalyticsViewGuard: React.FC<{
    children: React.ReactNode;
    analyticsType?: string;
    fallback?: React.ReactNode;
    loadingFallback?: React.ReactNode;
    onPermissionDenied?: () => void;
}> = ({ children, analyticsType, fallback, loadingFallback, onPermissionDenied }) => (
    <PermissionGuard
        resource="dashboard"
        action="analytics"
        context={{ analyticsType }}
        fallback={fallback}
        loadingFallback={loadingFallback}
        onPermissionDenied={onPermissionDenied}
    >
        {children}
    </PermissionGuard>
);

// Role Guards with improved error handling
export const RoleGuard: React.FC<{
    children: React.ReactNode;
    role: string;
    scope?: string;
    scopeId?: number;
    fallback?: React.ReactNode;
    onRoleDenied?: () => void;
}> = ({ children, role, scope, scopeId, fallback, onRoleDenied }) => {
    const hasRole = authCoreService.hasRole(role, scope, scopeId);
    
    if (!hasRole) {
        // Call callback if provided
        if (onRoleDenied) {
            onRoleDenied();
        }
        
        return <>{fallback || null}</>;
    }
    return <>{children}</>;
};

export const ContractManagerGuard: React.FC<{
    children: React.ReactNode;
    fallback?: React.ReactNode;
    onRoleDenied?: () => void;
}> = ({ children, fallback, onRoleDenied }) => (
    <RoleGuard role="contract_manager" fallback={fallback} onRoleDenied={onRoleDenied}>
        {children}
    </RoleGuard>
);

export const AccountingStaffGuard: React.FC<{
    children: React.ReactNode;
    fallback?: React.ReactNode;
    onRoleDenied?: () => void;
}> = ({ children, fallback, onRoleDenied }) => (
    <RoleGuard role="accounting_staff" fallback={fallback} onRoleDenied={onRoleDenied}>
        {children}
    </RoleGuard>
);

export const HRStaffGuard: React.FC<{
    children: React.ReactNode;
    fallback?: React.ReactNode;
    onRoleDenied?: () => void;
}> = ({ children, fallback, onRoleDenied }) => (
    <RoleGuard role="hr_staff" fallback={fallback} onRoleDenied={onRoleDenied}>
        {children}
    </RoleGuard>
);

export default PermissionGuard;
