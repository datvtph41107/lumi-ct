import { store } from '~/redux/store';
import {
    login,
    logout,
    refreshToken,
    getCurrentUser,
    updateActivity,
    clearAuth,
    setAccessToken,
    setSessionId,
} from '~/redux/slices/auth.slice';
import { authService } from '~/services/api/auth.service';
import type { User, LoginCredentials, RegisterData } from '~/types/auth/auth.types';

export interface AuthConfig {
    idleWarningTime: number; // 10 minutes
    idleLogoutTime: number; // 15 minutes
    pageHiddenLogoutTime: number; // 5 minutes
    tokenRefreshThreshold: number; // 2 minutes before expiry
    maxConcurrentSessions: number; // 5 sessions per user
}

export interface Permission {
    resource: string;
    action: string;
    conditions?: Record<string, any>;
}

export interface Role {
    id: string;
    name: string;
    description: string;
    permissions: Permission[];
    inherits?: string[]; // Role inheritance
}

export interface UserRole {
    userId: number;
    roleId: string;
    scope?: 'global' | 'department' | 'project';
    scopeId?: number; // department_id, project_id, etc.
    grantedBy?: number;
    grantedAt: Date;
    expiresAt?: Date;
}

class AuthCore {
    private static instance: AuthCore;
    private config: AuthConfig;
    private roles: Map<string, Role> = new Map();
    private userRoles: Map<number, UserRole[]> = new Map();
    private permissionCache: Map<string, boolean> = new Map();

    private constructor() {
        this.config = {
            idleWarningTime: 10 * 60 * 1000,
            idleLogoutTime: 15 * 60 * 1000,
            pageHiddenLogoutTime: 5 * 60 * 1000,
            tokenRefreshThreshold: 2 * 60 * 1000,
            maxConcurrentSessions: 5,
        };

        this.initializeRoles();
    }

    public static getInstance(): AuthCore {
        if (!AuthCore.instance) {
            AuthCore.instance = new AuthCore();
        }
        return AuthCore.instance;
    }

    // ==================== AUTHENTICATION METHODS ====================

    async login(credentials: LoginCredentials): Promise<User> {
        try {
            const result = await store.dispatch(login(credentials)).unwrap();
            return result.user;
        } catch (error) {
            throw new Error(`Login failed: ${error}`);
        }
    }

    async logout(reason: string = 'user_logout'): Promise<void> {
        try {
            await store.dispatch(logout()).unwrap();
            this.clearPermissionCache();
        } catch (error) {
            // Force clear even if API fails
            store.dispatch(clearAuth());
            this.clearPermissionCache();
        }
    }

    async refreshToken(): Promise<boolean> {
        try {
            await store.dispatch(refreshToken()).unwrap();
            return true;
        } catch (error) {
            await this.logout('token_refresh_failed');
            return false;
        }
    }

    async getCurrentUser(): Promise<User | null> {
        try {
            const result = await store.dispatch(getCurrentUser()).unwrap();
            return result.user;
        } catch (error) {
            return null;
        }
    }

    async updateActivity(): Promise<void> {
        try {
            await store.dispatch(updateActivity()).unwrap();
        } catch (error) {
            console.warn('Failed to update activity:', error);
        }
    }

    // ==================== ROLE & PERMISSION MANAGEMENT ====================

