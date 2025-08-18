import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { TokenService } from '../jwt/jwt.service';
import { AuthGuardAccess } from '../guards/jwt-auth.guard';
import { CurrentUser } from '@/core/shared/decorators/setmeta.decorator';
import { User } from '@/core/domain/user/user.entity';

@Controller('auth')
export class AuthController {
    constructor(private readonly tokenService: TokenService) {}

    @Post('login')
    async login(@Body() body: { username: string; password: string }, @Res({ passthrough: true }) res: Response) {
        // TODO: validate user from DB; here only stub to issue tokens
        const fakeUser = { id: 1, username: body.username, role: 'MANAGER' } as any as User;
        const context = { permissions: { create_contract: true, create_report: true, read: true, update: true, delete: false, approve: true, assign: true }, department: null } as any;
        const sessionId = `${Date.now()}`;
        const tokens = await this.tokenService.getUserTokens(fakeUser, context, sessionId);
        res.cookie('refreshToken', tokens.refresh_token, { httpOnly: true, sameSite: 'strict', path: '/' });
        res.cookie('sessionId', sessionId, { httpOnly: true, sameSite: 'strict', path: '/' });
        return { success: true, data: { access_token: tokens.access_token } };
    }

    @Post('refresh-token')
    async refreshFromCookie(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const refreshToken = (req as any).cookies?.refreshToken;
        if (!refreshToken) return { success: false, message: 'No refresh token cookie found' } as any;
        const payload = await this.tokenService.verifyRefreshToken(refreshToken);
        const fakeUser = { id: payload.userId, username: 'user', role: 'MANAGER' } as any;
        const context = { permissions: { create_contract: true, create_report: true, read: true, update: true, delete: false, approve: true, assign: true }, department: null } as any;
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
