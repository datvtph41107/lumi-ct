import { Body, Controller, Get, Post, Req, Res, UseGuards, BadRequestException, Inject } from '@nestjs/common';
import { Request, Response } from 'express';
import { TokenService } from '../jwt/jwt.service';
import { AuthGuardAccess } from '../guards/jwt-auth.guard';
import { CurrentUser } from '@/core/shared/decorators/setmeta.decorator';
import { User } from '@/core/domain/user/user.entity';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Department } from '@/core/domain/department/department.entity';
import { LoginDto } from '@/core/dto/auth/login.dto';
import { UserPermission } from '@/core/domain/permission/user-permission.entity';
import { LoggerTypes } from '@/core/shared/logger/logger.types';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly tokenService: TokenService,
        @Inject('DATA_SOURCE') private readonly db: DataSource,
        @Inject('LOGGER') private readonly logger: LoggerTypes,
    ) {}

    @Post('login')
    async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
        const { username, password, is_manager_login } = body as any;
        const userRepo = this.db.getRepository(User);
        const deptRepo = this.db.getRepository(Department);
        const permRepo = this.db.getRepository(UserPermission);

        const user = await userRepo.findOne({ where: { username } });
        if (!user) throw new BadRequestException('Sai tài khoản hoặc mật khẩu');

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) throw new BadRequestException('Sai tài khoản hoặc mật khẩu');

        const department = user.department_id ? await deptRepo.findOne({ where: { id: user.department_id } }) : null;
        const permissionRow = await permRepo.findOne({ where: { user_id: user.id } });
        const permissions = {
            create_contract: !!permissionRow?.create_contract,
            create_report: !!permissionRow?.create_report,
            read: !!permissionRow?.read,
            update: !!permissionRow?.update,
            delete: !!permissionRow?.delete,
            approve: !!permissionRow?.approve,
            assign: !!permissionRow?.assign,
        } as const;

        const sessionId = `${Date.now()}_${user.id}`;
        const tokens = await this.tokenService.getUserTokens(
            user,
            { permissions, department },
            sessionId,
        );

        res.cookie('refreshToken', tokens.refresh_token, { httpOnly: true, sameSite: 'strict', path: '/' });
        res.cookie('sessionId', sessionId, { httpOnly: true, sameSite: 'strict', path: '/' });

        return {
            status: 'success',
            data: {
                access_token: tokens.access_token,
                user: {
                    id: user.id,
                    username: user.username,
                    name: user.name,
                    isManager: user.role === 'MANAGER',
                },
            },
            meta: { timestamp: new Date().toISOString() },
        } as any;
    }

    @Post('refresh-token')
    async refreshFromCookie(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const refreshToken = (req as any).cookies?.refreshToken;
        if (!refreshToken) return { success: false, message: 'No refresh token cookie found' } as any;
        const payload = await this.tokenService.verifyRefreshToken(refreshToken);
        // recover minimal user context for new tokens
        const userRepo = this.db.getRepository(User);
        const permRepo = this.db.getRepository(UserPermission);
        const deptRepo = this.db.getRepository(Department);
        const user = await userRepo.findOne({ where: { id: payload.userId } });
        if (!user) throw new BadRequestException('User not found');
        const permissionRow = await permRepo.findOne({ where: { user_id: user.id } });
        const department = user.department_id ? await deptRepo.findOne({ where: { id: user.department_id } }) : null;
        const permissions = {
            create_contract: !!permissionRow?.create_contract,
            create_report: !!permissionRow?.create_report,
            read: !!permissionRow?.read,
            update: !!permissionRow?.update,
            delete: !!permissionRow?.delete,
            approve: !!permissionRow?.approve,
            assign: !!permissionRow?.assign,
        } as const;
        const tokens = await this.tokenService.getUserTokens(user as any, { permissions, department }, payload.sessionId);
        res.cookie('refreshToken', tokens.refresh_token, { httpOnly: true, sameSite: 'strict', path: '/' });
        return { success: true, data: { access_token: tokens.access_token } } as any;
    }

    @Post('logout')
    @UseGuards(AuthGuardAccess)
    async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const sessionId = (req as any).cookies?.sessionId;
        if (sessionId) await this.tokenService.revokeSession(sessionId as any);
        res.clearCookie('refreshToken', { path: '/' });
        res.clearCookie('sessionId', { path: '/' });
        return { success: true, message: 'Đăng xuất thành công' };
    }

    @Get('me')
    @UseGuards(AuthGuardAccess)
    async me(@CurrentUser() user: User) {
        return { success: true, data: user };
    }
}
