import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { AuthCoreService } from './auth/auth-core.service';
import { JwtStrategy } from './jwt/jwt.strategy';
import { PermissionGuard } from './guards/permission.guard';
import { LoggerModule } from '@/core/shared/logger/logger.module';
import { DatabaseModule } from '@/providers/database';

@Module({
    imports: [
        LoggerModule,
        DatabaseModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: {
                    expiresIn: configService.get<string>('JWT_EXPIRES_IN', '15m'),
                },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, AuthCoreService, JwtStrategy, PermissionGuard],
    exports: [AuthService, AuthCoreService, JwtStrategy, PermissionGuard],
})
export class AuthModule {}
