import { Body, Controller, Get, Inject, Post, Put, Delete, Param, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AuthGuardAccess } from '../auth/guards/jwt-auth.guard';
import { LoggerTypes } from '@/core/shared/logger/logger.types';
import { UserService } from './user.service';
import { RolesGuard } from '../auth/guards/role.guard';
import { Roles } from '@/core/shared/decorators/setmeta.decorator';
import { AdminRole, Role } from '@/core/shared/enums/base.enums';
import { PermissionsGuard } from '../auth/guards/permission.guard';
import { CreateUserRequest } from '@/core/dto/user/user.request';
import { HeaderRequest, HeaderUserPayload } from '@/core/shared/interface/header-payload-req.interface';
import { User } from '@/core/domain/user';

@UseGuards(AuthGuardAccess, RolesGuard, PermissionsGuard)
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

    @Roles(Role.MANAGER, AdminRole.SUPER_ADMIN)
    @Post('manager/staff')
    async createNewStaff(@Body() req: CreateUserRequest, @Req() reqHeader: HeaderRequest) {
        this.logger.APP.info('Login Req -> data: ' + JSON.stringify(req));
        const creator: HeaderUserPayload = reqHeader.user;
        const result = await this.userService.createNewStaff(req, creator);
        return result;
    }

    @Get('manager/staff')
    async getAllStaffOfDepart(@Req() reqHeader: HeaderRequest) {
        this.logger.APP.info('Get Data response: ');
        const creator: HeaderUserPayload = reqHeader.user;
        const result = await this.userService.getAllStaffOfDepart(creator);
        return result;
    }

    @Get('users/:id')
    async getUserById(@Param('id', ParseIntPipe) id: number) {
        this.logger.APP.info(`Get user by ID: ${id}`);
        const user = await this.userService.getUserById(id);
        return user;
    }

    @Put('users/:id')
    async updateUser(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateData: Partial<User>
    ) {
        this.logger.APP.info(`Update user ID: ${id}`);
        const updatedUser = await this.userService.updateUser(id, updateData);
        return updatedUser;
    }

    @Delete('users/:id')
    async deleteUser(@Param('id', ParseIntPipe) id: number) {
        this.logger.APP.info(`Delete user ID: ${id}`);
        const result = await this.userService.deleteUser(id);
        return result;
    }
}
