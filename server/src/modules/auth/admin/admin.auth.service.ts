import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { LoginRequest } from '@/core/dto/login/login.request';
import { Admin } from '@/core/domain/admin/admin.entity';
import { LoggerTypes } from '@/core/shared/logger/logger.types';
import { TokenService } from '../jwt/jwt.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminAuthService {
    constructor(
        @Inject('LOGGER') private readonly logger: LoggerTypes,
        @Inject('DATA_SOURCE') private readonly db: DataSource,
        private readonly jwtService: TokenService,
    ) {}

    async login(req: LoginRequest) {
        try {
            const repo = this.db.getRepository(Admin);
            const admin = await repo.findOneBy({ name: req.username });

            if (!admin) {
                this.logger.APP.info('Admin not found with username: ' + req.username);
                throw new BadRequestException('Admin not found');
            }

            const isMatch = await bcrypt.compare(req.password, admin.password);
            if (!isMatch) throw new BadRequestException('Password is not correct');

            return this.jwtService.getAdminTokens(admin);
        } catch (error) {
            this.logger.APP.error('Login error:' + error);
            throw error;
        }
    }

    // async refreshToken(header: string) {
    //     const refreshToken = header?.split(' ')[1];
    //     if (!refreshToken) throw new UnauthorizedException('Missing refresh token');

    //     const userId = this.jwtService.verifyRefreshToken(refreshToken);
    //     const admin = await this.db.getRepository(Admin).findOneBy({ id: userId });
    //     if (!admin) throw new UnauthorizedException('Admin not found');

    //     return this.jwtService.getAdminTokens(admin);
    // }
}
