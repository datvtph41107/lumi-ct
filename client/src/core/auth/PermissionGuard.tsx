import React, { useEffect, useState } from 'react';
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
		loadPermissions();
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

// Tạo helper để tránh lặp code cho Contract Guards
function createContractGuard(action: string) {
	return ({
		children,
		contractId,
		context = {},
		fallback,
		loadingFallback,
	}: {
		children: React.ReactNode;
		contractId?: number;
		context?: Record<string, any>;
		fallback?: React.ReactNode;
		loadingFallback?: React.ReactNode;
	}) => (
		<PermissionGuard
			resource="contract"
			action={action}
			context={{ contractId, ...context }}
			fallback={fallback}
			loadingFallback={loadingFallback}
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
}> = ({ children, fallback, loadingFallback }) => (
	<PermissionGuard resource="template" action="manage" fallback={fallback} loadingFallback={loadingFallback}>
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

// Role Guards
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