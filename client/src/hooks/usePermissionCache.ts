import { useState, useEffect, useCallback } from 'react';
import { permissionService } from '~/services/api/permission.service';
import type { Permission, Role } from '~/services/api/permission.service';

interface PermissionCache {
    permissions: Permission[];
    roles: Role[];
    effectivePermissions: string[];
    lastUpdated: number;
    isLoading: boolean;
    error: string | null;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const usePermissionCache = () => {
    const [cache, setCache] = useState<PermissionCache>({
        permissions: [],
        roles: [],
        effectivePermissions: [],
        lastUpdated: 0,
        isLoading: false,
        error: null,
    });

    const isCacheValid = useCallback(() => {
        return Date.now() - cache.lastUpdated < CACHE_DURATION;
    }, [cache.lastUpdated]);

    const loadPermissions = useCallback(async (forceRefresh = false) => {
        if (!forceRefresh && isCacheValid() && cache.permissions.length > 0) {
            return cache;
        }

        setCache(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await permissionService.getUserPermissions();
            
            if (response.success) {
                const newCache: PermissionCache = {
                    permissions: response.data.permissions,
                    roles: response.data.roles,
                    effectivePermissions: response.data.effective_permissions,
                    lastUpdated: Date.now(),
                    isLoading: false,
                    error: null,
                };
                
                setCache(newCache);
                return newCache;
            } else {
                throw new Error(response.message || 'Failed to load permissions');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setCache(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            throw error;
        }
    }, [cache.permissions.length, isCacheValid]);

    const refreshPermissions = useCallback(() => {
        return loadPermissions(true);
    }, [loadPermissions]);

    const hasPermission = useCallback((permission: string): boolean => {
        return cache.effectivePermissions.includes(permission);
    }, [cache.effectivePermissions]);

    const hasAnyPermission = useCallback((permissions: string[]): boolean => {
        return permissions.some(permission => hasPermission(permission));
    }, [hasPermission]);

    const hasAllPermissions = useCallback((permissions: string[]): boolean => {
        return permissions.every(permission => hasPermission(permission));
    }, [hasPermission]);

    const hasRole = useCallback((roleName: string): boolean => {
        return cache.roles.some(role => role.name === roleName && role.is_active);
    }, [cache.roles]);

    const hasAnyRole = useCallback((roleNames: string[]): boolean => {
        return roleNames.some(roleName => hasRole(roleName));
    }, [hasRole]);

    const hasAllRoles = useCallback((roleNames: string[]): boolean => {
        return roleNames.every(roleName => hasRole(roleName));
    }, [hasRole]);

    const canAccess = useCallback((
        permissions?: string[], 
        roles?: string[], 
        requireAll = false
    ): boolean => {
        const hasRequiredPermissions = permissions ? 
            (requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions)) : 
            true;

        const hasRequiredRoles = roles ? 
            (requireAll ? hasAllRoles(roles) : hasAnyRole(roles)) : 
            true;

        return hasRequiredPermissions && hasRequiredRoles;
    }, [hasAnyPermission, hasAllPermissions, hasAnyRole, hasAllRoles]);

    // Auto-load permissions on mount
    useEffect(() => {
        loadPermissions();
    }, [loadPermissions]);

    return {
        // Cache state
        permissions: cache.permissions,
        roles: cache.roles,
        effectivePermissions: cache.effectivePermissions,
        isLoading: cache.isLoading,
        error: cache.error,
        lastUpdated: cache.lastUpdated,

        // Actions
        loadPermissions,
        refreshPermissions,

        // Permission checks
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,

        // Role checks
        hasRole,
        hasAnyRole,
        hasAllRoles,

        // Combined checks
        canAccess,

        // Utility
        isCacheValid,
    };
};