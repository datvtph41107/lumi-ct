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
        this.logger.APP.info('Parameters: ', id);
        const result = await this.adminService.getOneDepartment(id);
        return result;
    }

    @Put('departments/:id')
    async updateManagerDepartment(@Param('id') idDepartment: number, @Body() req: any) {
        this.logger.APP.info('Parameters: ', idDepartment);
        const result = await this.adminService.updateManagerDepartment(idDepartment, req.id_manager);
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
    async listUsers(@Query() query: any) {
        return { data: [], total: 0 };
    }

    @Post('users')
    async createUser(@Body() body: any) {
        return { id: Date.now(), ...body };
    }
    @Put('users/:id')
    async updateUser(@Param('id') id: string, @Body() body: any) {
        return { id, ...body };
    }
    @Delete('users/:id')
    async deactivateUser(@Param('id') id: string) {
        return { success: true };
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
            permissions: (perms?.permissions || []).map((p: any) => ({
                resource: p.resource,
                action: p.action,
                conditions: p.conditions_schema,
            })),
        };
    }

    // ==== Roles & permissions ====
    @Get('roles')
    async listRoles() {
        return { data: [], total: 0 };
    }
    @Post('roles')
    async createRole(
        @Body() body: Partial<{ name: string; displayName?: string; description?: string; priority?: number }>,
    ) {
        return { id: body.name || `role-${Date.now()}`, ...body };
    }
    @Put('roles/:id')
    async updateRole(
        @Param('id') id: string,
        @Body() body: Partial<{ name: string; displayName?: string; description?: string; priority?: number }>,
    ) {
        return { id, ...body };
    }
    @Delete('roles/:id')
    async deleteRole(@Param('id') id: string) {
        return { success: true };
    }

    @Get('roles/:id/permissions')
    async getRolePermissions(@Param('id') id: string) {
        return { permissions: [] };
    }
    @Put('roles/:id/permissions')
    async setRolePermissions(
        @Param('id') id: string,
        @Body() body: { permissions: Array<{ resource: string; action: string; conditions?: any }> },
    ) {
        return { success: true };
    }

    @Get('permissions/catalog')
    async getPermissionCatalog() {
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
