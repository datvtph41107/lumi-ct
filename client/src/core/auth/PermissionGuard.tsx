import React from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '~/redux/slices/auth.slice';
import { authCore } from './AuthCore';

interface PermissionGuardProps {
  children: React.ReactNode;
  resource: string;
  action: string;
  context?: Record<string, any>;
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  resource,
  action,
  context = {},
  fallback = null,
  showFallback = false
}) => {
  const user = useSelector(selectUser);

  if (!user) {
    return showFallback ? <>{fallback}</> : null;
  }

  const hasPermission = authCore.hasPermission(user.id, resource, action, context);

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
}> = ({ children, contractType, fallback }) => (
  <PermissionGuard 
    resource="contract" 
    action="create" 
    context={{ contractType }}
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

export const ContractReadGuard: React.FC<{ 
  children: React.ReactNode; 
  contractId?: number;
  context?: Record<string, any>;
  fallback?: React.ReactNode;
}> = ({ children, contractId, context = {}, fallback }) => (
  <PermissionGuard 
    resource="contract" 
    action="read" 
    context={{ contractId, ...context }}
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

export const ContractUpdateGuard: React.FC<{ 
  children: React.ReactNode; 
  contractId?: number;
  context?: Record<string, any>;
  fallback?: React.ReactNode;
}> = ({ children, contractId, context = {}, fallback }) => (
  <PermissionGuard 
    resource="contract" 
    action="update" 
    context={{ contractId, ...context }}
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

export const ContractDeleteGuard: React.FC<{ 
  children: React.ReactNode; 
  contractId?: number;
  context?: Record<string, any>;
  fallback?: React.ReactNode;
}> = ({ children, contractId, context = {}, fallback }) => (
  <PermissionGuard 
    resource="contract" 
    action="delete" 
    context={{ contractId, ...context }}
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

export const ContractApproveGuard: React.FC<{ 
  children: React.ReactNode; 
  contractId?: number;
  context?: Record<string, any>;
  fallback?: React.ReactNode;
}> = ({ children, contractId, context = {}, fallback }) => (
  <PermissionGuard 
    resource="contract" 
    action="approve" 
    context={{ contractId, ...context }}
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

export const ContractRejectGuard: React.FC<{ 
  children: React.ReactNode; 
  contractId?: number;
  context?: Record<string, any>;
  fallback?: React.ReactNode;
}> = ({ children, contractId, context = {}, fallback }) => (
  <PermissionGuard 
    resource="contract" 
    action="reject" 
    context={{ contractId, ...context }}
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

export const TemplateManageGuard: React.FC<{ 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <PermissionGuard 
    resource="template" 
    action="manage" 
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

export const DashboardViewGuard: React.FC<{ 
  children: React.ReactNode; 
  dashboardType?: string;
  fallback?: React.ReactNode;
}> = ({ children, dashboardType, fallback }) => (
  <PermissionGuard 
    resource="dashboard" 
    action="view" 
    context={{ dashboardType }}
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

export const AnalyticsViewGuard: React.FC<{ 
  children: React.ReactNode; 
  analyticsType?: string;
  fallback?: React.ReactNode;
}> = ({ children, analyticsType, fallback }) => (
  <PermissionGuard 
    resource="dashboard" 
    action="analytics" 
    context={{ analyticsType }}
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

export default PermissionGuard;