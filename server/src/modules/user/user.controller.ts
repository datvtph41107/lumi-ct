import { Body, Controller, Get, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuardAccess } from '../auth/guards/jwt-auth.guard';
import { LoggerTypes } from '@/core/shared/logger/logger.types';
import { UserService } from './user.service';
import { RolesGuard } from '../auth/guards/role.guard';
import { Roles } from '@/core/shared/decorators/setmeta.decorator';
import { AdminRole, Role } from '@/core/shared/enums/base.enums';
import { CreateUserRequest } from '@/core/dto/user/user.request';
import { HeaderRequest, HeaderUserPayload } from '@/core/shared/interface/header-payload-req.interface';

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
    async getAllStaffOfDepart(@Req() reqHeader: HeaderRequest) {
        this.logger.APP.info('Get Data response: ');
        const creator: HeaderUserPayload = reqHeader.user;
        const result = await this.userService.getAllStaffOfDepart(creator);
        return result;
    }
}
