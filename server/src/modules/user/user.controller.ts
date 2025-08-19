import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuardAccess } from '../auth/guards/jwt-auth.guard';
import { LoggerTypes } from '@/core/shared/logger/logger.types';
import { UserService } from './user.service';
import { RolesGuard } from '../auth/guards/role.guard';
import { Roles, CurrentUser } from '@/core/shared/decorators/setmeta.decorator';
import { AdminRole, Role } from '@/core/shared/enums/base.enums';
import { CreateUserRequest } from '@/core/dto/user/user.request';
import { HeaderRequest, HeaderUserPayload } from '@/core/shared/interface/header-payload-req.interface';
import {
    UserResponse,
    PaginatedResponse,
    UpdateUserRequest,
    UserRolesResponse,
    RoleAssignmentRequest,
    UserCapabilitiesResponse,
    ApiSuccessResponse
} from '@/core/shared/types/api-response.types';

@UseGuards(AuthGuardAccess, RolesGuard)
@Controller()
export class UserController {
    constructor(
        @Inject('LOGGER') private readonly logger: LoggerTypes,
        private readonly userService: UserService,
    ) {}

    @Get('me')
    async getProfile(@Req() reqHeader: HeaderRequest) {
        const userPayload: HeaderUserPayload = reqHeader.user;

        this.logger.APP.info(`Lấy thông tin người dùng: ${userPayload.username}`);
        const user = await this.userService.getUserProfile(userPayload);
        return user;
    }

    // @Permissions({ departments: [Department.ADMINISTRATIVE] })
    @Roles(Role.MANAGER, AdminRole.SUPER_ADMIN)
    @Post('manager/staff')
    async createNewStaff(@Body() req: CreateUserRequest, @Req() reqHeader: HeaderRequest) {
        this.logger.APP.info('Login Req -> data: ' + JSON.stringify(req));
        const creator: HeaderUserPayload = reqHeader.user;
        const result = await this.userService.createNewStaff(req, creator);
        return result;
    }

    @Get('manager/staff')
    async getAllStaffOfDepart(@Req() reqHeader: HeaderRequest): Promise<UserResponse[]> {
        this.logger.APP.info('Get Data response: ');
        const creator: HeaderUserPayload = reqHeader.user;
        const result = await this.userService.getAllStaffOfDepart(creator);
        return result;
    }

    // ==== User Management APIs (moved from admin) ====
    @Get('users')
    @Roles(Role.MANAGER)
    async listUsers(@Query() query: any): Promise<PaginatedResponse<UserResponse>> {
        return this.userService.listUsers(query);
    }

    @Post('users')
    @Roles(Role.MANAGER)
    async createUser(@Body() body: CreateUserRequest): Promise<UserResponse> {
        return this.userService.createUser(body);
    }

    @Put('users/:id')
    @Roles(Role.MANAGER)
    async updateUser(@Param('id') id: string, @Body() body: UpdateUserRequest): Promise<UserResponse> {
        return this.userService.updateUser(Number(id), body);
    }

    @Delete('users/:id')
    @Roles(Role.MANAGER)
    async deactivateUser(@Param('id') id: string): Promise<ApiSuccessResponse> {
        return this.userService.deactivateUser(Number(id));
    }

    @Get('users/:id/roles')
    @Roles(Role.MANAGER)
    async getUserRoles(@Param('id') id: string): Promise<UserRolesResponse> {
        return this.userService.getUserRoles(Number(id));
    }

    @Post('users/:id/roles')
    @Roles(Role.MANAGER)
    async assignUserRoles(
        @Param('id') id: string,
        @Body() body: RoleAssignmentRequest,
    ): Promise<ApiSuccessResponse> {
        return this.userService.assignUserRoles(Number(id), body);
    }

    @Get('users/:id/permissions')
    @Roles(Role.MANAGER)
    async getEffectivePermissions(@Param('id') id: string): Promise<UserCapabilitiesResponse> {
        return this.userService.getEffectivePermissions(Number(id));
    }
}
