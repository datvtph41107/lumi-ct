import { Injectable, UnauthorizedException, ForbiddenException, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Role } from '@/core/domain/permission/role.entity';
import { Permission } from '@/core/domain/permission/permission.entity';
import { UserRole } from '@/core/domain/permission/user-role.entity';
import { User } from '@/core/domain/user/user.entity';
import { UserSession } from '@/core/domain/user/user-session.entity';
import { LoggerTypes } from '@/core/shared/logger/logger.types';

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
        @Inject('LOGGER') private readonly logger: LoggerTypes,
        @Inject('DATA_SOURCE') private readonly db: DataSource,
    ) {}

    // ==================== PERMISSION CHECKING ====================

    async hasPermission(
        userId: number,
        resource: string,
        action: string,
        context?: Record<string, any>,
    ): Promise<boolean> {
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
                    hasPermission = this.evaluateConditions(
                        permission.conditions_schema,
                        context,
                        userId,
                        userPermissions,
                    );
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

        const userRepo = this.db.getRepository(User);
        const userRoleRepo = this.db.getRepository(UserRole);
        const roleRepo = this.db.getRepository(Role);
        const permissionRepo = this.db.getRepository(Permission);

        const user = await userRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // Get user roles
        const userRoles = await userRoleRepo.find({
            where: { user_id: userId, is_active: true },
        });

        const roleIds = userRoles.map(ur => ur.role_id);
        const roles = await roleRepo.find({
            where: { id: roleIds },
        });

        // Get permissions for all roles
        const permissions: Permission[] = [];
        for (const role of roles) {
            // In a real implementation, you would have a role_permissions table
            // For now, we'll use a simple approach based on role name
            const rolePermissions = await this.getPermissionsForRole(role.name);
            permissions.push(...rolePermissions);
        }

        const userPermissions: UserPermissions = {
            userId,
            permissions,
            roles,
            scopes: {
                department_id: user.department_id,
                role: user.role,
            },
        };

        this.userPermissionsCache.set(userId, userPermissions);
        return userPermissions;
    }

    private async getPermissionsForRole(roleName: string): Promise<Permission[]> {
        const permissionRepo = this.db.getRepository(Permission);
        
        // This is a simplified implementation
        // In a real system, you would have a role_permissions junction table
        switch (roleName.toLowerCase()) {
            case 'admin':
                return await permissionRepo.find();
            case 'manager':
                return await permissionRepo.find({
                    where: [
                        { resource: 'contract', action: 'read' },
                        { resource: 'contract', action: 'write' },
                        { resource: 'user', action: 'read' },
                        { resource: 'department', action: 'read' },
                    ],
                });
            case 'staff':
                return await permissionRepo.find({
                    where: [
                        { resource: 'contract', action: 'read' },
                        { resource: 'user', action: 'read' },
                    ],
                });
            default:
                return [];
        }
    }

    // ==================== CONTRACT PERMISSIONS ====================

    async canCreateContract(userId: number, contractType: string): Promise<boolean> {
        return this.hasPermission(userId, 'contract', 'create', { type: contractType });
    }

    async canViewContract(userId: number, contractId: string): Promise<boolean> {
        return this.hasPermission(userId, 'contract', 'read', { contract_id: contractId });
    }

    async canEditContract(userId: number, contractId: string): Promise<boolean> {
        return this.hasPermission(userId, 'contract', 'update', { contract_id: contractId });
    }

    async canDeleteContract(userId: number, contractId: string): Promise<boolean> {
        return this.hasPermission(userId, 'contract', 'delete', { contract_id: contractId });
    }

    // ==================== SESSION MANAGEMENT ====================

    async validateSession(sessionId: string, accessToken: string): Promise<User> {
        const sessionRepo = this.db.getRepository(UserSession);
        const userRepo = this.db.getRepository(User);

        const session = await sessionRepo.findOne({
            where: { session_id: sessionId, is_active: true },
        });

        if (!session) {
            throw new UnauthorizedException('Invalid session');
        }

        if (session.expires_at < new Date()) {
            await this.invalidateSession(sessionId, 'expired');
            throw new UnauthorizedException('Session expired');
        }

        const user = await userRepo.findOne({
            where: { id: session.user_id },
        });

        if (!user || !user.is_active) {
            await this.invalidateSession(sessionId, 'user_inactive');
            throw new UnauthorizedException('User not found or inactive');
        }

        // Update last activity
        session.last_activity = new Date();
        await sessionRepo.save(session);

        return user;
    }

    async invalidateSession(sessionId: string, reason: string): Promise<void> {
        const sessionRepo = this.db.getRepository(UserSession);
        await sessionRepo.update(
            { session_id: sessionId },
            {
                is_active: false,
                logout_at: new Date(),
                logout_reason: reason,
            },
        );
    }

    async cleanupExpiredSessions(): Promise<void> {
        const sessionRepo = this.db.getRepository(UserSession);
        await sessionRepo.update(
            {
                is_active: true,
                expires_at: new Date(),
            },
            {
                is_active: false,
                logout_at: new Date(),
                logout_reason: 'expired',
            },
        );
    }

    // ==================== HELPER METHODS ====================

    private evaluateConditions(
        conditionsSchema: any,
        context: Record<string, any>,
        userId: number,
        userPermissions: UserPermissions,
    ): boolean {
        // This is a simplified condition evaluator
        // In a real implementation, you would have a more sophisticated rule engine
        try {
            // Example: Check if user owns the resource
            if (conditionsSchema.owner_check && context.owner_id) {
                return context.owner_id === userId;
            }

            // Example: Check department access
            if (conditionsSchema.department_check && context.department_id) {
                return context.department_id === userPermissions.scopes.department_id;
            }

            // Example: Check role-based access
            if (conditionsSchema.role_check && context.required_role) {
                return userPermissions.roles.some(role => role.name === context.required_role);
            }

            return true;
        } catch (error) {
            this.logger.APP.error('Error evaluating permission conditions', error);
            return false;
        }
    }

    // ==================== CACHE MANAGEMENT ====================

    clearUserCache(userId: number): void {
        this.userPermissionsCache.delete(userId);
        // Clear related permission cache entries
        for (const key of this.permissionCache.keys()) {
            if (key.startsWith(`${userId}:`)) {
                this.permissionCache.delete(key);
            }
        }
    }

    clearAllCaches(): void {
        this.permissionCache.clear();
        this.userPermissionsCache.clear();
    }
}
