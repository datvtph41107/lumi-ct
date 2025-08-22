import { store } from '~/redux/store';
import {
    selectUser,
    selectUserPermissions,
    selectIsPermissionsLoaded,
    selectPermissionCache,
    setPermissionCache,
    clearPermissionCache as clearPermissionCacheAction,
    getUserPermissions,
} from '~/redux/slices/auth.slice';
import { createAcl } from '~/utils/acl';
import { Logger } from '../Logger';

const logger = Logger.getInstance();
export interface PermissionCheck {
    resource: string;
    action: string;
    conditions?: Record<string, unknown>;
}

class AuthCoreService {
    private static instance: AuthCoreService;
    private acl = createAcl({ grants: [] });

    private constructor() {}

    public static getInstance(): AuthCoreService {
        if (!AuthCoreService.instance) {
            AuthCoreService.instance = new AuthCoreService();
        }
        return AuthCoreService.instance;
    }

    // ==================== PERMISSION CHECKING (client-side, minimal) ====================
    // Client defers enforcement to server guards. We only gate obvious manager-only actions.

    hasPermission(resource: string, action: string, conditions?: Record<string, unknown>): boolean {
        const state = store.getState();
        const user = selectUser(state);
        const userPerms = selectUserPermissions(state);
        const permissionCache = selectPermissionCache(state);

        if (!user) return false;

        const cacheKey = `${user.id}:${resource}:${action}:${JSON.stringify(conditions || {})}`;
        if (permissionCache.has(cacheKey)) return permissionCache.get(cacheKey)!;

        // Prefer ACL grants if available
        if (userPerms?.capabilities?.grants) {
            this.acl.setGrants((userPerms.capabilities.grants as string[]) || []);
            const allowed = this.acl.can(resource, action);
            logger.info(`Checking permission for ${user.id}: ${resource}.${action}`);
            logger.info(`allowedr ${allowed}`);

            store.dispatch(setPermissionCache({ key: cacheKey, value: allowed }));
            return allowed;
        }

        // Fallback legacy behavior if grants not provided
        const isManager = user.role?.toUpperCase() === 'MANAGER' || !!userPerms?.capabilities?.is_manager;
        const allowed = resource === 'contract' && (action === 'approve' || action === 'reject') ? isManager : true;
        store.dispatch(setPermissionCache({ key: cacheKey, value: allowed }));
        return allowed;
    }

    hasAnyPermission(permissions: PermissionCheck[]): boolean {
        return permissions.some((p) => this.hasPermission(p.resource, p.action, p.conditions));
    }

    hasAllPermissions(permissions: PermissionCheck[]): boolean {
        return permissions.every((p) => this.hasPermission(p.resource, p.action, p.conditions));
    }

    // ==================== ROLE CHECKING (mapped to SystemRole) ====================

    hasRole(roleName: string): boolean {
        const user = selectUser(store.getState());
        const current = (user?.role || '').toString().toUpperCase();
        const target = roleName.toString().toUpperCase();

        // Map legacy names to system roles
        if (target.includes('MANAGER')) return current === 'MANAGER';
        if (target.includes('STAFF')) return current === 'STAFF';
        // default: exact match
        return current === target;
    }

    hasAnyRole(roleNames: string[]): boolean {
        return roleNames.some((r) => this.hasRole(r));
    }

    hasAllRoles(roleNames: string[]): boolean {
        return roleNames.every((r) => this.hasRole(r));
    }

    // ==================== USER PERMISSIONS MANAGEMENT ====================

    async loadUserPermissions(): Promise<void> {
        const state = store.getState();
        const isLoaded = selectIsPermissionsLoaded(state);
        if (!isLoaded) {
            await store.dispatch(getUserPermissions()).unwrap();
        }
    }

    getUserPermissions() {
        return selectUserPermissions(store.getState());
    }

    getCurrentUser() {
        return selectUser(store.getState());
    }

    clearPermissionCache(): void {
        store.dispatch(clearPermissionCacheAction());
    }

    // ==================== CONTRACT-SPECIFIC HELPERS (thin wrappers) ====================

    canCreateContract(contractType?: string): boolean {
        return this.hasPermission('contract', 'create', { contractType });
    }

    canReadContract(contractId?: number, context?: Record<string, unknown>): boolean {
        return this.hasPermission('contract', 'read', { contractId, ...(context || {}) });
    }

    canUpdateContract(contractId?: number, context?: Record<string, unknown>): boolean {
        return this.hasPermission('contract', 'update', { contractId, ...(context || {}) });
    }

    canDeleteContract(contractId?: number, context?: Record<string, unknown>): boolean {
        return this.hasPermission('contract', 'delete', { contractId, ...(context || {}) });
    }

    canApproveContract(contractId?: number, context?: Record<string, unknown>): boolean {
        return this.hasPermission('contract', 'approve', { contractId, ...(context || {}) });
    }

    canRejectContract(contractId?: number, context?: Record<string, unknown>): boolean {
        return this.hasPermission('contract', 'reject', { contractId, ...(context || {}) });
    }

    canExportContract(contractId?: number): boolean {
        return this.hasPermission('contract', 'export', { contractId });
    }

    // ==================== STATUS HELPERS ====================

    isAuthenticated(): boolean {
        const state = store.getState();
        return !!selectUser(state);
    }

    isPermissionsLoaded(): boolean {
        return selectIsPermissionsLoaded(store.getState());
    }
}

export const authCoreService = AuthCoreService.getInstance();
export default AuthCoreService;
