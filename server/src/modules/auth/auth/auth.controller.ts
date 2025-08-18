import { Body, Controller, Get, Post, Req, Res, UseGuards, UnauthorizedException, Inject } from '@nestjs/common';
import { Request, Response } from 'express';
import { TokenService } from '../jwt/jwt.service';
import { AuthGuardAccess } from '../guards/jwt-auth.guard';
import { CurrentUser } from '@/core/shared/decorators/setmeta.decorator';
import { User } from '@/core/domain/user/user.entity';
import { DataSource } from 'typeorm';
import { LoginDto } from '@/core/dto/auth/login.dto';
import * as bcrypt from 'bcrypt';
import { buildUserContext } from '@/common/utils/context/builder-user-context.utils';
import { Role } from '@/core/shared/enums/base.enums';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly tokenService: TokenService,
        @Inject('DATA_SOURCE') private readonly db: DataSource,
    ) {}

    @Post('login')
    async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
        const dataSource = this.db;
        const userRepo = dataSource.getRepository(User);
        const user = await userRepo.findOne({ where: { username: body.username } });
        if (!user || !user.is_active) throw new UnauthorizedException('Thông tin đăng nhập không hợp lệ');
        const matched = await bcrypt.compare(body.password, user.password);
        if (!matched) throw new UnauthorizedException('Thông tin đăng nhập không hợp lệ');

        if (body.is_manager_login === true && user.role !== Role.MANAGER) {
            throw new UnauthorizedException('Tài khoản không có quyền quản lý');
        }

        const context = await buildUserContext(user, dataSource);
        const sessionId = `${Date.now()}`;
        const tokens = await this.tokenService.getUserTokens(user, context, sessionId);
        res.cookie('refreshToken', tokens.refresh_token, { httpOnly: true, sameSite: 'strict', path: '/' });
        res.cookie('sessionId', sessionId, { httpOnly: true, sameSite: 'strict', path: '/' });
        const responseUser = {
            id: user.id,
            username: user.username,
            role: user.role,
            isManager: user.role === Role.MANAGER,
            department: context.department
                ? {
                      id: context.department.id,
                      name: context.department.name,
                      code: context.department.code,
                  }
                : null,
            permissions: context.permissions,
        };
        return { access_token: tokens.access_token, user: responseUser } as const;
    }

    @Post('refresh-token')
    async refreshFromCookie(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const dataSource = this.db;
        const refreshToken = (req as Request & { cookies?: Record<string, string> }).cookies?.refreshToken;
        if (!refreshToken) return { success: false, message: 'No refresh token cookie found' } as const;
        const payload = await this.tokenService.verifyRefreshToken(refreshToken);
        const userRepo = dataSource.getRepository(User);
        const user = await userRepo.findOne({ where: { id: payload.userId } });
        if (!user) throw new UnauthorizedException('Không tìm thấy người dùng');
        const context = await buildUserContext(user, dataSource);
        const tokens = await this.tokenService.getUserTokens(user, context, payload.sessionId);
        res.cookie('refreshToken', tokens.refresh_token, { httpOnly: true, sameSite: 'strict', path: '/' });
        return {
            accessToken: tokens.access_token,
            sessionId: payload.sessionId,
            tokenExpiry: Math.floor(Date.now() / 1000) + 15 * 60,
        } as const;
    }

    @Post('logout')
    @UseGuards(AuthGuardAccess)
    async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const sessionId = (req as Request & { cookies?: Record<string, string> }).cookies?.sessionId;
        if (sessionId) await this.tokenService.revokeSession(sessionId);
        res.clearCookie('refreshToken', { path: '/' });
        res.clearCookie('sessionId', { path: '/' });
        return { success: true, message: 'Đăng xuất thành công' };
    }

    @Get('me')
    @UseGuards(AuthGuardAccess)
    me(@CurrentUser() user: unknown) {
        return user;
    }

    @Get('verify-session')
    @UseGuards(AuthGuardAccess)
    verifySession(@Req() req: Request) {
        const sessionId = (req as Request & { cookies?: Record<string, string> }).cookies?.sessionId;
        return { isValid: !!sessionId, sessionId, lastActivity: new Date().toISOString() } as const;
    }

    @Post('update-activity')
    @UseGuards(AuthGuardAccess)
    async updateActivity(@Req() req: Request) {
        const refreshToken = (req as Request & { cookies?: Record<string, string> }).cookies?.refreshToken;
        if (refreshToken) await this.tokenService.updateLastActivity(refreshToken);
        return { success: true } as const;
    }
}
