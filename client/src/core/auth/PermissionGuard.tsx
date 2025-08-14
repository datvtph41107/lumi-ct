import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectIsPermissionsLoaded } from '~/redux/slices/auth.slice';
import { authCoreService } from './AuthCoreService';
import LoadingSpinner from '../UI/LoadingSpinner';

interface PermissionGuardProps {
  children: React.ReactNode;
  resource: string;
  action: string;
  context?: Record<string, any>;
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
  loadingFallback = <LoadingSpinner />
}) => {
  const isPermissionsLoaded = useSelector(selectIsPermissionsLoaded);
  const [isLoading, setIsLoading] = useState(!isPermissionsLoaded);

  useEffect(() => {
    const loadPermissions = async () => {
      if (!isPermissionsLoaded) {
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

    loadPermissions();
  }, [isPermissionsLoaded]);

  if (isLoading) {
    return <>{loadingFallback}</>;
  }

  const hasPermission = authCoreService.hasPermission(resource, action, context);

  if (!hasPermission) {
    return showFallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};

// Contract-specific permission guards
export const ContractCreateGuard: React.FC<{ 
  children: React.ReactNode; 
  contractType?: string;
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
}> = ({ children, contractType, fallback, loadingFallback }) => (
  <PermissionGuard 
    resource="contract" 
    action="create" 
    context={{ contractType }}
    fallback={fallback}
    loadingFallback={loadingFallback}
  >
    {children}
  </PermissionGuard>
);

export const ContractReadGuard: React.FC<{ 
  children: React.ReactNode; 
  contractId?: number;
  context?: Record<string, any>;
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
}> = ({ children, contractId, context = {}, fallback, loadingFallback }) => (
  <PermissionGuard 
    resource="contract" 
    action="read" 
    context={{ contractId, ...context }}
    fallback={fallback}
    loadingFallback={loadingFallback}
  >
    {children}
  </PermissionGuard>
);

export const ContractUpdateGuard: React.FC<{ 
  children: React.ReactNode; 
  contractId?: number;
  context?: Record<string, any>;
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
}> = ({ children, contractId, context = {}, fallback, loadingFallback }) => (
  <PermissionGuard 
    resource="contract" 
    action="update" 
    context={{ contractId, ...context }}
    fallback={fallback}
    loadingFallback={loadingFallback}
  >
    {children}
  </PermissionGuard>
);

export const ContractDeleteGuard: React.FC<{ 
  children: React.ReactNode; 
  contractId?: number;
  context?: Record<string, any>;
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
}> = ({ children, contractId, context = {}, fallback, loadingFallback }) => (
  <PermissionGuard 
    resource="contract" 
    action="delete" 
    context={{ contractId, ...context }}
    fallback={fallback}
    loadingFallback={loadingFallback}
  >
    {children}
  </PermissionGuard>
);

export const ContractApproveGuard: React.FC<{ 
  children: React.ReactNode; 
  contractId?: number;
  context?: Record<string, any>;
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
}> = ({ children, contractId, context = {}, fallback, loadingFallback }) => (
  <PermissionGuard 
    resource="contract" 
    action="approve" 
    context={{ contractId, ...context }}
    fallback={fallback}
    loadingFallback={loadingFallback}
  >
    {children}
  </PermissionGuard>
);

export const ContractRejectGuard: React.FC<{ 
  children: React.ReactNode; 
  contractId?: number;
  context?: Record<string, any>;
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
}> = ({ children, contractId, context = {}, fallback, loadingFallback }) => (
  <PermissionGuard 
    resource="contract" 
    action="reject" 
    context={{ contractId, ...context }}
    fallback={fallback}
    loadingFallback={loadingFallback}
  >
    {children}
  </PermissionGuard>
);

export const TemplateManageGuard: React.FC<{ 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
}> = ({ children, fallback, loadingFallback }) => (
  <PermissionGuard 
    resource="template" 
    action="manage" 
    fallback={fallback}
    loadingFallback={loadingFallback}
  >
    {children}
  </PermissionGuard>
);

export const DashboardViewGuard: React.FC<{ 
  children: React.ReactNode; 
  dashboardType?: string;
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
}> = ({ children, dashboardType, fallback, loadingFallback }) => (
  <PermissionGuard 
    resource="dashboard" 
    action="view" 
    context={{ dashboardType }}
    fallback={fallback}
    loadingFallback={loadingFallback}
  >
    {children}
  </PermissionGuard>
);

export const AnalyticsViewGuard: React.FC<{ 
  children: React.ReactNode; 
  analyticsType?: string;
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
}> = ({ children, analyticsType, fallback, loadingFallback }) => (
  <PermissionGuard 
    resource="dashboard" 
    action="analytics" 
    context={{ analyticsType }}
    fallback={fallback}
    loadingFallback={loadingFallback}
  >
    {children}
  </PermissionGuard>
);

// Role-based guards
export const RoleGuard: React.FC<{ 
  children: React.ReactNode; 
  role: string;
  scope?: string;
  scopeId?: number;
  fallback?: React.ReactNode;
}> = ({ children, role, scope, scopeId, fallback }) => {
  const hasRole = authCoreService.hasRole(role, scope, scopeId);
  
  if (!hasRole) {
    return <>{fallback}</> || null;
  }

  return <>{children}</>;
};

export const ContractManagerGuard: React.FC<{ 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <RoleGuard role="contract_manager" fallback={fallback}>
    {children}
  </RoleGuard>
);

export const AccountingStaffGuard: React.FC<{ 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <RoleGuard role="accounting_staff" fallback={fallback}>
    {children}
  </RoleGuard>
);

export const HRStaffGuard: React.FC<{ 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <RoleGuard role="hr_staff" fallback={fallback}>
    {children}
  </RoleGuard>
);

export default PermissionGuard;