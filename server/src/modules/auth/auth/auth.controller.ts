// import type { LoggerTypes } from '@/core/shared/logger/logger.types';
// import {
//     Body,
//     Controller,
//     Get,
//     HttpCode,
//     HttpStatus,
//     Inject,
//     Post,
//     Req,
//     Res,
//     UnauthorizedException,
//     UseGuards,
// } from '@nestjs/common';
// import { UserAuthService } from './auth.service';
// import { LoginRequest } from '@/core/dto/login/login.request';
// import { AuthGuardAccess } from '../guards/jwt-auth.guard';
// import { CurrentUser } from '@/core/shared/decorators/setmeta.decorator';
// import type { Request, Response } from 'express';
// import type { HeaderUserPayload } from '@/core/shared/interface/header-payload-req.interface';

// interface RequestWithCookies extends Request {
//     cookies: {
//         rfp?: string;
//         [key: string]: any;
//     };
// }

// @Controller('auth')
// export class AuthController {
//     constructor(
//         @Inject('LOGGER') private readonly logger: LoggerTypes,
//         private readonly userAuthService: UserAuthService,
//     ) {}

//     @Post('login')
//     @HttpCode(HttpStatus.OK)
//     async login(@Body() req: LoginRequest, @Res({ passthrough: true }) response: Response) {
//         this.logger.APP.info('Login Req -> data: ' + JSON.stringify({ ...req, password: '[HIDDEN]' }));
//         const result = await this.userAuthService.login(req);

//         // Set refresh token as HTTP-only cookie
//         this.setRefreshTokenCookie(response, result.refresh_token);

//         return {
//             accessToken: result.access_token,
//             tokenExpiry: result.token_expiry,
//             sessionId: result.session_id,
//             message: 'Login successful',
//         };
//     }

//     @Post('refresh')
//     @HttpCode(HttpStatus.OK)
//     async refreshToken(@Req() request: RequestWithCookies, @Res({ passthrough: true }) response: Response) {
//         const refreshToken = request.cookies?.rfp;

//         if (!refreshToken) {
//             throw new UnauthorizedException('Refresh token not found');
//         }

//         const result = await this.userAuthService.refreshAccessToken(refreshToken);

//         // Set new refresh token cookie if provided
//         if (result.refresh_token) {
//             this.setRefreshTokenCookie(response, result.refresh_token);
//         }

//         return {
//             accessToken: result.access_token,
//             tokenExpiry: result.token_expiry,
//             sessionId: result.session_id,
//             message: 'Token refreshed successfully',
//         };
//     }

//     @Post('logout')
//     @HttpCode(HttpStatus.OK)
//     async logout(@Req() request: RequestWithCookies, @Res({ passthrough: true }) response: Response) {
//         const refreshToken = request.cookies?.rfp;
//         if (refreshToken) {
//             await this.userAuthService.logout(refreshToken);
//         }
//         this.clearRefreshTokenCookie(response);
//         return {
//             success: true,
//             message: 'Logged out successfully',
//         };
//     }

//     @Get('me')
//     @UseGuards(AuthGuardAccess)
//     async getCurrentUser(@CurrentUser() user: HeaderUserPayload) {
//         const userData = await this.userAuthService.getCurrentUser(user.sub);
//         return {
//             userData,
//             message: 'User data retrieved successfully',
//         };
//     }

//     @Get('verify-session')
//     @HttpCode(HttpStatus.OK)
//     async verifySession(@Req() request: RequestWithCookies) {
//         const refreshToken = request.cookies?.rfp;

//         if (!refreshToken) {
//             return {
//                 isValid: false,
//                 message: 'No session found',
//             };
//         }

//         const sessionData = await this.userAuthService.verifyRefreshToken(refreshToken);
//         return {
//             isValid: !!sessionData.userId,
//             sessionId: sessionData.sessionId,
//             lastActivity: sessionData.lastActivity,
//             message: 'Session verified',
//         };
//     }

//     @Post('update-activity')
//     @HttpCode(HttpStatus.OK)
//     async updateActivity(@Req() request: RequestWithCookies) {
//         const refreshToken = request.cookies?.rfp;

//         if (!refreshToken) {
//             throw new UnauthorizedException('No session found');
//         }

//         await this.userAuthService.updateLastActivity(refreshToken);
//         return {
//             success: true,
//             message: 'Activity updated',
//         };
//     }

//     @Post('change-password')
//     @UseGuards(AuthGuardAccess)
//     async changePassword(
//         @CurrentUser() user: HeaderUserPayload,
//         @Body() body: { currentPassword: string; newPassword: string },
//         @Res({ passthrough: true }) response: Response,
//     ) {
//         await this.userAuthService.changePassword(user.sub, body.currentPassword, body.newPassword);
//         this.clearRefreshTokenCookie(response);

//         return {
//             success: true,
//             message: 'Password changed successfully. Please login again.',
//         };
//     }

//     private setRefreshTokenCookie(response: Response, refreshToken: string) {
//         const isProduction = process.env.NODE_ENV === 'production';
//         const domain = process.env.COOKIE_DOMAIN;

//         response.cookie('rfp', refreshToken, {
//             httpOnly: true,
//             secure: isProduction,
//             sameSite: isProduction ? 'strict' : 'lax',
//             maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//             path: '/',
//             ...(domain && { domain }),
//         });
//     }

//     private clearRefreshTokenCookie(response: Response) {
//         const domain = process.env.COOKIE_DOMAIN;

//         response.clearCookie('rfp', {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === 'production',
//             sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
//             path: '/',
//             ...(domain && { domain }),
//         });
//     }
// }

