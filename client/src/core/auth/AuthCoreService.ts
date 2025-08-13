import { store } from '~/redux/store';
import { 
  selectUser,
  selectUserPermissions,
  selectUserRoles,
  selectIsPermissionsLoaded,
  selectPermissionCache,
  setPermissionCache,
  clearPermissionCache,
  getUserPermissions
} from '~/redux/slices/auth.slice';
import type { Permission, Role, UserRole, UserPermissions } from '~/redux/slices/auth.slice';

export interface PermissionCheck {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export class AuthCoreService {
  private static instance: AuthCoreService;

  private constructor() {}

  public static getInstance(): AuthCoreService {
    if (!AuthCoreService.instance) {
      AuthCoreService.instance = new AuthCoreService();
    }
    return AuthCoreService.instance;
  }

  // ==================== PERMISSION CHECKING ====================

  hasPermission(resource: string, action: string, conditions?: Record<string, any>): boolean {
    const state = store.getState();
    const user = selectUser(state);
    const userPermissions = selectUserPermissions(state);
    const permissionCache = selectPermissionCache(state);

    if (!user || !userPermissions) {
      return false;
    }

    const cacheKey = `${user.id}:${resource}:${action}:${JSON.stringify(conditions)}`;
    
    if (permissionCache.has(cacheKey)) {
      return permissionCache.get(cacheKey)!;
    }

    let hasPermission = false;

    for (const permission of userPermissions.permissions) {
      if (permission.resource === resource && permission.action === action) {
        // Check conditions if any
        if (permission.conditions_schema && conditions) {
          hasPermission = this.evaluateConditions(permission.conditions_schema, conditions, user.id, userPermissions);
        } else {
          hasPermission = true;
        }
        
        if (hasPermission) break;
      }
    }

    // Cache the result
    store.dispatch(setPermissionCache({ key: cacheKey, value: hasPermission }));
    return hasPermission;
  }

  hasAnyPermission(permissions: PermissionCheck[]): boolean {
    for (const permission of permissions) {
      if (this.hasPermission(permission.resource, permission.action, permission.conditions)) {
        return true;
      }
    }
    return false;
  }

  hasAllPermissions(permissions: PermissionCheck[]): boolean {
    for (const permission of permissions) {
      if (!this.hasPermission(permission.resource, permission.action, permission.conditions)) {
        return false;
      }
    }
    return true;
  }

  // ==================== ROLE CHECKING ====================

  hasRole(roleName: string, scope?: string, scopeId?: number): boolean {
    const state = store.getState();
    const userRoles = selectUserRoles(state);

    return userRoles.some(userRole => {
      const roleMatch = userRole.role.name === roleName;
      const scopeMatch = !scope || userRole.scope === scope;
      const scopeIdMatch = !scopeId || userRole.scope_id === scopeId;
      
      return roleMatch && scopeMatch && scopeIdMatch;
    });
  }

  hasAnyRole(roleNames: string[]): boolean {
    return roleNames.some(roleName => this.hasRole(roleName));
  }

  hasAllRoles(roleNames: string[]): boolean {
    return roleNames.every(roleName => this.hasRole(roleName));
  }

  // ==================== USER PERMISSIONS MANAGEMENT ====================

  async loadUserPermissions(): Promise<void> {
    const state = store.getState();
    const isLoaded = selectIsPermissionsLoaded(state);
    
    if (!isLoaded) {
      await store.dispatch(getUserPermissions()).unwrap();
    }
  }

  getUserPermissions(): UserPermissions | null {
    const state = store.getState();
    return selectUserPermissions(state);
  }

  getUserRoles(): UserRole[] {
    const state = store.getState();
    return selectUserRoles(state);
  }

  getCurrentUser(): any {
    const state = store.getState();
    return selectUser(state);
  }

  // ==================== CONTRACT-SPECIFIC PERMISSIONS ====================

  canCreateContract(contractType?: string): boolean {
    return this.hasPermission('contract', 'create', { contractType });
  }

  canReadContract(contractId?: number, context?: Record<string, any>): boolean {
    return this.hasPermission('contract', 'read', { contractId, ...context });
  }

