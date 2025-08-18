import { LoggerTypes } from '@/core/shared/logger/logger.types';
import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuardAccess } from '../auth/guards/jwt-auth.guard';
import { AdminService } from './admin.service';
import { CreateUserRequest } from '@/core/dto/user/user.request';
import { AuthService as AuthCoreService } from '../auth/auth/auth.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Controller('admin')
@UseGuards(AuthGuardAccess)
export class AdminController {
    constructor(
        @Inject('LOGGER') private readonly logger: LoggerTypes,
        private readonly adminService: AdminService,
        private readonly authCore: AuthCoreService,
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
        const roleNames: string[] = userRoles.map((r: any) => (r.role_id || '').toUpperCase());
        return { roles: roleNames } as any;
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
        const list = Array.isArray(perms.permissions)
            ? perms.permissions.map((p: any) => ({
                  resource: p.resource,
                  action: p.action,
                  conditions: p.conditions_schema,
              }))
            : [];
        return { permissions: list } as any;
    }

    // ==== Roles & permissions ====
    @Get('roles')
    async listRoles() {
        // Fixed model: only MANAGER and STAFF available
        return {
            data: [
                { id: 'manager', name: 'MANAGER' },
                { id: 'staff', name: 'STAFF' },
            ],
            total: 2,
        } as any;
    }
    @Post('roles')
    async createRole(
        @Body() _body: Partial<{ name: string; displayName?: string; description?: string; priority?: number }>,
    ) {
        return { error: 'Role creation disabled. Use fixed MANAGER/STAFF.' } as any;
    }
    @Put('roles/:id')
    async updateRole(
        @Param('id') _id: string,
        @Body() _body: Partial<{ name: string; displayName?: string; description?: string; priority?: number }>,
    ) {
        return { error: 'Role update disabled. Use fixed MANAGER/STAFF.' } as any;
    }
    @Delete('roles/:id')
    async deleteRole(@Param('id') _id: string) {
        return { error: 'Role delete disabled. Use fixed MANAGER/STAFF.' } as any;
    }

    @Get('roles/:id/permissions')
    async getRolePermissions(@Param('id') id: string) {
        // Provide static permissions mapping
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
        const perms = id === 'manager' ? managerPerms : staffPerms;
        return { permissions: perms } as any;
    }
    @Put('roles/:id/permissions')
    async setRolePermissions(
        @Param('id') _id: string,
        @Body() _body: { permissions: Array<{ resource: string; action: string; conditions?: any }> },
    ) {
        return { error: 'Dynamic role permissions disabled.' } as any;
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
