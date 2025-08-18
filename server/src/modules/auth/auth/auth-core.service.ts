import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '@/core/domain/permission/role.entity';
import { Permission } from '@/core/domain/permission/permission.entity';
import { UserRole } from '@/core/domain/permission/user-role.entity';
import { User } from '@/core/domain/user/user.entity';
import { UserSession } from '@/core/domain/user/user-session.entity';

export interface PermissionCheck {
    resource: string;
    action: string;
    conditions?: Record<string, any>;
}

export interface UserPermissions {
    userId: number;
    permissions: Permission[] | Array<{ resource: string; action: string; conditions_schema?: any; is_active?: boolean }>;
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

    async hasPermission(userId: number, resource: string, action: string, context?: Record<string, any>): Promise<boolean> {
        const cacheKey = `${userId}:${resource}:${action}:${JSON.stringify(context)}`;
        if (this.permissionCache.has(cacheKey)) return this.permissionCache.get(cacheKey)!;

        const userPermissions = await this.getUserPermissions(userId);
        let ok = false;
        for (const p of userPermissions.permissions as any[]) {
            if (p.resource === resource && p.action === action) {
                if (p.conditions_schema && context) ok = this.evaluateConditions(p.conditions_schema, context, userId, userPermissions);
                else ok = true;
                if (ok) break;
            }
        }
        this.permissionCache.set(cacheKey, ok);
        return ok;
    }

    async hasAnyPermission(userId: number, permissions: PermissionCheck[]): Promise<boolean> {
        for (const permission of permissions) if (await this.hasPermission(userId, permission.resource, permission.action, permission.conditions)) return true;
        return false;
    }

    async hasAllPermissions(userId: number, permissions: PermissionCheck[]): Promise<boolean> {
        for (const permission of permissions) if (!(await this.hasPermission(userId, permission.resource, permission.action, permission.conditions))) return false;
        return true;
    }

    async getUserPermissions(userId: number): Promise<UserPermissions> {
        if (this.userPermissionsCache.has(userId)) return this.userPermissionsCache.get(userId)!;

        const userRoles = await this.userRoleRepository.find({ where: { user_id: userId, is_active: true } });
        const roles: Role[] = [];
        const scopes: Record<string, any> = {};
        const aggregated: Array<{ resource: string; action: string; conditions_schema?: any; is_active?: boolean }> = [];

        for (const ur of userRoles) {
            const role = await this.roleRepository.findOne({ where: { id: ur.role_id } });
            if (role && role.is_active) {
                roles.push(role);
                (role.permissions || []).forEach((rp) => aggregated.push({
                    resource: rp.resource,
                    action: rp.action,
                    conditions_schema: rp.conditions,
                    is_active: true,
                }));
                if (ur.scope !== 'global') scopes[ur.scope] = ur.scope_id;
            }
        }

        const up: UserPermissions = { userId, permissions: aggregated, roles, scopes };
        this.userPermissionsCache.set(userId, up);
        return up;
    }

    async getUserRoles(userId: number): Promise<UserRole[]> {
        return this.userRoleRepository.find({ where: { user_id: userId, is_active: true }, order: { granted_at: 'DESC' } as any });
    }

    async assignRole(userId: number, roleId: string, scope: string = 'global', scopeId?: number, grantedBy?: number): Promise<UserRole> {
        const existingRole = await this.userRoleRepository.findOne({ where: { user_id: userId, role_id: roleId, scope, scope_id: scopeId } });
        if (existingRole) throw new Error('Role already assigned to user');
        const userRole = this.userRoleRepository.create({ user_id: userId, role_id: roleId, scope, scope_id: scopeId, granted_by: grantedBy, granted_at: new Date() });
        const savedRole = await this.userRoleRepository.save(userRole);
        this.clearUserCache(userId);
        return savedRole;
    }

    async removeRole(userId: number, roleId: string, scope: string = 'global', scopeId?: number): Promise<void> {
        await this.userRoleRepository.delete({ user_id: userId, role_id: roleId, scope, scope_id: scopeId });
        this.clearUserCache(userId);
    }

    async updateUserRoles(userId: number, roles: Array<{ roleId: string; scope?: string; scopeId?: number }>): Promise<void> {
        await this.userRoleRepository.delete({ user_id: userId });
        for (const role of roles) await this.assignRole(userId, role.roleId, role.scope, role.scopeId);
        this.clearUserCache(userId);
    }