import { Controller, Post, Body, Res, Req, HttpStatus, UseGuards, Get, Delete } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../../core/domain/user/user.entity';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response, @Req() req: Request) {
        const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';

        const result = await this.authService.login(loginDto, ipAddress, userAgent);

        // Set refresh token as httpOnly cookie
        res.cookie('refreshToken', result.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: result.refresh_expires_in * 1000, // Convert to milliseconds
            path: '/',
        });

        // Set session ID as httpOnly cookie
        res.cookie('sessionId', result.session_id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: result.refresh_expires_in * 1000,
            path: '/',
        });

        return {
            success: true,
            message: 'Đăng nhập thành công',
            data: {
                user: result.user,
                access_token: result.access_token,
                expires_in: result.expires_in,
            },
        };
    }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        const result = await this.authService.register(registerDto);

        return {
            success: true,
            message: result.message,
            data: result.user,
        };
    }

    @Post('refresh')
    async refreshToken(
        @Body() refreshTokenDto: RefreshTokenDto,
        @Res({ passthrough: true }) res: Response,
        @Req() req: Request,
    ) {
        const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
        const result = await this.authService.refreshToken(refreshTokenDto, ipAddress);

        // Update refresh token cookie
        res.cookie('refreshToken', result.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: result.refresh_expires_in * 1000,
            path: '/',
        });

        return {
            success: true,
            message: 'Token đã được làm mới',
            data: {
                user: result.user,
                access_token: result.access_token,
                expires_in: result.expires_in,
            },
        };
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    async logout(@CurrentUser() user: User, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const sessionId = req.cookies?.sessionId;

        if (sessionId) {
            await this.authService.logout(sessionId, 'user_logout');
        }

        // Clear cookies
        res.clearCookie('refreshToken', { path: '/' });
        res.clearCookie('sessionId', { path: '/' });

        return {
            success: true,
            message: 'Đăng xuất thành công',
        };
    }

    @Post('logout-all')
    @UseGuards(JwtAuthGuard)
    async logoutAllSessions(@CurrentUser() user: User, @Res({ passthrough: true }) res: Response) {
        await this.authService.logoutAllSessions(user.id, 'user_logout_all');

        // Clear cookies
        res.clearCookie('refreshToken', { path: '/' });
        res.clearCookie('sessionId', { path: '/' });

        return {
            success: true,
            message: 'Đã đăng xuất khỏi tất cả thiết bị',
        };
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getCurrentUser(@CurrentUser() user: User) {
        return {
            success: true,
            data: {
                id: user.id,
                email: user.email,
                username: user.username,
                full_name: user.full_name,
                role: user.role,
                avatar: user.avatar,
                last_login_at: user.last_login_at,
            },
        };
    }

    @Get('sessions')
    @UseGuards(JwtAuthGuard)
    async getActiveSessions(@CurrentUser() user: User) {
        const sessions = await this.authService.getActiveSessions(user.id);

        return {
            success: true,
            data: sessions.map((session) => ({
                id: session.id,
                session_id: session.session_id,
                ip_address: session.ip_address,
                device_info: session.device_info,
                last_activity: session.last_activity,
                created_at: session.created_at,
                expires_at: session.expires_at,
            })),
        };
    }

    @Delete('sessions/:sessionId')
    @UseGuards(JwtAuthGuard)
    async revokeSession(@CurrentUser() user: User, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const { sessionId } = req.params;
        const currentSessionId = req.cookies?.sessionId;

        // If revoking current session, clear cookies
        if (sessionId === currentSessionId) {
            res.clearCookie('refreshToken', { path: '/' });
            res.clearCookie('sessionId', { path: '/' });
        }

        await this.authService.logout(sessionId, 'session_revoked');

        return {
            success: true,
            message: 'Phiên đăng nhập đã bị thu hồi',
        };
    }

    @Post('activity')
    @UseGuards(JwtAuthGuard)
    async updateActivity(@Req() req: Request) {
        const sessionId = req.cookies?.sessionId;

        if (sessionId) {
            await this.authService.updateActivity(sessionId);
        }

        return {
            success: true,
            message: 'Hoạt động đã được cập nhật',
        };
    }

    @Post('refresh-token')
    async refreshTokenFromCookie(@Res({ passthrough: true }) res: Response, @Req() req: Request) {
        const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
        const refreshToken = (req as any).cookies?.refreshToken;
        if (!refreshToken) {
            return {
                success: false,
                message: 'No refresh token cookie found',
            } as any;
        }
        const result = await this.authService.refreshToken({ refresh_token: refreshToken } as any, ipAddress);

        // Update refresh token cookie
        res.cookie('refreshToken', result.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/',
        });

        return {
            success: true,
            message: 'Token refreshed successfully',
            data: {
                accessToken: result.access_token,
                tokenExpiry: result.expires_in,
                sessionId: (req as any).cookies?.sessionId,
            },
        } as any;
    }

    @Get('verify-session')
    async verifySession(@Req() req: Request) {
        const sessionId = (req as any).cookies?.sessionId;
        return {
            success: true,
            data: {
                isValid: !!sessionId,
                sessionId,
                lastActivity: new Date().toISOString(),
            },
            message: 'Session verified',
        } as any;
    }

    @Post('update-activity')
    async updateActivityCompat(@Req() req: Request) {
        return this.updateActivity(req);
    }

    @Post('change-password')
    @UseGuards(JwtAuthGuard)
    async changePassword(
        @CurrentUser() user: User,
        @Body() body: { currentPassword: string; newPassword: string },
        @Res({ passthrough: true }) response: Response,
    ) {
        await this.authService.changePassword(user.id, body.currentPassword, body.newPassword);
        response.clearCookie('refreshToken', { path: '/' });
        response.clearCookie('sessionId', { path: '/' });

        return {
            success: true,
            message: 'Password changed successfully. Please login again.',
        };
    }
}
