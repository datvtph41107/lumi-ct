import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/core/domain/user/user.entity';
import { UserSession } from '@/core/domain/user/user-session.entity';
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

    // validateSession currently unused; keep minimal helpers if needed later

    async updateActivity(sessionId: string): Promise<void> {
        await this.sessionRepository.update({ session_id: sessionId }, { last_activity: new Date() });
    }

    private async invalidateSession(sessionId: string, reason: string): Promise<void> {
        await this.sessionRepository.update(
            { session_id: sessionId },
            { is_active: false, logout_at: new Date(), logout_reason: reason },
        );
    }

    private clearUserCache(_userId: number): void {
        // Cache clearing logic can be implemented here when needed
    }
}
