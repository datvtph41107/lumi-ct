import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '@/core/domain/user/user.entity';
import { TokenService } from '../jwt/jwt.service';
import { LoginDto } from '@/core/dto/auth/login.dto';
import { UserContext } from '@/core/shared/interface/jwt-payload.interface';
import { UserPermission } from '@/core/domain/permission/user-permission.entity';

@Injectable()
export class AuthService {
    constructor(
        @Inject('DATA_SOURCE') private readonly db: DataSource,
        private readonly tokenService: TokenService,
    ) {}

    async validateUser(username: string, password: string): Promise<User | null> {
        const repo = this.db.getRepository(User);
        const user = await repo.findOne({ where: { username } });
        if (!user) return null;
        const ok = await bcrypt.compare(password, user.password);
        return ok ? user : null;
    }

    async login(body: LoginDto) {
        const user = await this.validateUser(body.username, body.password);
        if (!user) throw new UnauthorizedException('Sai tài khoản hoặc mật khẩu');

        // Only two roles: MANAGER and STAFF already stored in user.role. "is_manager_login" just helps client UI.
        const permissionRepo = this.db.getRepository(UserPermission);
        const p = await permissionRepo.findOne({ where: { user_id: user.id } });
        const permissions: UserContext['permissions'] = {
            create_contract: !!p?.create_contract,
            create_report: !!p?.create_report,
            read: !!p?.read,
            update: !!p?.update,
            delete: !!p?.delete,
            approve: !!p?.approve,
            assign: !!p?.assign,
        };
        const context: UserContext = { permissions, department: null };

        const sessionId = `${Date.now()}-${user.id}`;
        const tokens = await this.tokenService.getUserTokens(user as any, context, sessionId);
        return { tokens, sessionId, user };
    }
}
