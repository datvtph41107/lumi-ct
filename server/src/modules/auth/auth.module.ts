import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

// Controllers
import { AuthController } from './auth/auth.controller';
// Services
import { TokenService } from './jwt/jwt.service';

// Guards & Validators
import { AuthValidatorService } from './guards/validate_req';
import { AuthGuardAccess } from './guards/jwt-auth.guard';
import { PermissionGuard } from './guards/permission.guard';
import { RolesGuard } from './guards/role.guard';

// Strategy
import { JwtStrategy } from './jwt/jwt.strategy';

// External Modules
import { LoggerModule } from '@/core/shared/logger/logger.module';
import { DatabaseModule } from '@/providers/database';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/core/domain/user/user.entity';
import { UserSession } from '@/core/domain/user/user-session.entity';
import { Role } from '@/core/domain/permission/role.entity';
import { Permission } from '@/core/domain/permission/permission.entity';
import { UserRole } from '@/core/domain/permission/user-role.entity';
import { AuthCoreService } from './auth/auth-core.service';

@Module({
    imports: [
        LoggerModule,
        DatabaseModule,
        ConfigModule,
        PassportModule,
        TypeOrmModule.forFeature([User, UserSession, Role, Permission, UserRole]),
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
        PermissionGuard,
        RolesGuard,
        AuthValidatorService,
    ],
    exports: [AuthValidatorService, PassportModule, JwtModule, TokenService, AuthGuardAccess, AuthCoreService],
})
export class AuthModule {}
