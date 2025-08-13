import type { LoggerTypes } from '@/core/shared/logger/logger.types';
import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Inject,
    Post,
    Req,
    Res,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { UserAuthService } from './auth.service';
import { LoginRequest } from '@/core/dto/login/login.request';
import { AuthGuardAccess } from '../guards/jwt-auth.guard';
import { CurrentUser } from '@/core/shared/decorators/setmeta.decorator';
import type { Request, Response } from 'express';
import type { HeaderUserPayload } from '@/core/shared/interface/header-payload-req.interface';

interface RequestWithCookies extends Request {
    cookies: {
        rfp?: string;
        [key: string]: any;
    };
}

@Controller('auth')
export class AuthController {
    constructor(
        @Inject('LOGGER') private readonly logger: LoggerTypes,
        private readonly userAuthService: UserAuthService,
    ) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() req: LoginRequest, @Res({ passthrough: true }) response: Response) {
        this.logger.APP.info('Login Req -> data: ' + JSON.stringify({ ...req, password: '[HIDDEN]' }));
        const result = await this.userAuthService.login(req);

        // Set refresh token as HTTP-only cookie
        this.setRefreshTokenCookie(response, result.refresh_token);

        return {
            accessToken: result.access_token,
            tokenExpiry: result.token_expiry,
            sessionId: result.session_id,
            message: 'Login successful',
        };
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refreshToken(@Req() request: RequestWithCookies, @Res({ passthrough: true }) response: Response) {
        const refreshToken = request.cookies?.rfp;

        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token not found');
        }

        const result = await this.userAuthService.refreshAccessToken(refreshToken);

        // Set new refresh token cookie if provided
        if (result.refresh_token) {
            this.setRefreshTokenCookie(response, result.refresh_token);
        }

        return {
            accessToken: result.access_token,
            tokenExpiry: result.token_expiry,
            sessionId: result.session_id,
            message: 'Token refreshed successfully',
        };
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Req() request: RequestWithCookies, @Res({ passthrough: true }) response: Response) {
        const refreshToken = request.cookies?.rfp;
        if (refreshToken) {
            await this.userAuthService.logout(refreshToken);
        }
        this.clearRefreshTokenCookie(response);
        return {
            success: true,
            message: 'Logged out successfully',
        };
    }

    @Get('me')
    @UseGuards(AuthGuardAccess)
    async getCurrentUser(@CurrentUser() user: HeaderUserPayload) {
        const userData = await this.userAuthService.getCurrentUser(user.sub);
        return {
            userData,
            message: 'User data retrieved successfully',
        };
    }

    @Get('verify-session')
    @HttpCode(HttpStatus.OK)
    async verifySession(@Req() request: RequestWithCookies) {
        const refreshToken = request.cookies?.rfp;

        if (!refreshToken) {
            return {
                isValid: false,
                message: 'No session found',
            };
        }

        const sessionData = await this.userAuthService.verifyRefreshToken(refreshToken);
        return {
            isValid: !!sessionData.userId,
            sessionId: sessionData.sessionId,
            lastActivity: sessionData.lastActivity,
            message: 'Session verified',
        };
    }

    @Post('update-activity')
    @HttpCode(HttpStatus.OK)
    async updateActivity(@Req() request: RequestWithCookies) {
        const refreshToken = request.cookies?.rfp;

        if (!refreshToken) {
            throw new UnauthorizedException('No session found');
        }

        await this.userAuthService.updateLastActivity(refreshToken);
        return {
            success: true,
            message: 'Activity updated',
        };
    }

    @Post('change-password')
    @UseGuards(AuthGuardAccess)
    async changePassword(
        @CurrentUser() user: HeaderUserPayload,
        @Body() body: { currentPassword: string; newPassword: string },
        @Res({ passthrough: true }) response: Response,
    ) {
        await this.userAuthService.changePassword(user.sub, body.currentPassword, body.newPassword);
        this.clearRefreshTokenCookie(response);

        return {
            success: true,
            message: 'Password changed successfully. Please login again.',
        };
    }

    private setRefreshTokenCookie(response: Response, refreshToken: string) {
        const isProduction = process.env.NODE_ENV === 'production';
        const domain = process.env.COOKIE_DOMAIN;

        response.cookie('rfp', refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/',
            ...(domain && { domain }),
        });
    }

    private clearRefreshTokenCookie(response: Response) {
        const domain = process.env.COOKIE_DOMAIN;

        response.clearCookie('rfp', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            path: '/',
            ...(domain && { domain }),
        });
    }
}
