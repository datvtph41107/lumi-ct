import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/core/domain/user/user.entity';
import { UserSession } from '@/core/domain/user/user-session.entity';
import { UiCapabilities } from '@/core/shared/types/auth.types';
import { Role as SystemRole } from '@/core/shared/enums/base.enums';

@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(UserSession)
        private readonly sessionRepository: Repository<UserSession>,
    ) {}

    // Dynamic permission engine removed. Keep minimal helpers if needed later.

    async getUserRoles(userId: number): Promise<any[]> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        const roleName = user?.role === SystemRole.MANAGER ? 'MANAGER' : 'STAFF';
        return [
            {
                user_id: userId,
                role_id: roleName.toLowerCase(),
                scope: 'global',
                is_active: true,
                granted_at: new Date(),
            },
        ];
    }

    async updateUserRoles(
        userId: number,
        roles: Array<{ roleId: string; scope?: string; scopeId?: number }>,
    ): Promise<void> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');
        const wantsManager = Array.isArray(roles)
            ? roles.some((r) => (r.roleId || '').toLowerCase() === 'manager')
            : false;
        user.role = wantsManager ? (SystemRole.MANAGER as any) : (SystemRole.STAFF as any);
        await this.userRepository.save(user);
        this.clearUserCache(userId);
    }

    async validateSession(sessionId: string): Promise<User> {
        const session = await this.sessionRepository.findOne({ where: { session_id: sessionId, is_active: true } });
        if (!session) throw new UnauthorizedException('Session không hợp lệ');
        if (session.expires_at < new Date()) {
            await this.invalidateSession(session.id, 'expired');
            throw new UnauthorizedException('Session đã hết hạn');
        }
        const user = await this.userRepository.findOne({ where: { id: session.user_id } });
        if (!user || !user.is_active) {
            await this.invalidateSession(session.id, 'user_inactive');
            throw new UnauthorizedException('Tài khoản đã bị vô hiệu hóa');
        }
        session.last_activity = new Date();
        await this.sessionRepository.save(session);
        return user;
    }

    async updateActivity(sessionId: string): Promise<void> {
        await this.sessionRepository.update({ session_id: sessionId }, { last_activity: new Date() });
    }

    // Minimal helpers retained for compatibility (could be removed if unused):
    async canCreateContract(): Promise<boolean> { return true; }
    async canReadContract(): Promise<boolean> { return true; }
    async canUpdateContract(): Promise<boolean> { return true; }
    async canDeleteContract(): Promise<boolean> { return true; }
    async canApproveContract(): Promise<boolean> { return true; }
    async canRejectContract(): Promise<boolean> { return true; }
    async canExportContract(): Promise<boolean> { return true; }
    async canManageTemplates(): Promise<boolean> { return true; }
    async canViewDashboard(): Promise<boolean> { return true; }
    async canViewAnalytics(): Promise<boolean> { return true; }

    // Removed dynamic condition evaluation.

    private async invalidateSession(sessionId: string, reason: string): Promise<void> {
        await this.sessionRepository.update(
            { session_id: sessionId },
            { is_active: false, logout_at: new Date(), logout_reason: reason },
        );
    }

    private clearUserCache(_userId: number): void {}

    clearAllCaches(): void {}
}
