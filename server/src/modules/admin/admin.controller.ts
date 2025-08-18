import { LoggerTypes } from '@/core/shared/logger/logger.types';
import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuardAccess } from '../auth/guards/jwt-auth.guard';
import { AdminService } from './admin.service';
import { CreateUserRequest } from '@/core/dto/user/user.request';
import { AuthCoreService } from '../auth/auth/auth-core.service';
import { Repository } from 'typeorm';
import { Role as RoleEntity } from '@/core/domain/permission/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { 
    CreateUserDto, 
    UpdateUserDto, 
    CreateRoleDto, 
    UpdateRoleDto, 
    AssignUserRolesDto, 
    SetRolePermissionsDto,
    CreateSystemNotificationDto 
} from '@/core/dto/admin/admin.request';
import { 
    UserResponse, 
    RoleResponse, 
    PermissionResponse, 
    UserPermissionResponse, 
    RolePermissionResponse,
    SystemNotificationResponse,
    AuditLogResponse,
    PermissionCatalogResponse,
    PaginatedResponse 
} from '@/core/dto/admin/admin.response';

@Controller('admin')
@UseGuards(AuthGuardAccess)
export class AdminController {
    constructor(
        @Inject('LOGGER') private readonly logger: LoggerTypes,
        private readonly adminService: AdminService,
        private readonly authCore: AuthCoreService,
        @InjectRepository(RoleEntity) private readonly roleRepo: Repository<RoleEntity>,
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
    async listUsers(@Query() query: any): Promise<PaginatedResponse<UserResponse>> {
        const result = await this.adminService.listUsers(query);
        return result;
    }

    @Post('users')
    async createUser(@Body() body: CreateUserDto): Promise<UserResponse> {
        const result = await this.adminService.createUser(body);
        return result;
    }

    @Put('users/:id')
    async updateUser(@Param('id') id: string, @Body() body: UpdateUserDto): Promise<UserResponse> {
        const result = await this.adminService.updateUser(Number(id), body);
        return result;
    }

    @Delete('users/:id')
    async deactivateUser(@Param('id') id: string): Promise<{ success: boolean }> {
        const result = await this.adminService.deactivateUser(Number(id));
        return result;
    }

    @Get('users/:id/roles')
    async getUserRoles(@Param('id') id: string): Promise<{ roles: string[] }> {
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
        @Body() body: AssignUserRolesDto,
    ): Promise<{ success: boolean }> {
        await this.authCore.updateUserRoles(Number(id), body.roles || []);
        return { success: true };
    }

    @Get('users/:id/permissions')
    async getEffectivePermissions(@Param('id') id: string): Promise<UserPermissionResponse> {
        const perms = await this.authCore.getUserPermissions(Number(id));
        return {
            user_id: Number(id),
            permissions: (perms?.permissions || []).map((p: any) => ({
                id: p.id,
                resource: p.resource,
                action: p.action,
                display_name: p.display_name,
                is_active: p.is_active,
                conditions_schema: p.conditions_schema,
            })),
        };
    }

    // ==== Roles & permissions ====
    @Get('roles')
    async listRoles(): Promise<PaginatedResponse<RoleResponse>> {
        const result = await this.adminService.listRoles();
        return result;
    }

    @Post('roles')
    async createRole(@Body() body: CreateRoleDto): Promise<RoleResponse> {
        const result = await this.adminService.createRole(body);
        return result;
    }

    @Put('roles/:id')
    async updateRole(
        @Param('id') id: string,
        @Body() body: UpdateRoleDto,
    ): Promise<RoleResponse> {
        const result = await this.adminService.updateRole(id, body);
        return result;
    }

    @Delete('roles/:id')
    async deleteRole(@Param('id') id: string): Promise<{ success: boolean }> {
        const result = await this.adminService.deleteRole(id);
        return result;
    }

    @Get('roles/:id/permissions')
    async getRolePermissions(@Param('id') id: string): Promise<RolePermissionResponse> {
        const result = await this.adminService.getRolePermissions(id);
        return result;
    }

    @Put('roles/:id/permissions')
    async setRolePermissions(
        @Param('id') id: string,
        @Body() body: SetRolePermissionsDto,
    ): Promise<{ success: boolean }> {
        const result = await this.adminService.setRolePermissions(id, body);
        return result;
    }

    @Get('permissions/catalog')
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

    // ==== System Notifications ====
    @Post('notifications/system')
    async createSystemNotification(@Body() body: CreateSystemNotificationDto): Promise<SystemNotificationResponse> {
        const result = await this.adminService.createSystemNotification(body);
        return result;
    }

    @Get('notifications/system')
    async listSystemNotifications(): Promise<PaginatedResponse<SystemNotificationResponse>> {
        const result = await this.adminService.listSystemNotifications();
        return result;
    }

    // ==== Audit Log ====
    @Get('audit-logs')
    async getAuditLogs(@Query() query: any): Promise<PaginatedResponse<AuditLogResponse>> {
        const result = await this.adminService.getAuditLogs(query);
        return result;
    }
}
