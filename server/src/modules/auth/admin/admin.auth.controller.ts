import { Body, Controller, Get, Headers, Inject, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AdminAuthService } from './admin.auth.service';
import { LoginRequest } from '@/core/dto/login/login.request';
import { LoggerTypes } from '@/core/shared/logger/logger.types';
import { CurrentUser, Roles } from '@/core/shared/decorators/setmeta.decorator';
import { AdminRole } from '@/core/shared/enums/base.enums';
import { RolesGuard } from '../guards/role.guard';
import { AuthGuardAccess } from '../guards/jwt-auth.guard';
import { HeaderRequest, HeaderUserPayload } from '@/core/shared/interface/header-payload-req.interface';

@Controller('admin/auth')
export class AdminAuthController {
    constructor(
        @Inject('LOGGER') private readonly logger: LoggerTypes,
        private readonly adminAuthService: AdminAuthService,
    ) {}

    @Post('login')
    async login(@Body() req: LoginRequest, @Res() res: Response) {
        this.logger.APP.info('Login Req -> data: ' + JSON.stringify(req));

        const result = await this.adminAuthService.login(req);

        return res.status(200).json({
            success: true,
            message: '',
            data: result,
        });
    }

    // @Get('refresh-token')
    // async refresh(@Headers('Authorization') header: string) {
    //     return this.adminAuthService.refreshToken(header);
    // }

    @UseGuards(RolesGuard, AuthGuardAccess)
    @Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
    @Get('admin-info')
    adminInfo(@Req() req: HeaderRequest, @CurrentUser() user: HeaderUserPayload): string {
        console.log(user);
        return 'ok';
    }
}
