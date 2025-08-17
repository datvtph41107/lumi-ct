import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UseGuards, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../core/guards/permission.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../core/domain/user/user.entity';
import { UserManagementService, CreateUserDto, UpdateUserDto, UserFiltersDto } from './user-management.service';
import { PermissionManagementService } from './permission-management.service';
import { SystemSettingsService } from './system-settings.service';
import { AuditLogService } from './audit-log.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class AdminController {
    constructor(
        private readonly userManagementService: UserManagementService,
        private readonly permissionManagementService: PermissionManagementService,
        private readonly systemSettingsService: SystemSettingsService,
        private readonly auditLogService: AuditLogService,
    ) {}

    // User Management Endpoints
    @Get('users')
    async getUsers(@Query() filters: UserFiltersDto, @CurrentUser() currentUser: User) {
        const result = await this.userManagementService.getUsers(filters, currentUser);
        
        return {
            success: true,
            message: 'Lấy danh sách người dùng thành công',
            data: result,
        };
    }

    @Get('users/:id')
    async getUser(@Param('id') userId: string, @CurrentUser() currentUser: User) {
        const user = await this.userManagementService.getUser(userId, currentUser);
        
        return {
            success: true,
            message: 'Lấy thông tin người dùng thành công',
            data: user,
        };
    }

    @Post('users')
    async createUser(@Body() userData: CreateUserDto, @CurrentUser() currentUser: User) {
        const user = await this.userManagementService.createUser(userData, currentUser);
        
        return {
            success: true,
            message: 'Tạo người dùng thành công',
            data: user,
        };
    }

    @Put('users/:id')
    async updateUser(
        @Param('id') userId: string,
        @Body() userData: UpdateUserDto,
        @CurrentUser() currentUser: User
    ) {
        const user = await this.userManagementService.updateUser(userId, userData, currentUser);
        
        return {
            success: true,
            message: 'Cập nhật người dùng thành công',
            data: user,
        };
    }

    @Delete('users/:id')
    async deleteUser(@Param('id') userId: string, @CurrentUser() currentUser: User) {
        await this.userManagementService.deleteUser(userId, currentUser);
        
        return {
            success: true,
            message: 'Xóa người dùng thành công',
        };
    }

    @Post('users/bulk-delete')
    async bulkDeleteUsers(@Body() body: { userIds: string[] }, @CurrentUser() currentUser: User) {
        await this.userManagementService.bulkDeleteUsers(body.userIds, currentUser);
        
        return {
            success: true,
            message: `Xóa ${body.userIds.length} người dùng thành công`,
        };
    }

    @Patch('users/:id/activate')
    async activateUser(@Param('id') userId: string, @CurrentUser() currentUser: User) {
        const user = await this.userManagementService.activateUser(userId, currentUser);
        
        return {
            success: true,
            message: 'Kích hoạt người dùng thành công',
            data: user,
        };
    }

    @Patch('users/:id/deactivate')
    async deactivateUser(@Param('id') userId: string, @CurrentUser() currentUser: User) {
        const user = await this.userManagementService.deactivateUser(userId, currentUser);
        
        return {
            success: true,
            message: 'Vô hiệu hóa người dùng thành công',
            data: user,
        };
    }

    @Post('users/:id/reset-password')
    async resetPassword(@Param('id') userId: string, @CurrentUser() currentUser: User) {
        const result = await this.userManagementService.resetPassword(userId, currentUser);
        
        return {
            success: true,
            message: 'Đặt lại mật khẩu thành công',
            data: result,
        };
    }

    @Post('users/:id/assign-role')
    async assignRole(
        @Param('id') userId: string,
        @Body() body: { role: string },
        @CurrentUser() currentUser: User
    ) {
        await this.userManagementService.assignRole(userId, body.role, currentUser);
        
        return {
            success: true,
            message: 'Phân quyền thành công',
        };
    }

    // Permission Management Endpoints
    @Get('roles')
    async getRoles(@CurrentUser() currentUser: User) {
        const roles = await this.permissionManagementService.getRoles();
        
        return {
            success: true,
            message: 'Lấy danh sách vai trò thành công',
            data: roles,
        };
    }

    @Get('permissions')
    async getPermissions(@CurrentUser() currentUser: User) {
        const permissions = await this.permissionManagementService.getPermissions();
        
        return {
            success: true,
            message: 'Lấy danh sách quyền thành công',
            data: permissions,
        };
    }

    @Post('roles')
    async createRole(@Body() roleData: any, @CurrentUser() currentUser: User) {
        const role = await this.permissionManagementService.createRole(roleData, currentUser);
        
        return {
            success: true,
            message: 'Tạo vai trò thành công',
            data: role,
        };
    }

    @Put('roles/:id')
    async updateRole(@Param('id') roleId: string, @Body() roleData: any, @CurrentUser() currentUser: User) {
        const role = await this.permissionManagementService.updateRole(roleId, roleData, currentUser);
        
        return {
            success: true,
            message: 'Cập nhật vai trò thành công',
            data: role,
        };
    }

    @Delete('roles/:id')
    async deleteRole(@Param('id') roleId: string, @CurrentUser() currentUser: User) {
        await this.permissionManagementService.deleteRole(roleId, currentUser);
        
        return {
            success: true,
            message: 'Xóa vai trò thành công',
        };
    }

    // System Settings Endpoints
    @Get('settings')
    async getSystemSettings(@CurrentUser() currentUser: User) {
        const settings = await this.systemSettingsService.getSettings();
        
        return {
            success: true,
            message: 'Lấy cài đặt hệ thống thành công',
            data: settings,
        };
    }

    @Put('settings')
    async updateSystemSettings(@Body() settings: any, @CurrentUser() currentUser: User) {
        const updatedSettings = await this.systemSettingsService.updateSettings(settings, currentUser);
        
        return {
            success: true,
            message: 'Cập nhật cài đặt hệ thống thành công',
            data: updatedSettings,
        };
    }

    // Audit Log Endpoints
    @Get('audit-logs')
    async getAuditLogs(@Query() filters: any, @CurrentUser() currentUser: User) {
        const logs = await this.auditLogService.getLogs(filters, currentUser);
        
        return {
            success: true,
            message: 'Lấy nhật ký hoạt động thành công',
            data: logs,
        };
    }

    @Get('audit-logs/:id')
    async getAuditLog(@Param('id') logId: string, @CurrentUser() currentUser: User) {
        const log = await this.auditLogService.getLog(logId, currentUser);
        
        return {
            success: true,
            message: 'Lấy chi tiết nhật ký thành công',
            data: log,
        };
    }

    // Export Endpoints
    @Get('users/export')
    async exportUsers(@Query() filters: UserFiltersDto, @Query('format') format: string, @Res() res: Response, @CurrentUser() currentUser: User) {
        const data = await this.userManagementService.exportUsers(filters, format as 'csv' | 'excel');
        
        const filename = `users_${new Date().toISOString().split('T')[0]}.${format}`;
        
        res.setHeader('Content-Type', format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        
        res.send(data);
    }

    // Dashboard Endpoints
    @Get('dashboard/stats')
    async getDashboardStats(@CurrentUser() currentUser: User) {
        const stats = await this.systemSettingsService.getDashboardStats(currentUser);
        
        return {
            success: true,
            message: 'Lấy thống kê dashboard thành công',
            data: stats,
        };
    }

    @Get('dashboard/activity')
    async getDashboardActivity(@Query() filters: any, @CurrentUser() currentUser: User) {
        const activity = await this.auditLogService.getRecentActivity(filters, currentUser);
        
        return {
            success: true,
            message: 'Lấy hoạt động gần đây thành công',
            data: activity,
        };
    }
}