    private initializeRoles(): void {
        // Contract Management Roles
        this.roles.set('contract_manager', {
            id: 'contract_manager',
            name: 'Quản lý Hợp đồng',
            description: 'Quản lý toàn bộ quy trình hợp đồng',
            permissions: [
                { resource: 'contract', action: 'create' },
                { resource: 'contract', action: 'read' },
                { resource: 'contract', action: 'update' },
                { resource: 'contract', action: 'delete' },
                { resource: 'contract', action: 'approve' },
                { resource: 'contract', action: 'reject' },
                { resource: 'contract', action: 'export' },
                { resource: 'contract', action: 'assign' },
                { resource: 'template', action: 'manage' },
                { resource: 'dashboard', action: 'view' },
                { resource: 'dashboard', action: 'analytics' },
                { resource: 'user', action: 'manage_roles' },
                { resource: 'audit', action: 'view' },
                { resource: 'audit', action: 'export' },
            ],
        });

        this.roles.set('accounting_staff', {
            id: 'accounting_staff',
            name: 'Nhân viên Kế toán',
            description: 'Xử lý hợp đồng liên quan đến tài chính',
            permissions: [
                { resource: 'contract', action: 'read' },
                { resource: 'contract', action: 'update', conditions: { department: 'accounting' } },
                { resource: 'contract', action: 'approve', conditions: { type: 'financial' } },
                { resource: 'contract', action: 'reject', conditions: { type: 'financial' } },
                { resource: 'contract', action: 'export' },
                { resource: 'dashboard', action: 'view' },
                { resource: 'dashboard', action: 'financial_analytics' },
                { resource: 'audit', action: 'view' },
            ],
        });

        this.roles.set('hr_staff', {
            id: 'hr_staff',
            name: 'Nhân viên Hành chính',
            description: 'Xử lý hợp đồng lao động và hành chính',
            permissions: [
                { resource: 'contract', action: 'read' },
                { resource: 'contract', action: 'create', conditions: { type: 'employment' } },
                { resource: 'contract', action: 'update', conditions: { department: 'hr' } },
                { resource: 'contract', action: 'approve', conditions: { type: 'employment' } },
                { resource: 'contract', action: 'reject', conditions: { type: 'employment' } },
                { resource: 'contract', action: 'export' },
                { resource: 'template', action: 'use' },
                { resource: 'dashboard', action: 'view' },
                { resource: 'dashboard', action: 'hr_analytics' },
                { resource: 'audit', action: 'view' },
            ],
        });

        this.roles.set('contract_creator', {
            id: 'contract_creator',
            name: 'Người tạo Hợp đồng',
            description: 'Tạo và chỉnh sửa hợp đồng',
            permissions: [
                { resource: 'contract', action: 'create' },
                { resource: 'contract', action: 'read' },
                { resource: 'contract', action: 'update', conditions: { owner: true } },
                { resource: 'contract', action: 'submit' },
                { resource: 'template', action: 'use' },
                { resource: 'dashboard', action: 'view' },
            ],
        });

        this.roles.set('contract_reviewer', {
            id: 'contract_reviewer',
            name: 'Người duyệt Hợp đồng',
            description: 'Duyệt và phê duyệt hợp đồng',
            permissions: [
                { resource: 'contract', action: 'read' },
                { resource: 'contract', action: 'review' },
                { resource: 'contract', action: 'approve' },
                { resource: 'contract', action: 'reject' },
                { resource: 'contract', action: 'request_changes' },
                { resource: 'dashboard', action: 'view' },
                { resource: 'dashboard', action: 'review_analytics' },
                { resource: 'audit', action: 'view' },
            ],
        });

        this.roles.set('contract_viewer', {
            id: 'contract_viewer',
            name: 'Người xem Hợp đồng',
            description: 'Chỉ xem hợp đồng được phân quyền',
            permissions: [
                { resource: 'contract', action: 'read', conditions: { assigned: true } },
                { resource: 'dashboard', action: 'view' },
            ],
        });
    }

    // ==================== PERMISSION CHECKING ====================

    hasPermission(userId: number, resource: string, action: string, context?: Record<string, any>): boolean {
        const cacheKey = `${userId}:${resource}:${action}:${JSON.stringify(context)}`;

        if (this.permissionCache.has(cacheKey)) {
            return this.permissionCache.get(cacheKey)!;
        }

        const userRoles = this.userRoles.get(userId) || [];
        let hasPermission = false;

        for (const userRole of userRoles) {
            const role = this.roles.get(userRole.roleId);
            if (!role) continue;

            for (const permission of role.permissions) {
                if (permission.resource === resource && permission.action === action) {
                    // Check conditions if any
                    if (permission.conditions && context) {
                        hasPermission = this.evaluateConditions(permission.conditions, context, userId);
                    } else {
                        hasPermission = true;
                    }

                    if (hasPermission) break;
                }
            }

            if (hasPermission) break;
        }

        this.permissionCache.set(cacheKey, hasPermission);
        return hasPermission;
    }

    private evaluateConditions(conditions: Record<string, any>, context: Record<string, any>, userId: number): boolean {
        for (const [key, value] of Object.entries(conditions)) {
            switch (key) {
                case 'owner':
                    if (value === true) {
                        return context.ownerId === userId;
                    }
                    break;
                case 'department':
                    return context.department === value;
                case 'type':
                    return context.contractType === value;
                case 'assigned':
                    if (value === true) {
                        return context.assignedUsers?.includes(userId) || context.ownerId === userId;
                    }
                    break;
                case 'status':
                    return context.status === value;
                case 'amount':
                    if (value.max) {
                        return context.amount <= value.max;
                    }
                    if (value.min) {
                        return context.amount >= value.min;
                    }
                    break;
            }
        }
        return true;
    }

