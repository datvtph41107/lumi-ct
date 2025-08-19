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
import { AuthService } from './auth.service';
import type { HeaderUserPayload } from '@/core/shared/interface/header-payload-req.interface';
import { 
    LoginResponse, 
    RefreshTokenResponse, 
    SessionVerificationResponse, 
    UserCapabilitiesResponse,
    ApiSuccessResponse
} from '@/core/shared/types/api-response.types';
import { UserContext } from '@/core/shared/types/auth.types';
import { isManager } from '@/core/shared/utils/role.utils';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly tokenService: TokenService,
        private readonly authService: AuthService,
        @Inject('DATA_SOURCE') private readonly db: DataSource,
    ) {}

    @Post('login')
    async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response): Promise<LoginResponse> {
        const userRepo = this.db.getRepository(User);
        const user = await userRepo.findOne({ where: { username: body.username } });
        if (!user || !user.is_active) throw new UnauthorizedException('Thông tin đăng nhập không hợp lệ');
        const matched = await bcrypt.compare(body.password, user.password);
        if (!matched) throw new UnauthorizedException('Thông tin đăng nhập không hợp lệ');

        if (body.is_manager_login === true && user.role !== Role.MANAGER) {
            throw new UnauthorizedException('Tài khoản không có quyền quản lý');
        }

        const context: UserContext = await buildUserContext(user, this.db);
        const sessionId = `${Date.now()}`;
        const tokens = await this.tokenService.getUserTokens(user, context, sessionId);
        res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, sameSite: 'strict', path: '/' });
        res.cookie('sessionId', sessionId, { httpOnly: true, sameSite: 'strict', path: '/' });
        
        const responseUser = {
            id: user.id,
            username: user.username,
            role: user.role,
            isManager: isManager({ role: user.role }),
            department: context.department
                ? {
                      id: context.department.id,
                      name: context.department.name,
                      code: context.department.code,
                  }
                : null,
            permissions: context.capabilities,
        };
        
        return {
            accessToken: tokens.accessToken,
            tokenExpiry: Math.floor(Date.now() / 1000) + 15 * 60,
            user: responseUser,
        };
    }

    @Post('refresh-token')
    async refreshFromCookie(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<RefreshTokenResponse | { success: false; message: string }> {
        const refreshToken = (req as any).cookies?.refreshToken as string | undefined;
        if (!refreshToken) return { success: false, message: 'No refresh token cookie found' };
        
        const payload = await this.tokenService.verifyRefreshToken(refreshToken);
        const userRepo = this.db.getRepository(User);
        const user = await userRepo.findOne({ where: { id: payload.userId } });
        if (!user) throw new UnauthorizedException('Không tìm thấy người dùng');
        
        const context: UserContext = await buildUserContext(user, this.db);
        const tokens = await this.tokenService.getUserTokens(user, context, payload.sessionId);
        res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, sameSite: 'strict', path: '/' });
        
        return {
            accessToken: tokens.accessToken,
            sessionId: payload.sessionId,
            tokenExpiry: Math.floor(Date.now() / 1000) + 15 * 60,
        };
    }

    @Post('logout')
    @UseGuards(AuthGuardAccess)
    async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<ApiSuccessResponse> {
        const sessionId = (req as any).cookies?.sessionId as string | undefined;
        if (sessionId) await this.tokenService.revokeSession(sessionId);
        res.clearCookie('refreshToken', { path: '/' });
        res.clearCookie('sessionId', { path: '/' });
        return { success: true, message: 'Đăng xuất thành công' };
    }

    @Get('me')
    @UseGuards(AuthGuardAccess)
    async me(@CurrentUser() user: HeaderUserPayload): Promise<HeaderUserPayload> {
        return user;
    }

    @Get('verify-session')
    @UseGuards(AuthGuardAccess)
    async verifySession(@Req() req: Request): Promise<SessionVerificationResponse> {
        const sessionId = (req as any).cookies?.sessionId as string | undefined;
        return { 
            isValid: !!sessionId, 
            sessionId, 
            lastActivity: new Date().toISOString() 
        };
    }

    @Post('update-activity')
    @UseGuards(AuthGuardAccess)
    async updateActivity(@Req() req: Request): Promise<ApiSuccessResponse> {
        const refreshToken = (req as any).cookies?.refreshToken as string | undefined;
        if (refreshToken) await this.tokenService.updateLastActivity(refreshToken);
        return { success: true };
    }

    @Get('permissions')
    @UseGuards(AuthGuardAccess)
    async getPermissions(@CurrentUser() user: HeaderUserPayload): Promise<UserCapabilitiesResponse> {
        const userIsManager = isManager({ roles: user.roles });
        return { capabilities: { is_manager: userIsManager } };
    }
}
