import { LoggerTypes } from '@/core/shared/logger/logger.types';
import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuardAccess } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/role.guard';
import { Roles } from '@/core/shared/decorators/setmeta.decorator';
import { Role } from '@/core/shared/enums/base.enums';
import { AdminService } from './admin.service';
import { CreateUserRequest } from '@/core/dto/user/user.request';
import { AuthService as AuthCoreService } from '../auth/auth/auth.service';

@Controller('admin')
@UseGuards(AuthGuardAccess, RolesGuard)
export class AdminController {
	constructor(
		@Inject('LOGGER') private readonly logger: LoggerTypes,
		private readonly adminService: AdminService,
		private readonly authCore: AuthCoreService,
	) {}

	// ==== Departments ====
	@Get('departments')
	@Roles(Role.MANAGER)
	async getAllDepartments() {
		return this.adminService.getAllDepartments();
	}
	@Get('departments/:id')
	@Roles(Role.MANAGER)
	async getDepartment(@Param('id') id: number) {
		return this.adminService.getOneDepartment(id);
	}
	@Put('departments/:id')
	@Roles(Role.MANAGER)
	async updateManagerDepartment(@Param('id') idDepartment: number, @Body() req: any) {
		return this.adminService.updateManagerDepartment(idDepartment, req.id_manager);
	}
	@Post('departments/manager')
	@Roles(Role.MANAGER)
	async createManagerUser(@Body() req: CreateUserRequest) {
		return this.adminService.createManagerUser(req);
	}

	// ==== Users management (delegate to user module or keep minimal) ====
	@Get('users')
	@Roles(Role.MANAGER)
	async listUsers(@Query() _query: any) {
		// Delegate to user module in future
		return { data: [], total: 0 };
	}
	@Post('users')
	@Roles(Role.MANAGER)
	async createUser(@Body() _body: any) {
		return { error: 'Use /manager/staff in user module' } as any;
	}
	@Put('users/:id')
	@Roles(Role.MANAGER)
	async updateUser(@Param('id') id: string, @Body() _body: any) {
		return { error: 'Use user module to update user', id } as any;
	}
	@Delete('users/:id')
	@Roles(Role.MANAGER)
	async deactivateUser(@Param('id') id: string) {
		return { error: 'Use user module to deactivate', id } as any;
	}

	@Get('users/:id/roles')
	@Roles(Role.MANAGER)
	async getUserRoles(@Param('id') id: string) {
		const userRoles = await this.authCore.getUserRoles(Number(id));
		const roleNames: string[] = userRoles.map((r: any) => (r.role_id || '').toUpperCase());
		return { roles: roleNames } as any;
	}
	@Post('users/:id/roles')
	@Roles(Role.MANAGER)
	async assignUserRoles(
		@Param('id') id: string,
		@Body() body: { roles: Array<{ roleId: string; scope?: string; scopeId?: number }> },
	) {
		await this.authCore.updateUserRoles(Number(id), body.roles || []);
		return { success: true };
	}

	@Get('users/:id/permissions')
	@Roles(Role.MANAGER)
	async getEffectivePermissions(@Param('id') _id: string) {
		return { capabilities: { is_manager: true } } as any;
	}

	// ==== Roles (static) ====
	@Get('roles')
	@Roles(Role.MANAGER)
	async listRoles() {
		return { data: [{ id: 'manager', name: 'MANAGER' }, { id: 'staff', name: 'STAFF' }], total: 2 } as any;
	}
	@Post('roles')
	@Roles(Role.MANAGER)
	async createRole(@Body() _body: Partial<{ name: string; displayName?: string; description?: string; priority?: number }>) {
		return { error: 'Role creation disabled. Use fixed MANAGER/STAFF.' } as any;
	}
	@Put('roles/:id')
	@Roles(Role.MANAGER)
	async updateRole(
		@Param('id') _id: string,
		@Body() _body: Partial<{ name: string; displayName?: string; description?: string; priority?: number }>,
	) {
		return { error: 'Role update disabled. Use fixed MANAGER/STAFF.' } as any;
	}
	@Delete('roles/:id')
	@Roles(Role.MANAGER)
	async deleteRole(@Param('id') _id: string) {
		return { error: 'Role delete disabled. Use fixed MANAGER/STAFF.' } as any;
	}

	@Get('roles/:id/permissions')
	@Roles(Role.MANAGER)
	async getRolePermissions(@Param('id') id: string) {
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
	@Roles(Role.MANAGER)
	async setRolePermissions(
		@Param('id') _id: string,
		@Body() _body: { permissions: Array<{ resource: string; action: string; conditions?: any }> },
	) {
		return { error: 'Dynamic role permissions disabled.' } as any;
	}

	@Get('permissions/catalog')
	@Roles(Role.MANAGER)
	async getPermissionCatalog() {
		return {
			resources: ['contract', 'template', 'dashboard', 'audit', 'user', 'notification'],
			actions: ['create', 'read', 'update', 'delete', 'approve', 'reject', 'export', 'manage', 'analytics', 'view'],
		};
	}
}
