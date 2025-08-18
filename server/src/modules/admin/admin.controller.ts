import { LoggerTypes } from '@/core/shared/logger/logger.types';
import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuardAccess } from '../auth/guards/jwt-auth.guard';
import { AdminService } from './admin.service';
import { CreateUserRequest } from '@/core/dto/user/user.request';
import { AuthCoreService } from '../auth/auth/auth-core.service';
import { Repository } from 'typeorm';
import { Role } from '@/core/domain/permission/role.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Controller('admin')
@UseGuards(AuthGuardAccess)
export class AdminController {
    constructor(
        @Inject('LOGGER') private readonly logger: LoggerTypes,
        private readonly adminService: AdminService,
        private readonly authCore: AuthCoreService,
        @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    ) {}

    // ==== Departments (existing) ====
    @Get('departments')
    async getAllDepartments() {
        const result = await this.adminService.getAllDepartments();
        return result;
    }

    @Get('departments/:id')
    async getDepartment(@Param('id') id: number) {
        this.logger.APP.info('Parameters: %d', id);
        const result = await this.adminService.getOneDepartment(id);
        return result;
    }

    @Put('departments/:id')
    async updateManagerDepartment(@Param('id') idDepartment: number, @Body() req: { id_manager: number }) {
        this.logger.APP.info('Parameters: %d', idDepartment);
        const result = await this.adminService.updateManagerDepartment(idDepartment, Number(req.id_manager));
        return result;
    }

    @Post('departments/manager')
    async createManagerUser(@Body() req: CreateUserRequest) {
        this.logger.APP.info('Create department Req -> data: ' + JSON.stringify(req));
        const result = await this.adminService.createManagerUser(req);
        return result;
    }

    // ==== Users management ====
    @Get('users')
    listUsers(@Query() _query: Record<string, unknown>) {
        return { data: [], total: 0 } as const;
    }

    @Post('users')
    createUser(@Body() body: Record<string, unknown>) {
        return { id: Date.now(), ...body } as const;
    }
    @Put('users/:id')
    updateUser(@Param('id') id: string, @Body() body: Record<string, unknown>) {
        return { id, ...body } as const;
    }
    @Delete('users/:id')
    deactivateUser(@Param('id') _id: string) {
        return { success: true } as const;
    }

    @Get('users/:id/roles')
    async getUserRoles(@Param('id') id: string) {
        const userRoles = await this.authCore.getUserRoles(Number(id));
        const roleNames: string[] = [];
        for (const ur of userRoles) {
            const role = await this.roleRepo.findOne({ where: { id: ur.role_id } });
            if (role?.name) roleNames.push(role.name);
        }
        return { roles: roleNames };
    }

    @Post('users/:id/roles')
    async assignUserRoles(
        @Param('id') id: string,
        @Body() body: { roles: Array<{ roleId: string; scope?: string; scopeId?: number }> },
    ) {
        await this.authCore.updateUserRoles(Number(id), body.roles || []);
        return { success: true };
    }

    @Get('users/:id/permissions')
    async getEffectivePermissions(@Param('id') id: string) {
        const perms = await this.authCore.getUserPermissions(Number(id));
        return {
            permissions: (perms?.permissions || []).map(
                (p: { resource: string; action: string; conditions_schema?: unknown }) => ({
                    resource: p.resource,
                    action: p.action,
                    conditions: p.conditions_schema,
                }),
            ),
        };
    }

    // ==== Roles & permissions ====
    @Get('roles')
    listRoles() {
        return { data: [], total: 0 } as const;
    }
    @Post('roles')
    createRole(@Body() body: Partial<{ name: string; displayName?: string; description?: string; priority?: number }>) {
        return { id: body.name || `role-${Date.now()}`, ...body } as const;
    }
    @Put('roles/:id')
    updateRole(
        @Param('id') id: string,
        @Body() body: Partial<{ name: string; displayName?: string; description?: string; priority?: number }>,
    ) {
        return { id, ...body } as const;
    }
    @Delete('roles/:id')
    deleteRole(@Param('id') _id: string) {
        return { success: true } as const;
    }

    @Get('roles/:id/permissions')
    getRolePermissions(@Param('id') _id: string) {
        return { permissions: [] } as const;
    }
    @Put('roles/:id/permissions')
    setRolePermissions(
        @Param('id') _id: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        @Body() body: { permissions: Array<{ resource: string; action: string; conditions?: unknown }> },
    ) {
        return { success: true } as const;
    }

    @Get('permissions/catalog')
    getPermissionCatalog() {
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
        } as const;
    }
}
