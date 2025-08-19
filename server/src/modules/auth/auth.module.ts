import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { AuthController } from './auth/auth.controller';
// Services
import { TokenService } from './jwt/jwt.service';

// Guards & Validators
import { AuthGuardAccess } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/role.guard';

// Strategy
import { JwtStrategy } from './jwt/jwt.strategy';

// External Modules
import { LoggerModule } from '@/core/shared/logger/logger.module';
import { DatabaseModule } from '@/providers/database';

// Entities
import { User } from '@/core/domain/user/user.entity';
import { UserSession } from '@/core/domain/user/user-session.entity';
import { RevokedToken } from '@/core/domain/token/revoke-token.entity';

// Core Services
import { AuthService as AuthCoreService } from './auth/auth.service';

@Module({
    imports: [
        LoggerModule,
        DatabaseModule,
        ConfigModule,
        PassportModule,
        TypeOrmModule.forFeature([User, UserSession, RevokedToken]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                privateKey: configService.getOrThrow<string>('ACCESS_TOKEN_PRIVATE_KEY').replace(/\\n/g, '\n'),
                publicKey: configService.getOrThrow<string>('ACCESS_TOKEN_PUBLIC_KEY').replace(/\\n/g, '\n'),
                signOptions: {
                    algorithm: 'RS256',
                    expiresIn: '15m',
                },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [
        {
            provide: 'REFRESH_JWT_SERVICE',
            useFactory: (configService: ConfigService) => {
                return new JwtService({
                    secret: configService.getOrThrow<string>('REFRESH_TOKEN_SECRET'),
                    signOptions: {
                        algorithm: 'HS256',
                        expiresIn: '7d',
                    },
                });
            },
            inject: [ConfigService],
        },
        // Token & Auth core services
        TokenService,
        AuthCoreService,
        // Strategy & Guards
        JwtStrategy,
        AuthGuardAccess,
        RolesGuard,
    ],
    exports: [PassportModule, JwtModule, TokenService, AuthGuardAccess, AuthCoreService, RolesGuard],
})
export class AuthModule {}
