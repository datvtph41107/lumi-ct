import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../domain/auth/role.entity';
import { Permission } from '../domain/auth/permission.entity';
import { UserRole } from '../domain/auth/user-role.entity';
import { User } from '../domain/user/user.entity';
import { UserSession } from '../domain/auth/user-session.entity';

export interface PermissionCheck {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface UserPermissions {
  userId: number;
  permissions: Permission[];
  roles: Role[];
  scopes: Record<string, any>;
}

@Injectable()
export class AuthCoreService {
  private permissionCache = new Map<string, boolean>();
  private userPermissionsCache = new Map<number, UserPermissions>();

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserSession)
    private readonly sessionRepository: Repository<UserSession>,
  ) {}

  // ==================== PERMISSION CHECKING ====================

  async hasPermission(userId: number, resource: string, action: string, context?: Record<string, any>): Promise<boolean> {
    const cacheKey = `${userId}:${resource}:${action}:${JSON.stringify(context)}`;
    
    if (this.permissionCache.has(cacheKey)) {
      return this.permissionCache.get(cacheKey)!;
    }

    const userPermissions = await this.getUserPermissions(userId);
    let hasPermission = false;

    for (const permission of userPermissions.permissions) {
      if (permission.resource === resource && permission.action === action) {
        // Check conditions if any
        if (permission.conditions_schema && context) {
          hasPermission = this.evaluateConditions(permission.conditions_schema, context, userId, userPermissions);
        } else {
          hasPermission = true;
        }
        
        if (hasPermission) break;
      }
    }

    this.permissionCache.set(cacheKey, hasPermission);
    return hasPermission;
  }

  async hasAnyPermission(userId: number, permissions: PermissionCheck[]): Promise<boolean> {
    for (const permission of permissions) {
      if (await this.hasPermission(userId, permission.resource, permission.action, permission.conditions)) {
        return true;
      }
    }
    return false;
  }

  async hasAllPermissions(userId: number, permissions: PermissionCheck[]): Promise<boolean> {
    for (const permission of permissions) {
      if (!(await this.hasPermission(userId, permission.resource, permission.action, permission.conditions))) {
        return false;
      }
    }
    return true;
  }

  // ==================== USER PERMISSIONS MANAGEMENT ====================

  async getUserPermissions(userId: number): Promise<UserPermissions> {
    if (this.userPermissionsCache.has(userId)) {
      return this.userPermissionsCache.get(userId)!;
    }

    const userRoles = await this.userRoleRepository.find({
      where: { user_id: userId, is_active: true },
      relations: ['role', 'role.permissions'],
    });

    const permissions = new Set<Permission>();
    const roles: Role[] = [];
    const scopes: Record<string, any> = {};

    for (const userRole of userRoles) {
      if (userRole.role && userRole.role.is_active) {
        roles.push(userRole.role);
        
        if (userRole.role.permissions) {
          userRole.role.permissions.forEach(permission => {
            if (permission.is_active) {
              permissions.add(permission);
            }
          });
        }

        // Store scope information
        if (userRole.scope !== 'global') {
          scopes[userRole.scope] = userRole.scope_id;
        }
      }
    }

    const userPermissions: UserPermissions = {
      userId,
      permissions: Array.from(permissions),
      roles,
      scopes
    };

    this.userPermissionsCache.set(userId, userPermissions);
    return userPermissions;
  }

  async getUserRoles(userId: number): Promise<UserRole[]> {
    return this.userRoleRepository.find({
      where: { user_id: userId, is_active: true },
      relations: ['role', 'granted_by_user'],
      order: { granted_at: 'DESC' }
    });
  }

  // ==================== ROLE MANAGEMENT ====================

  async assignRole(userId: number, roleId: string, scope: string = 'global', scopeId?: number, grantedBy?: number): Promise<UserRole> {
    // Check if role already exists
    const existingRole = await this.userRoleRepository.findOne({
      where: { user_id: userId, role_id: roleId, scope, scope_id: scopeId }
    });

    if (existingRole) {
      throw new Error('Role already assigned to user');
    }

    const userRole = this.userRoleRepository.create({
      user_id: userId,
      role_id: roleId,
      scope,
      scope_id: scopeId,
      granted_by: grantedBy,
      granted_at: new Date()
    });

    const savedRole = await this.userRoleRepository.save(userRole);
    this.clearUserCache(userId);
    return savedRole;
  }

  async removeRole(userId: number, roleId: string, scope: string = 'global', scopeId?: number): Promise<void> {
    await this.userRoleRepository.delete({
      user_id: userId,
      role_id: roleId,
      scope,
      scope_id: scopeId
    });
    this.clearUserCache(userId);
  }

  async updateUserRoles(userId: number, roles: Array<{ roleId: string; scope?: string; scopeId?: number }>): Promise<void> {
    // Remove existing roles
    await this.userRoleRepository.delete({ user_id: userId });

    // Add new roles
    for (const role of roles) {
      await this.assignRole(userId, role.roleId, role.scope, role.scopeId);
    }

    this.clearUserCache(userId);
  }

  // ==================== SESSION MANAGEMENT ====================

  async validateSession(sessionId: string, accessToken: string): Promise<User> {
    const session = await this.sessionRepository.findOne({
      where: { session_id: sessionId, is_active: true },
      relations: ['user']
    });

    if (!session) {
      throw new UnauthorizedException('Session không hợp lệ');
    }

    if (session.expires_at < new Date()) {
      await this.invalidateSession(session.id, 'expired');
      throw new UnauthorizedException('Session đã hết hạn');
    }

    if (!session.user.is_active) {
      await this.invalidateSession(session.id, 'user_inactive');
      throw new UnauthorizedException('Tài khoản đã bị vô hiệu hóa');
    }

    // Update last activity
    session.last_activity = new Date();
    await this.sessionRepository.save(session);

    return session.user;
  }

  async updateActivity(sessionId: string): Promise<void> {
    await this.sessionRepository.update(
      { session_id: sessionId },
      { last_activity: new Date() }
    );
  }

  // ==================== CONTRACT-SPECIFIC PERMISSIONS ====================

  async canCreateContract(userId: number, contractType?: string): Promise<boolean> {
    return this.hasPermission(userId, 'contract', 'create', { contractType });
  }

  async canReadContract(userId: number, contractId: number, context?: Record<string, any>): Promise<boolean> {
    return this.hasPermission(userId, 'contract', 'read', { contractId, ...context });
  }

  async canUpdateContract(userId: number, contractId: number, context?: Record<string, any>): Promise<boolean> {
    return this.hasPermission(userId, 'contract', 'update', { contractId, ...context });
  }

  async canDeleteContract(userId: number, contractId: number, context?: Record<string, any>): Promise<boolean> {
    return this.hasPermission(userId, 'contract', 'delete', { contractId, ...context });
  }

  async canApproveContract(userId: number, contractId: number, context?: Record<string, any>): Promise<boolean> {
    return this.hasPermission(userId, 'contract', 'approve', { contractId, ...context });
  }

  async canRejectContract(userId: number, contractId: number, context?: Record<string, any>): Promise<boolean> {
    return this.hasPermission(userId, 'contract', 'reject', { contractId, ...context });
  }

  async canExportContract(userId: number, contractId: number): Promise<boolean> {
    return this.hasPermission(userId, 'contract', 'export', { contractId });
  }

  async canManageTemplates(userId: number): Promise<boolean> {
    return this.hasPermission(userId, 'template', 'manage');
  }

  async canViewDashboard(userId: number, dashboardType?: string): Promise<boolean> {
    return this.hasPermission(userId, 'dashboard', 'view', { dashboardType });
  }

  async canViewAnalytics(userId: number, analyticsType?: string): Promise<boolean> {
    return this.hasPermission(userId, 'dashboard', 'analytics', { analyticsType });
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

  private async invalidateSession(sessionId: string, reason: string): Promise<void> {
    await this.sessionRepository.update(
      { session_id: sessionId },
      { 
        is_active: false, 
        logout_at: new Date(), 
        logout_reason: reason 
      }
    );
  }

  private clearUserCache(userId: number): void {
    this.userPermissionsCache.delete(userId);
    // Clear permission cache for this user
    for (const [key] of this.permissionCache.entries()) {
      if (key.startsWith(`${userId}:`)) {
        this.permissionCache.delete(key);
      }
    }
  }

  clearAllCaches(): void {
    this.permissionCache.clear();
    this.userPermissionsCache.clear();
  }

  // ==================== SYSTEM INITIALIZATION ====================

  async initializeSystemRoles(): Promise<void> {
    const systemRoles = [
      {
        name: 'contract_manager',
        display_name: 'Quản lý Hợp đồng',
        description: 'Quản lý toàn bộ quy trình hợp đồng',
        is_system: true,
        priority: 100,
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
          { resource: 'audit', action: 'export' }
        ]
      },
      {
        name: 'accounting_staff',
        display_name: 'Nhân viên Kế toán',
        description: 'Xử lý hợp đồng liên quan đến tài chính',
        is_system: true,
        priority: 80,
        permissions: [
          { resource: 'contract', action: 'read' },
          { resource: 'contract', action: 'update', conditions: { department: 'accounting' } },
          { resource: 'contract', action: 'approve', conditions: { type: 'financial' } },
          { resource: 'contract', action: 'reject', conditions: { type: 'financial' } },
          { resource: 'contract', action: 'export' },
          { resource: 'dashboard', action: 'view' },
          { resource: 'dashboard', action: 'financial_analytics' },
          { resource: 'audit', action: 'view' }
        ]
      },
      {
        name: 'hr_staff',
        display_name: 'Nhân viên Hành chính',
        description: 'Xử lý hợp đồng lao động và hành chính',
        is_system: true,
        priority: 80,
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
          { resource: 'audit', action: 'view' }
        ]
      }
    ];

    for (const roleData of systemRoles) {
      await this.createOrUpdateRole(roleData);
    }
  }

  private async createOrUpdateRole(roleData: any): Promise<Role> {
    let role = await this.roleRepository.findOne({ where: { name: roleData.name } });
    
    if (!role) {
      role = this.roleRepository.create({
        name: roleData.name,
        display_name: roleData.display_name,
        description: roleData.description,
        is_system: roleData.is_system,
        priority: roleData.priority
      });
    } else {
      Object.assign(role, {
        display_name: roleData.display_name,
        description: roleData.description,
        priority: roleData.priority
      });
    }

    role = await this.roleRepository.save(role);

    // Create permissions for this role
    for (const permData of roleData.permissions) {
      await this.createOrUpdatePermission(permData);
      await this.assignPermissionToRole(role.id, permData.resource, permData.action, permData.conditions);
    }

    return role;
  }

  private async createOrUpdatePermission(permData: any): Promise<Permission> {
    let permission = await this.permissionRepository.findOne({
      where: { resource: permData.resource, action: permData.action }
    });

    if (!permission) {
      permission = this.permissionRepository.create({
        resource: permData.resource,
        action: permData.action,
        display_name: `${permData.resource} ${permData.action}`,
        is_system: true,
        conditions_schema: permData.conditions
      });
    }

    return this.permissionRepository.save(permission);
  }

  private async assignPermissionToRole(roleId: string, resource: string, action: string, conditions?: any): Promise<void> {
    const permission = await this.permissionRepository.findOne({
      where: { resource, action }
    });

    if (permission) {
      const role = await this.roleRepository.findOne({
        where: { id: roleId },
        relations: ['permissions']
      });

      if (role && !role.permissions.find(p => p.id === permission.id)) {
        role.permissions.push(permission);
        await this.roleRepository.save(role);
      }
    }
  }
}