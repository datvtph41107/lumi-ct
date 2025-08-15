import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '../../core/domain/user/user.entity';
import { UserSession } from '../../core/domain/auth/user-session.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(UserSession)
        private readonly sessionRepository: Repository<UserSession>,
        private readonly jwtService: JwtService,
    ) {}

    async validateUser(email: string, password: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { email } });
        if (user && (await bcrypt.compare(password, user.password))) {
            return user;
        }
        return null;
    }

    async login(loginDto: LoginDto, ipAddress: string, userAgent: string): Promise<any> {
        const { email, password, rememberMe = false } = loginDto;

        // Validate user
        const user = await this.validateUser(email, password);
        if (!user) {
            throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
        }

        if (!user.is_active) {
            throw new UnauthorizedException('Tài khoản đã bị vô hiệu hóa');
        }

        // Generate session
        const sessionId = uuidv4();
        const refreshToken = this.generateRefreshToken();
        const accessToken = this.generateAccessToken(user, sessionId);

        // Calculate expiration
        const refreshExpiresIn = rememberMe ? '30d' : '7d';
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + (rememberMe ? 30 : 7));

        // Create session
        const session = this.sessionRepository.create({
            user_id: user.id,
            session_id: sessionId,
            refresh_token: refreshToken,
            access_token_hash: this.hashToken(accessToken),
            ip_address: ipAddress,
            user_agent: userAgent,
            device_info: this.extractDeviceInfo(userAgent),
            expires_at: expiresAt,
            last_activity: new Date(),
        });

        await this.sessionRepository.save(session);

        // Update user last login
        await this.userRepository.update(user.id, {
            last_login_at: new Date(),
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                full_name: user.full_name,
                role: user.role,
                avatar: user.avatar,
            },
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: 15 * 60, // 15 minutes
            refresh_expires_in: rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60,
            session_id: sessionId,
        };
    }

    async register(registerDto: RegisterDto): Promise<any> {
        const { email, username, password, full_name } = registerDto;

        // Check if user exists
        const existingUser = await this.userRepository.findOne({
            where: [{ email }, { username }],
        });

        if (existingUser) {
            throw new BadRequestException('Email hoặc tên đăng nhập đã tồn tại');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = this.userRepository.create({
            email,
            username,
            password: hashedPassword,
            full_name,
            role: 'user',
            is_active: true,
        });

        const savedUser = await this.userRepository.save(user);

        return {
            user: {
                id: savedUser.id,
                email: savedUser.email,
                username: savedUser.username,
                full_name: savedUser.full_name,
                role: savedUser.role,
            },
            message: 'Đăng ký thành công',
        };
    }

    async refreshToken(refreshTokenDto: RefreshTokenDto, ipAddress: string): Promise<any> {
        const { refresh_token } = refreshTokenDto;

        // Find session by refresh token
        const session = await this.sessionRepository.findOne({
            where: { refresh_token, is_active: true },
            relations: ['user'],
        });

        if (!session) {
            throw new UnauthorizedException('Refresh token không hợp lệ');
        }

        if (session.expires_at < new Date()) {
            await this.invalidateSession(session.id, 'expired');
            throw new UnauthorizedException('Refresh token đã hết hạn');
        }

        // Check if user is still active
        if (!session.user.is_active) {
            await this.invalidateSession(session.id, 'user_inactive');
            throw new UnauthorizedException('Tài khoản đã bị vô hiệu hóa');
        }

        // Generate new tokens
        const newAccessToken = this.generateAccessToken(session.user, session.session_id);
        const newRefreshToken = this.generateRefreshToken();

        // Update session
        session.refresh_token = newRefreshToken;
        session.access_token_hash = this.hashToken(newAccessToken);
        session.last_activity = new Date();
        session.ip_address = ipAddress;

        await this.sessionRepository.save(session);

        return {
            access_token: newAccessToken,
            refresh_token: newRefreshToken,
            expires_in: 15 * 60, // 15 minutes
            user: {
                id: session.user.id,
                email: session.user.email,
                username: session.user.username,
                full_name: session.user.full_name,
                role: session.user.role,
                avatar: session.user.avatar,
            },
        };
    }

    async logout(sessionId: string, reason: string = 'user_logout'): Promise<void> {
        await this.invalidateSession(sessionId, reason);
    }

    async logoutAllSessions(userId: number, reason: string = 'user_logout_all'): Promise<void> {
        await this.sessionRepository.update(
            { user_id: userId, is_active: true },
            {
                is_active: false,
                logout_at: new Date(),
                logout_reason: reason,
            },
        );
    }

    async validateSession(sessionId: string, accessToken: string): Promise<User> {
        const session = await this.sessionRepository.findOne({
            where: { session_id: sessionId, is_active: true },
            relations: ['user'],
        });

        if (!session) {
            throw new UnauthorizedException('Session không hợp lệ');
        }

        if (session.expires_at < new Date()) {
            await this.invalidateSession(session.id, 'expired');
            throw new UnauthorizedException('Session đã hết hạn');
        }

        if (!session.user.is_active) {
            await this.invalidateSession(session.id, 'user_inactive');
            throw new UnauthorizedException('Tài khoản đã bị vô hiệu hóa');
        }

        // Verify access token hash
        const tokenHash = this.hashToken(accessToken);
        if (session.access_token_hash !== tokenHash) {
            await this.invalidateSession(session.id, 'token_mismatch');
            throw new UnauthorizedException('Access token không hợp lệ');
        }

        // Update last activity
        session.last_activity = new Date();
        await this.sessionRepository.save(session);

        return session.user;
    }

    async updateActivity(sessionId: string): Promise<void> {
        await this.sessionRepository.update({ session_id: sessionId }, { last_activity: new Date() });
    }

    async changePassword(userId: number, currentPassword: string, newPassword: string) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) throw new UnauthorizedException('User not found');
        const ok = await bcrypt.compare(currentPassword, user.password);
        if (!ok) throw new UnauthorizedException('Current password incorrect');
        user.password = await bcrypt.hash(newPassword, 12);
        await this.userRepository.save(user);
        await this.logoutAllSessions(userId, 'password_changed');
        return { message: 'Password updated' };
    }

    async getActiveSessions(userId: number): Promise<UserSession[]> {
        return this.sessionRepository.find({
            where: { user_id: userId, is_active: true },
            order: { last_activity: 'DESC' },
        });
    }

    async cleanupExpiredSessions(): Promise<void> {
        await this.sessionRepository.update(
            {
                is_active: true,
                expires_at: new Date(),
            },
            {
                is_active: false,
                logout_at: new Date(),
                logout_reason: 'expired',
            },
        );
    }

    private generateAccessToken(user: User, sessionId: string): string {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            session_id: sessionId,
        };

        return this.jwtService.sign(payload);
    }

    private generateRefreshToken(): string {
        return crypto.randomBytes(64).toString('hex');
    }

    private hashToken(token: string): string {
        return crypto.createHash('sha256').update(token).digest('hex');
    }

    private extractDeviceInfo(userAgent: string): any {
        // Simple device info extraction
        const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
        const isTablet = /Tablet|iPad/.test(userAgent);
        const browser = this.extractBrowser(userAgent);
        const os = this.extractOS(userAgent);

        return {
            is_mobile: isMobile,
            is_tablet: isTablet,
            browser,
            os,
            user_agent: userAgent,
        };
    }

    private extractBrowser(userAgent: string): string {
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Edge';
        return 'Unknown';
    }

    private extractOS(userAgent: string): string {
        if (userAgent.includes('Windows')) return 'Windows';
        if (userAgent.includes('Mac')) return 'macOS';
        if (userAgent.includes('Linux')) return 'Linux';
        if (userAgent.includes('Android')) return 'Android';
        if (userAgent.includes('iOS')) return 'iOS';
        return 'Unknown';
    }

    private async invalidateSession(sessionId: string, reason: string): Promise<void> {
        await this.sessionRepository.update(
            { session_id: sessionId },
            {
                is_active: false,
                logout_at: new Date(),
                logout_reason: reason,
            },
        );
    }
}