  canUpdateContract(contractId?: number, context?: Record<string, any>): boolean {
    return this.hasPermission('contract', 'update', { contractId, ...context });
  }

  canDeleteContract(contractId?: number, context?: Record<string, any>): boolean {
    return this.hasPermission('contract', 'delete', { contractId, ...context });
  }

  canApproveContract(contractId?: number, context?: Record<string, any>): boolean {
    return this.hasPermission('contract', 'approve', { contractId, ...context });
  }

  canRejectContract(contractId?: number, context?: Record<string, any>): boolean {
    return this.hasPermission('contract', 'reject', { contractId, ...context });
  }

  canExportContract(contractId?: number): boolean {
    return this.hasPermission('contract', 'export', { contractId });
  }

  canManageTemplates(): boolean {
    return this.hasPermission('template', 'manage');
  }

  canViewDashboard(dashboardType?: string): boolean {
    return this.hasPermission('dashboard', 'view', { dashboardType });
  }

  canViewAnalytics(analyticsType?: string): boolean {
    return this.hasPermission('dashboard', 'analytics', { analyticsType });
  }

  // ==================== UTILITY METHODS ====================

  private evaluateConditions(conditionsSchema: any, context: Record<string, any>, userId: number, userPermissions: UserPermissions): boolean {
    for (const [key, value] of Object.entries(conditionsSchema)) {
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
        case 'scope':
          return userPermissions.scopes[value] !== undefined;
        case 'role':
          return userPermissions.roles.some(role => role.name === value);
      }
    }
    return true;
  }

  clearPermissionCache(): void {
    store.dispatch(clearPermissionCache());
  }

  // ==================== AUTHENTICATION STATUS ====================

  isAuthenticated(): boolean {
    const state = store.getState();
    return state.auth.isAuthenticated;
  }

  isLoading(): boolean {
    const state = store.getState();
    return state.auth.isLoading;
  }

  isPermissionsLoaded(): boolean {
    const state = store.getState();
    return selectIsPermissionsLoaded(state);
  }

  // ==================== ROLE-BASED HELPERS ====================

  isContractManager(): boolean {
    return this.hasRole('contract_manager');
  }

  isAccountingStaff(): boolean {
    return this.hasRole('accounting_staff');
  }

  isHRStaff(): boolean {
    return this.hasRole('hr_staff');
  }

  isContractCreator(): boolean {
    return this.hasRole('contract_creator');
  }

  isContractReviewer(): boolean {
    return this.hasRole('contract_reviewer');
  }

  isContractViewer(): boolean {
    return this.hasRole('contract_viewer');
  }

  // ==================== SCOPE HELPERS ====================

  getDepartmentScope(): number | null {
    const state = store.getState();
    const userPermissions = selectUserPermissions(state);
    return userPermissions?.scopes?.department || null;
  }

  getProjectScope(): number | null {
    const state = store.getState();
    const userPermissions = selectUserPermissions(state);
    return userPermissions?.scopes?.project || null;
  }

  getContractScope(): number | null {
    const state = store.getState();
    const userPermissions = selectUserPermissions(state);
    return userPermissions?.scopes?.contract || null;
  }

  // ==================== PERMISSION GROUPS ====================

  getContractPermissions(): Permission[] {
    const userPermissions = this.getUserPermissions();
    if (!userPermissions) return [];

    return userPermissions.permissions.filter(permission => 
      permission.resource === 'contract'
    );
  }

  getDashboardPermissions(): Permission[] {
    const userPermissions = this.getUserPermissions();
    if (!userPermissions) return [];

    return userPermissions.permissions.filter(permission => 
      permission.resource === 'dashboard'
    );
  }

  getTemplatePermissions(): Permission[] {
    const userPermissions = this.getUserPermissions();
    if (!userPermissions) return [];

    return userPermissions.permissions.filter(permission => 
      permission.resource === 'template'
    );
  }

  getAuditPermissions(): Permission[] {
    const userPermissions = this.getUserPermissions();
    if (!userPermissions) return [];

    return userPermissions.permissions.filter(permission => 
      permission.resource === 'audit'
    );
  }
}

export const authCoreService = AuthCoreService.getInstance();
export default AuthCoreService;