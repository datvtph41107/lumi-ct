import { Injectable, UnauthorizedException, BadRequestException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '../../core/domain/user/user.entity';
import { UserSession } from '../../core/domain/user/user-session.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LoggerTypes } from '@/core/shared/logger/logger.types';

@Injectable()
export class AuthService {
    constructor(
        @Inject('LOGGER') private readonly logger: LoggerTypes,
        @Inject('DATA_SOURCE') private readonly db: DataSource,
        private readonly jwtService: JwtService,
    ) {}

    async validateUser(username: string, password: string): Promise<User> {
        const userRepo = this.db.getRepository(User);
        const user = await userRepo.findOne({ where: { username } });
        if (user && (await bcrypt.compare(password, user.password))) {
            return user;
        }
        return null;
    }

    async login(loginDto: LoginDto, ipAddress: string, userAgent: string): Promise<any> {
        const { username, password, rememberMe = false } = loginDto;

        // Validate user
        const user = await this.validateUser(username, password);
        if (!user) {
            throw new UnauthorizedException('Username hoặc mật khẩu không đúng');
        }

        if (!user.is_active) {
            throw new UnauthorizedException('Tài khoản đã bị vô hiệu hóa');
        }

        const userRepo = this.db.getRepository(User);
        const sessionRepo = this.db.getRepository(UserSession);

        // Generate session
        const sessionId = uuidv4();
        const refreshToken = this.generateRefreshToken();
        const accessToken = this.generateAccessToken(user, sessionId);

        // Calculate expiration
        const refreshExpiresIn = rememberMe ? '30d' : '7d';
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + (rememberMe ? 30 : 7));

        // Create session
        const session = sessionRepo.create({
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

        await sessionRepo.save(session);

        // Update user last login
        await userRepo.update(user.id, {
            remember_token: refreshToken,
        });

        return {
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role,
                department_id: user.department_id,
            },
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: 15 * 60, // 15 minutes
            refresh_expires_in: rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60,
            session_id: sessionId,
        };
    }

    async register(registerDto: RegisterDto): Promise<any> {
        const { username, password, name } = registerDto;

        const userRepo = this.db.getRepository(User);

        // Check if user exists
        const existingUser = await userRepo.findOne({
            where: { username },
        });

        if (existingUser) {
            throw new BadRequestException('Username đã tồn tại');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = userRepo.create({
            username,
            password: hashedPassword,
            name,
            role: 'staff',
            is_active: true,
        });

        const savedUser = await userRepo.save(user);

        return {
            message: 'Đăng ký thành công',
            user: {
                id: savedUser.id,
                username: savedUser.username,
                name: savedUser.name,
                role: savedUser.role,
            },
        };
    }

    async refreshToken(refreshTokenDto: RefreshTokenDto, ipAddress: string): Promise<any> {
        const { refresh_token, session_id } = refreshTokenDto;

        const sessionRepo = this.db.getRepository(UserSession);
        const userRepo = this.db.getRepository(User);

        // Find session
        const session = await sessionRepo.findOne({
            where: { session_id, refresh_token },
        });

        if (!session || !session.is_active || session.expires_at < new Date()) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        // Get user
        const user = await userRepo.findOne({
            where: { id: session.user_id },
        });

        if (!user || !user.is_active) {
            throw new UnauthorizedException('User not found or inactive');
        }

        // Generate new tokens
        const newAccessToken = this.generateAccessToken(user, session_id);
        const newRefreshToken = this.generateRefreshToken();

        // Update session
        session.refresh_token = newRefreshToken;
        session.access_token_hash = this.hashToken(newAccessToken);
        session.last_activity = new Date();
        await sessionRepo.save(session);

        return {
            access_token: newAccessToken,
            refresh_token: newRefreshToken,
            expires_in: 15 * 60,
        };
    }

    async logout(sessionId: string, userId: number): Promise<any> {
        const sessionRepo = this.db.getRepository(UserSession);

        const session = await sessionRepo.findOne({
            where: { session_id: sessionId, user_id: userId },
        });

        if (session) {
            session.is_active = false;
            session.logout_at = new Date();
            session.logout_reason = 'user_logout';
            await sessionRepo.save(session);
        }

        return { message: 'Đăng xuất thành công' };
    }

    async logoutAllSessions(userId: number, reason: string = 'user_logout_all'): Promise<void> {
        const sessionRepo = this.db.getRepository(UserSession);
        await sessionRepo.update(
            { user_id: userId, is_active: true },
            {
                is_active: false,
                logout_at: new Date(),
                logout_reason: reason,
            },
        );
    }

    async validateSession(sessionId: string, accessToken: string): Promise<User> {
        const sessionRepo = this.db.getRepository(UserSession);
        const userRepo = this.db.getRepository(User);

        const session = await sessionRepo.findOne({
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
        await sessionRepo.save(session);

        return session.user;
    }

    async updateActivity(sessionId: string): Promise<void> {
        const sessionRepo = this.db.getRepository(UserSession);
        await sessionRepo.update({ session_id: sessionId }, { last_activity: new Date() });
    }

    async changePassword(userId: number, currentPassword: string, newPassword: string) {
        const userRepo = this.db.getRepository(User);
        const user = await userRepo.findOne({ where: { id: userId } });
        if (!user) throw new UnauthorizedException('User not found');
        const ok = await bcrypt.compare(currentPassword, user.password);
        if (!ok) throw new UnauthorizedException('Current password incorrect');
        user.password = await bcrypt.hash(newPassword, 12);
        await userRepo.save(user);
        await this.logoutAllSessions(userId, 'password_changed');
        return { message: 'Password updated' };
    }

    async getActiveSessions(userId: number): Promise<UserSession[]> {
        const sessionRepo = this.db.getRepository(UserSession);
        return sessionRepo.find({
            where: { user_id: userId, is_active: true },
            order: { last_activity: 'DESC' },
        });
    }

    async cleanupExpiredSessions(): Promise<void> {
        const sessionRepo = this.db.getRepository(UserSession);
        await sessionRepo.update(
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
            username: user.username,
            role: user.role,
            session_id: sessionId,
        };

        return this.jwtService.sign(payload, {
            expiresIn: '15m',
        });
    }

    private generateRefreshToken(): string {
        return crypto.randomBytes(64).toString('hex');
    }

    private hashToken(token: string): string {
        return crypto.createHash('sha256').update(token).digest('hex');
    }

    private extractDeviceInfo(userAgent: string): any {
        // Simple device info extraction
        return {
            user_agent: userAgent,
            browser: this.getBrowserInfo(userAgent),
            os: this.getOSInfo(userAgent),
        };
    }

    private getBrowserInfo(userAgent: string): string {
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Edge';
        return 'Unknown';
    }

    private getOSInfo(userAgent: string): string {
        if (userAgent.includes('Windows')) return 'Windows';
        if (userAgent.includes('Mac')) return 'macOS';
        if (userAgent.includes('Linux')) return 'Linux';
        if (userAgent.includes('Android')) return 'Android';
        if (userAgent.includes('iOS')) return 'iOS';
        return 'Unknown';
    }

    private async invalidateSession(sessionId: string, reason: string): Promise<void> {
        const sessionRepo = this.db.getRepository(UserSession);
        await sessionRepo.update(
            { session_id: sessionId },
            {
                is_active: false,
                logout_at: new Date(),
                logout_reason: reason,
            },
        );
    }
}
