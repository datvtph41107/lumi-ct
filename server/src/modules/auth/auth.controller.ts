import { 
  Controller, 
  Post, 
  Body, 
  Res, 
  Req, 
  HttpStatus, 
  UseGuards,
  Get,
  Delete
} from '@nestjs/common';
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
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
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
  async logout(
    @CurrentUser() user: User,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
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
  async logoutAllSessions(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
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
      data: sessions.map(session => ({
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
  async revokeSession(
    @CurrentUser() user: User,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
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
}