    // ==================== ROLE MANAGEMENT ====================

    assignRole(userId: number, roleId: string, scope?: string, scopeId?: number): void {
        const userRoles = this.userRoles.get(userId) || [];

        // Check if role already exists
        const existingRole = userRoles.find(
            (ur) => ur.roleId === roleId && ur.scope === scope && ur.scopeId === scopeId,
        );
        if (existingRole) {
            throw new Error('Role already assigned to user');
        }

        const userRole: UserRole = {
            userId,
            roleId,
            scope: scope || 'global',
            scopeId,
            grantedBy: this.getCurrentUserId(),
            grantedAt: new Date(),
        };

        userRoles.push(userRole);
        this.userRoles.set(userId, userRoles);
        this.clearPermissionCache();
    }

    removeRole(userId: number, roleId: string, scope?: string, scopeId?: number): void {
        const userRoles = this.userRoles.get(userId) || [];
        const filteredRoles = userRoles.filter(
            (ur) => !(ur.roleId === roleId && ur.scope === (scope || 'global') && ur.scopeId === scopeId),
        );

        this.userRoles.set(userId, filteredRoles);
        this.clearPermissionCache();
    }

    getUserRoles(userId: number): UserRole[] {
        return this.userRoles.get(userId) || [];
    }

    // ==================== UTILITY METHODS ====================

    private getCurrentUserId(): number {
        const state = store.getState();
        return state.auth.user?.id || 0;
    }

    private clearPermissionCache(): void {
        this.permissionCache.clear();
    }

    getConfig(): AuthConfig {
        return { ...this.config };
    }

    updateConfig(newConfig: Partial<AuthConfig>): void {
        this.config = { ...this.config, ...newConfig };
    }

    // ==================== SESSION MANAGEMENT ====================

    async validateSession(): Promise<boolean> {
        const state = store.getState();
        if (!state.auth.isAuthenticated || !state.auth.accessToken) {
            return false;
        }

        try {
            await this.updateActivity();
            return true;
        } catch (error) {
            return false;
        }
    }

    async forceLogoutAllSessions(): Promise<void> {
        try {
            await authService.logoutAllSessions();
            await this.logout('force_logout_all');
        } catch (error) {
            console.error('Force logout failed:', error);
        }
    }

    // ==================== CONTRACT-SPECIFIC PERMISSIONS ====================

    canCreateContract(userId: number, contractType?: string): boolean {
        return this.hasPermission(userId, 'contract', 'create', { contractType });
    }

    canReadContract(userId: number, contractId: number, context?: Record<string, any>): boolean {
        return this.hasPermission(userId, 'contract', 'read', {
            contractId,
            ...context,
        });
    }

    canUpdateContract(userId: number, contractId: number, context?: Record<string, any>): boolean {
        return this.hasPermission(userId, 'contract', 'update', {
            contractId,
            ...context,
        });
    }

    canDeleteContract(userId: number, contractId: number, context?: Record<string, any>): boolean {
        return this.hasPermission(userId, 'contract', 'delete', {
            contractId,
            ...context,
        });
    }

    canApproveContract(userId: number, contractId: number, context?: Record<string, any>): boolean {
        return this.hasPermission(userId, 'contract', 'approve', {
            contractId,
            ...context,
        });
    }

    canRejectContract(userId: number, contractId: number, context?: Record<string, any>): boolean {
        return this.hasPermission(userId, 'contract', 'reject', {
            contractId,
            ...context,
        });
    }

    canExportContract(userId: number, contractId: number): boolean {
        return this.hasPermission(userId, 'contract', 'export', { contractId });
    }

    canManageTemplates(userId: number): boolean {
        return this.hasPermission(userId, 'template', 'manage');
    }

    canViewDashboard(userId: number, dashboardType?: string): boolean {
        return this.hasPermission(userId, 'dashboard', 'view', { dashboardType });
    }

    canViewAnalytics(userId: number, analyticsType?: string): boolean {
        return this.hasPermission(userId, 'dashboard', 'analytics', { analyticsType });
    }
}

export const authCore = AuthCore.getInstance();
export default AuthCore;