    async validateSession(sessionId: string, accessToken: string): Promise<User> {
        const session = await this.sessionRepository.findOne({ where: { session_id: sessionId, is_active: true } });
        if (!session) throw new UnauthorizedException('Session không hợp lệ');
        if (session.expires_at < new Date()) {
            await this.invalidateSession(session.id, 'expired');
            throw new UnauthorizedException('Session đã hết hạn');
        }
        const user = await this.userRepository.findOne({ where: { id: session.user_id } });
        if (!user || !user.is_active) {
            await this.invalidateSession(session.id, 'user_inactive');
            throw new UnauthorizedException('Tài khoản đã bị vô hiệu hóa');
        }
        session.last_activity = new Date();
        await this.sessionRepository.save(session);
        return user;
    }

    async updateActivity(sessionId: string): Promise<void> {
        await this.sessionRepository.update({ session_id: sessionId }, { last_activity: new Date() });
    }

    async canCreateContract(userId: number, contractType?: string): Promise<boolean> { return this.hasPermission(userId, 'contract', 'create', { contractType }); }
    async canReadContract(userId: number, contractId: number, context?: Record<string, any>): Promise<boolean> { return this.hasPermission(userId, 'contract', 'read', { contractId, ...context }); }
    async canUpdateContract(userId: number, contractId: number, context?: Record<string, any>): Promise<boolean> { return this.hasPermission(userId, 'contract', 'update', { contractId, ...context }); }
    async canDeleteContract(userId: number, contractId: number, context?: Record<string, any>): Promise<boolean> { return this.hasPermission(userId, 'contract', 'delete', { contractId, ...context }); }
    async canApproveContract(userId: number, contractId: number, context?: Record<string, any>): Promise<boolean> { return this.hasPermission(userId, 'contract', 'approve', { contractId, ...context }); }
    async canRejectContract(userId: number, contractId: number, context?: Record<string, any>): Promise<boolean> { return this.hasPermission(userId, 'contract', 'reject', { contractId, ...context }); }
    async canExportContract(userId: number, contractId: number): Promise<boolean> { return this.hasPermission(userId, 'contract', 'export', { contractId }); }
    async canManageTemplates(userId: number): Promise<boolean> { return this.hasPermission(userId, 'template', 'manage'); }
    async canViewDashboard(userId: number, dashboardType?: string): Promise<boolean> { return this.hasPermission(userId, 'dashboard', 'view', { dashboardType }); }
    async canViewAnalytics(userId: number, analyticsType?: string): Promise<boolean> { return this.hasPermission(userId, 'dashboard', 'analytics', { analyticsType }); }

    private evaluateConditions(conditionsSchema: any, context: Record<string, any>, userId: number, userPermissions: UserPermissions): boolean {
        for (const [key, value] of Object.entries(conditionsSchema)) {
            switch (key) {
                case 'owner':
                    if (value === true) return context.ownerId === userId;
                    break;
                case 'department':
                    return context.department === value;
                case 'type':
                    return context.contractType === value;
                case 'assigned':
                    if (value === true) return context.assignedUsers?.includes(userId) || context.ownerId === userId;
                    break;
                case 'status':
                    return context.status === value;
                case 'amount':
                    if ((value as any).max) return context.amount <= (value as any).max;
                    if ((value as any).min) return context.amount >= (value as any).min;
                    break;
                case 'scope':
                    return userPermissions.scopes[value as any] !== undefined;
                case 'role':
                    return userPermissions.roles.some((role) => role.name === value);
            }
        }
        return true;
    }

    private async invalidateSession(sessionId: string, reason: string): Promise<void> {
        await this.sessionRepository.update({ session_id: sessionId }, { is_active: false, logout_at: new Date(), logout_reason: reason });
    }

    private clearUserCache(userId: number): void {
        this.userPermissionsCache.delete(userId);
        for (const [key] of this.permissionCache.entries()) if (key.startsWith(`${userId}:`)) this.permissionCache.delete(key);
    }

    clearAllCaches(): void {
        this.permissionCache.clear();
        this.userPermissionsCache.clear();
    }
}
