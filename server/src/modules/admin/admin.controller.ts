import { LoggerTypes } from '@/core/shared/logger/logger.types';
import { Body, Controller, Get, Inject, Param, Put, UseGuards } from '@nestjs/common';
import { AuthGuardAccess } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/role.guard';
import { Roles } from '@/core/shared/decorators/setmeta.decorator';
import { Role } from '@/core/shared/enums/base.enums';
import { AdminService } from './admin.service';
import { CreateUserRequest } from '@/core/dto/user/user.request';
import {
    DepartmentResponse,
    UpdateDepartmentManagerRequest,
    RoleResponse,
    RolePermissionsResponse,
    PermissionCatalogResponse,
} from '@/core/shared/types/api-response.types';

@Controller('admin')
@UseGuards(AuthGuardAccess, RolesGuard)
export class AdminController {
    constructor(
        @Inject('LOGGER') private readonly logger: LoggerTypes,
        private readonly adminService: AdminService,
    ) {}

    // ==== Departments ====
    @Get('departments')
    @Roles(Role.MANAGER)
    async getAllDepartments(): Promise<DepartmentResponse[]> {
        return this.adminService.getAllDepartments();
    }

    @Get('departments/:id')
    @Roles(Role.MANAGER)
    async getDepartment(@Param('id') id: number): Promise<DepartmentResponse> {
        return this.adminService.getOneDepartment(id);
    }

    @Put('departments/:id')
    @Roles(Role.MANAGER)
    async updateManagerDepartment(
        @Param('id') idDepartment: number,
        @Body() req: UpdateDepartmentManagerRequest,
    ): Promise<DepartmentResponse> {
        return this.adminService.updateManagerDepartment(idDepartment, req.id_manager);
    }

    // ==== System Roles & Permissions (Read-only) ====
    @Get('roles')
    @Roles(Role.MANAGER)
    async listRoles(): Promise<{ data: RoleResponse[]; total: number }> {
        return {
            data: [
                { id: 'manager', name: 'MANAGER', displayName: 'Manager', description: 'System manager role' },
                { id: 'staff', name: 'STAFF', displayName: 'Staff', description: 'System staff role' },
            ],
            total: 2,
        };
    }

    @Get('roles/:id/permissions')
    @Roles(Role.MANAGER)
    async getRolePermissions(@Param('id') id: string): Promise<RolePermissionsResponse> {
        const managerPerms = [
            { resource: 'contract', action: 'create' },
            { resource: 'contract', action: 'read' },
            { resource: 'contract', action: 'update' },
            { resource: 'contract', action: 'delete' },
            { resource: 'contract', action: 'approve' },
            { resource: 'contract', action: 'export' },
            { resource: 'template', action: 'manage' },
            { resource: 'dashboard', action: 'view' },
            { resource: 'dashboard', action: 'analytics' },
            { resource: 'audit', action: 'view' },
        ];
        const staffPerms = [
            { resource: 'contract', action: 'create' },
            { resource: 'dashboard', action: 'view' },
        ];
        const permissions = id === 'manager' ? managerPerms : staffPerms;
        return { permissions };
    }

    @Get('permissions/catalog')
    @Roles(Role.MANAGER)
    async getPermissionCatalog(): Promise<PermissionCatalogResponse> {
        return {
            resources: ['contract', 'template', 'dashboard', 'audit', 'user', 'notification'],
            actions: [
                'create',
                'read',
                'update',
                'delete',
                'approve',
                'reject',
                'export',
                'manage',
                'analytics',
                'view',
            ],
        };
    }
}
