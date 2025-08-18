import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '@/core/domain/permission/role.entity';
import { Permission } from '@/core/domain/permission/permission.entity';
import { UserRole } from '@/core/domain/permission/user-role.entity';
import { User } from '@/core/domain/user/user.entity';
import { UserSession } from '@/core/domain/user/user-session.entity';
import { PermissionCheck, UserPermissions, RolePermission } from '@/core/shared/types/auth.types';

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

    async hasPermission(
        userId: number,
        resource: string,
        action: string,
        context?: Record<string, unknown>,
    ): Promise<boolean> {
        const cacheKey = `${userId}:${resource}:${action}:${JSON.stringify(context)}`;
        if (this.permissionCache.has(cacheKey)) {
            return this.permissionCache.get(cacheKey)!;
        }

        const userPermissions = await this.getUserPermissions(userId);
        let hasAccess = false;

        // Type-safe permission checking
        if (Array.isArray(userPermissions.permissions)) {
            for (const permission of userPermissions.permissions) {
                if (permission.resource === resource && permission.action === action) {
                    if (permission.conditions_schema && context) {
                        hasAccess = this.evaluateConditions(
                            permission.conditions_schema,
                            context,
                            userId,
                            userPermissions,
                        );
                    } else {
                        hasAccess = true;
                    }
                    if (hasAccess) break;
                }
            }
        }

        this.permissionCache.set(cacheKey, hasAccess);
        return hasAccess;
    }

    async hasAnyPermission(userId: number, permissions: PermissionCheck[]): Promise<boolean> {
        for (const permission of permissions)
            if (await this.hasPermission(userId, permission.resource, permission.action, permission.conditions))
                return true;
        return false;
    }

    async hasAllPermissions(userId: number, permissions: PermissionCheck[]): Promise<boolean> {
        for (const permission of permissions)
            if (!(await this.hasPermission(userId, permission.resource, permission.action, permission.conditions)))
                return false;
        return true;
    }

    async getUserPermissions(userId: number): Promise<UserPermissions> {
        if (this.userPermissionsCache.has(userId)) {
            return this.userPermissionsCache.get(userId)!;
        }

        const userRoles = await this.userRoleRepository.find({
            where: { user_id: userId, is_active: true },
        });

        const roles: Role[] = [];
        const scopes: Record<string, unknown> = {};
        const aggregatedPermissions: RolePermission[] = [];

        for (const userRole of userRoles) {
            const role = await this.roleRepository.findOne({
                where: { id: userRole.role_id },
            });

            if (role && role.is_active) {
                roles.push(role);

                // Process role permissions
                const rolePermissions = role.permissions || [];
                rolePermissions.forEach((rolePermission) => {
                    aggregatedPermissions.push({
                        resource: rolePermission.resource,
                        action: rolePermission.action,
                        conditions_schema: rolePermission.conditions,
                        is_active: true,
                    });
                });

                // Handle scopes
                if (userRole.scope !== 'global') {
                    scopes[userRole.scope] = userRole.scope_id;
                }
            }
        }

        const userPermissions: UserPermissions = {
            userId,
            permissions: aggregatedPermissions,
            roles,
            scopes,
        };

        this.userPermissionsCache.set(userId, userPermissions);
        return userPermissions;
    }

    async getUserRoles(userId: number): Promise<UserRole[]> {
        return this.userRoleRepository.find({
            where: { user_id: userId, is_active: true },
            order: { granted_at: 'DESC' },
        });
    }

    async assignRole(
        userId: number,
        roleId: string,
        scope: string = 'global',
        scopeId?: number,
        grantedBy?: number,
    ): Promise<UserRole> {
        const existingRole = await this.userRoleRepository.findOne({
            where: { user_id: userId, role_id: roleId, scope, scope_id: scopeId },
        });
        if (existingRole) throw new Error('Role already assigned to user');
        const userRole = this.userRoleRepository.create({
            user_id: userId,
            role_id: roleId,
            scope,
            scope_id: scopeId,
            granted_by: grantedBy,
            granted_at: new Date(),
        });
        const savedRole = await this.userRoleRepository.save(userRole);
        this.clearUserCache(userId);
        return savedRole;
    }

    async removeRole(userId: number, roleId: string, scope: string = 'global', scopeId?: number): Promise<void> {
        await this.userRoleRepository.delete({ user_id: userId, role_id: roleId, scope, scope_id: scopeId });
        this.clearUserCache(userId);
    }

    async updateUserRoles(
        userId: number,
        roles: Array<{ roleId: string; scope?: string; scopeId?: number }>,
    ): Promise<void> {
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

    async canCreateContract(userId: number, contractType?: string): Promise<boolean> {
        return this.hasPermission(userId, 'contract', 'create', { contractType });
    }
    async canReadContract(userId: number, contractId: number, context?: Record<string, unknown>): Promise<boolean> {
        return this.hasPermission(userId, 'contract', 'read', { contractId, ...context });
    }

    async canUpdateContract(userId: number, contractId: number, context?: Record<string, unknown>): Promise<boolean> {
        return this.hasPermission(userId, 'contract', 'update', { contractId, ...context });
    }

    async canDeleteContract(userId: number, contractId: number, context?: Record<string, unknown>): Promise<boolean> {
        return this.hasPermission(userId, 'contract', 'delete', { contractId, ...context });
    }

    async canApproveContract(userId: number, contractId: number, context?: Record<string, unknown>): Promise<boolean> {
        return this.hasPermission(userId, 'contract', 'approve', { contractId, ...context });
    }

    async canRejectContract(userId: number, contractId: number, context?: Record<string, unknown>): Promise<boolean> {
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

    private evaluateConditions(
        conditionsSchema: Record<string, unknown>,
        context: Record<string, unknown>,
        userId: number,
        userPermissions: UserPermissions,
    ): boolean {
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
                        const assignedUsers = context.assignedUsers as number[] | undefined;
                        return assignedUsers?.includes(userId) || context.ownerId === userId;
                    }
                    break;
                case 'status':
                    return context.status === value;
                case 'amount':
                    if (typeof value === 'object' && value !== null) {
                        const amountCondition = value as Record<string, number>;
                        const amount = context.amount as number;
                        if (amountCondition.max && amount > amountCondition.max) return false;
                        if (amountCondition.min && amount < amountCondition.min) return false;
                    }
                    break;
                case 'scope':
                    return userPermissions.scopes[value as string] !== undefined;
                case 'role':
                    return userPermissions.roles.some((role) => role.name === value);
            }
        }
        return true;
    }

    private async invalidateSession(sessionId: string, reason: string): Promise<void> {
        await this.sessionRepository.update(
            { session_id: sessionId },
            { is_active: false, logout_at: new Date(), logout_reason: reason },
        );
    }

    private clearUserCache(userId: number): void {
        this.userPermissionsCache.delete(userId);
        for (const [key] of this.permissionCache.entries())
            if (key.startsWith(`${userId}:`)) this.permissionCache.delete(key);
    }

    clearAllCaches(): void {
        this.permissionCache.clear();
        this.userPermissionsCache.clear();
    }
}
