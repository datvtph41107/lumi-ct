import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/core/domain/user/user.entity';
import { UserSession } from '@/core/domain/user/user-session.entity';
import { PermissionCheck, UserPermissions, RolePermission } from '@/core/shared/types/auth.types';
import { Role as SystemRole } from '@/core/shared/enums/base.enums';

@Injectable()
export class AuthService {
    private permissionCache = new Map<string, boolean>();
    private userPermissionsCache = new Map<number, UserPermissions>();

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(UserSession)
        private readonly sessionRepository: Repository<UserSession>,
    ) {}

    async hasPermission(_userId: number, _resource: string, _action: string, _context?: Record<string, unknown>): Promise<boolean> {
        // Deprecated in favor of Role + Collaborator guards
        return true;
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
        const user = await this.userRepository.findOne({ where: { id: userId } });
        const roles: any[] = [];
        const scopes: Record<string, unknown> = {};
        const aggregatedPermissions: RolePermission[] = [];

        const isManager = user?.role === SystemRole.MANAGER;
        if (isManager) {
            // Manager: system-level permissions
            roles.push({ id: 'manager', name: 'MANAGER', is_active: true });
            aggregatedPermissions.push(
                { resource: 'contract', action: 'create', is_active: true },
                { resource: 'contract', action: 'read', is_active: true },
                { resource: 'contract', action: 'update', is_active: true },
                { resource: 'contract', action: 'delete', is_active: true },
                { resource: 'contract', action: 'approve', is_active: true },
                { resource: 'contract', action: 'export', is_active: true },
                { resource: 'template', action: 'manage', is_active: true },
                { resource: 'dashboard', action: 'view', is_active: true },
                { resource: 'dashboard', action: 'analytics', is_active: true },
                { resource: 'audit', action: 'view', is_active: true },
            );
        } else {
            // Staff: basic access; collaborator governs per-contract
            roles.push({ id: 'staff', name: 'STAFF', is_active: true });
            aggregatedPermissions.push(
                { resource: 'contract', action: 'create', is_active: true },
                { resource: 'dashboard', action: 'view', is_active: true },
            );
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

    async getUserRoles(userId: number): Promise<any[]> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        const roleName = user?.role === SystemRole.MANAGER ? 'MANAGER' : 'STAFF';
        return [
            {
                user_id: userId,
                role_id: roleName.toLowerCase(),
                scope: 'global',
                is_active: true,
                granted_at: new Date(),
            },
        ];
    }

    async validateSession(sessionId: string): Promise<User> {
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

    private evaluateConditions(): boolean {
        // Deprecated
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

    async updateUserRoles(
        userId: number,
        roles: Array<{ roleId: string; scope?: string; scopeId?: number }>,
    ): Promise<void> {
        // Single role per user: take the first roleId and map to MANAGER/STAFF
        const primary = roles?.[0]?.roleId || '';
        const normalized = (primary || '').toString().trim().toLowerCase();
        const newRole = normalized === 'manager' ? SystemRole.MANAGER : SystemRole.STAFF;
        await this.userRepository.update({ id: userId } as any, { role: newRole } as any);
        this.clearUserCache(userId);
    }
}
