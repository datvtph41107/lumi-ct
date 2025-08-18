import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { TokenService } from '../jwt/jwt.service';
import { AuthGuardAccess } from '../guards/jwt-auth.guard';
import { CurrentUser } from '@/core/shared/decorators/setmeta.decorator';
import { User } from '@/core/domain/user/user.entity';
import { AuthService } from './auth.service';
import { LoginDto } from '@/core/dto/auth/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly tokenService: TokenService, private readonly authService: AuthService) {}

    @Post('login')
    async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
        const { tokens, sessionId, user } = await this.authService.login(body);
        res.cookie('refreshToken', tokens.refresh_token, { httpOnly: true, sameSite: 'strict', path: '/' });
        res.cookie('sessionId', sessionId, { httpOnly: true, sameSite: 'strict', path: '/' });
        return {
            success: true,
            data: {
                access_token: tokens.access_token,
                role: user.role,
                is_manager_login: body.is_manager_login === true,
            },
        } as any;
    }

    @Post('refresh-token')
    async refreshFromCookie(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const refreshToken = (req as any).cookies?.refreshToken;
        if (!refreshToken) return { success: false, message: 'No refresh token cookie found' } as any;
        const payload = await this.tokenService.verifyRefreshToken(refreshToken);
        const fakeUser = { id: payload.userId, username: 'user', role: 'MANAGER' } as any;
        const context = {
            permissions: {
                create_contract: true,
                create_report: true,
                read: true,
                update: true,
                delete: false,
                approve: true,
                assign: true,
            },
            department: null,
        } as any;
        const tokens = await this.tokenService.getUserTokens(fakeUser, context, payload.sessionId);
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
