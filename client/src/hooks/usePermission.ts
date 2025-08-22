import { useMemo } from 'react';
import { authCoreService } from '~/core/auth/AuthCoreService';

export interface PermissionCheck {
    action: string;
    resource: string;
    conditions?: Record<string, unknown>;
}

export function usePermission(resource: string, action: string, conditions?: Record<string, unknown>) {
    return useMemo(
        () => authCoreService.hasPermission(resource, action, conditions),
        [resource, action, JSON.stringify(conditions || {})],
    );
}

export function useAnyPermission(checks: PermissionCheck[]) {
    return useMemo(() => authCoreService.hasAnyPermission(checks), [JSON.stringify(checks || [])]);
}

export function useAllPermissions(checks: PermissionCheck[]) {
    return useMemo(() => authCoreService.hasAllPermissions(checks), [JSON.stringify(checks || [])]);
}
