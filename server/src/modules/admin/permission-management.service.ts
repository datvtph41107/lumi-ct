import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../core/domain/auth/role.entity';
import { Permission } from '../../core/domain/auth/permission.entity';
import { UserRole } from '../../core/domain/auth/user-role.entity';
import { AuditLogService } from './audit-log.service';
import { User } from '../../core/domain/user/user.entity';

@Injectable()
export class PermissionManagementService {
    constructor(
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
        @InjectRepository(Permission)
        private readonly permissionRepository: Repository<Permission>,
        @InjectRepository(UserRole)
        private readonly userRoleRepository: Repository<UserRole>,
        private readonly auditLogService: AuditLogService,
    ) {}

    async getRoles(): Promise<Role[]> {
        return this.roleRepository.find({
            relations: ['permissions'],
            order: { name: 'ASC' },
        });
    }

    async getRole(roleId: string): Promise<Role> {
        const role = await this.roleRepository.findOne({
            where: { id: roleId },
            relations: ['permissions'],
        });

        if (!role) {
            throw new NotFoundException('Vai trò không tồn tại');
        }

        return role;
    }

    async createRole(roleData: any, currentUser: User): Promise<Role> {
        const existingRole = await this.roleRepository.findOne({
            where: { name: roleData.name },
        });

        if (existingRole) {
            throw new BadRequestException('Tên vai trò đã tồn tại');
        }

        const role = this.roleRepository.create(roleData);
        const savedRole = await this.roleRepository.save(role);

        // Log audit
        await this.auditLogService.log({
            user_id: currentUser.id,
            action: 'role_created',
            resource_type: 'role',
            resource_id: savedRole.id,
            details: { created_role: roleData },
        });

        return savedRole;
    }

    async updateRole(roleId: string, roleData: any, currentUser: User): Promise<Role> {
        const role = await this.getRole(roleId);

        if (roleData.name && roleData.name !== role.name) {
            const existingRole = await this.roleRepository.findOne({
                where: { name: roleData.name },
            });

            if (existingRole) {
                throw new BadRequestException('Tên vai trò đã tồn tại');
            }
        }

        Object.assign(role, roleData);
        const updatedRole = await this.roleRepository.save(role);

        // Log audit
        await this.auditLogService.log({
            user_id: currentUser.id,
            action: 'role_updated',
            resource_type: 'role',
            resource_id: roleId,
            details: { updated_fields: roleData },
        });

        return updatedRole;
    }

    async deleteRole(roleId: string, currentUser: User): Promise<void> {
        const role = await this.getRole(roleId);

        // Check if role is system role
        if (role.is_system) {
            throw new BadRequestException('Không thể xóa vai trò hệ thống');
        }

        // Check if role is assigned to any users
        const userRoles = await this.userRoleRepository.find({
            where: { role_id: roleId },
        });

        if (userRoles.length > 0) {
            throw new BadRequestException('Không thể xóa vai trò đang được sử dụng');
        }

        await this.roleRepository.remove(role);

        // Log audit
        await this.auditLogService.log({
            user_id: currentUser.id,
            action: 'role_deleted',
            resource_type: 'role',
            resource_id: roleId,
            details: { deleted_role: { name: role.name } },
        });
    }

    async getPermissions(): Promise<Permission[]> {
        return this.permissionRepository.find({
            order: { resource: 'ASC', action: 'ASC' },
        });
    }

    async getPermission(permissionId: string): Promise<Permission> {
        const permission = await this.permissionRepository.findOne({
            where: { id: permissionId },
        });

        if (!permission) {
            throw new NotFoundException('Quyền không tồn tại');
        }

        return permission;
    }

    async createPermission(permissionData: any, currentUser: User): Promise<Permission> {
        const existingPermission = await this.permissionRepository.findOne({
            where: { 
                resource: permissionData.resource,
                action: permissionData.action,
            },
        });

        if (existingPermission) {
            throw new BadRequestException('Quyền đã tồn tại');
        }

        const permission = this.permissionRepository.create(permissionData);
        const savedPermission = await this.permissionRepository.save(permission);

        // Log audit
        await this.auditLogService.log({
            user_id: currentUser.id,
            action: 'permission_created',
            resource_type: 'permission',
            resource_id: savedPermission.id,
            details: { created_permission: permissionData },
        });

        return savedPermission;
    }

    async updatePermission(permissionId: string, permissionData: any, currentUser: User): Promise<Permission> {
        const permission = await this.getPermission(permissionId);

        Object.assign(permission, permissionData);
        const updatedPermission = await this.permissionRepository.save(permission);

        // Log audit
        await this.auditLogService.log({
            user_id: currentUser.id,
            action: 'permission_updated',
            resource_type: 'permission',
            resource_id: permissionId,
            details: { updated_fields: permissionData },
        });

        return updatedPermission;
    }

    async deletePermission(permissionId: string, currentUser: User): Promise<void> {
        const permission = await this.getPermission(permissionId);

        await this.permissionRepository.remove(permission);

        // Log audit
        await this.auditLogService.log({
            user_id: currentUser.id,
            action: 'permission_deleted',
            resource_type: 'permission',
            resource_id: permissionId,
            details: { deleted_permission: { resource: permission.resource, action: permission.action } },
        });
    }

    async assignPermissionsToRole(roleId: string, permissionIds: string[], currentUser: User): Promise<void> {
        const role = await this.getRole(roleId);
        const permissions = await this.permissionRepository.find({
            where: { id: permissionIds },
        });

        if (permissions.length !== permissionIds.length) {
            throw new BadRequestException('Một số quyền không tồn tại');
        }

        role.permissions = permissions;
        await this.roleRepository.save(role);

        // Log audit
        await this.auditLogService.log({
            user_id: currentUser.id,
            action: 'role_permissions_updated',
            resource_type: 'role',
            resource_id: roleId,
            details: { assigned_permissions: permissionIds },
        });
    }

    async getRolePermissions(roleId: string): Promise<Permission[]> {
        const role = await this.getRole(roleId);
        return role.permissions || [];
    }

    async getUserRoles(userId: string): Promise<Role[]> {
        const userRoles = await this.userRoleRepository.find({
            where: { user_id: userId },
            relations: ['role'],
        });

        return userRoles.map(ur => ur.role);
    }

    async getUserPermissions(userId: string): Promise<Permission[]> {
        const userRoles = await this.getUserRoles(userId);
        const permissions: Permission[] = [];

        for (const role of userRoles) {
            if (role.permissions) {
                permissions.push(...role.permissions);
            }
        }

        // Remove duplicates
        return permissions.filter((permission, index, self) => 
            index === self.findIndex(p => p.id === permission.id)
        );
    }

    async getPermissionCatalog(): Promise<{ resources: string[]; actions: string[] }> {
        const permissions = await this.getPermissions();
        
        const resources = [...new Set(permissions.map(p => p.resource))];
        const actions = [...new Set(permissions.map(p => p.action))];

        return {
            resources: resources.sort(),
            actions: actions.sort(),
        };
    }
}