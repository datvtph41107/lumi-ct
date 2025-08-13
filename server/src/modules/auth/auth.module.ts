import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

// Services
import { TokenService } from './jwt/jwt.service';
import { AdminAuthService } from './admin/admin.auth.service';
import { UserAuthService } from './auth/auth.service';

// Controllers
import { AdminAuthController } from './admin/admin.auth.controller';
import { AuthController } from './auth/auth.controller';

// Guards & Validators
import { AuthValidatorService } from './guards/validate_req';
import { JwtStrategy } from './jwt/jwt.strategy';
import { AuthGuardAccess } from './guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permission.guard';
import { RolesGuard } from './guards/role.guard';

// External Modules
import { LoggerModule } from '@/core/shared/logger/logger.module';
import { DatabaseModule } from '@/providers/database';

@Module({
    imports: [
        LoggerModule,
        DatabaseModule,
        ConfigModule,
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                privateKey: configService.getOrThrow<string>('ACCESS_TOKEN_PRIVATE_KEY').replace(/\\n/g, '\n'),
                publicKey: configService.getOrThrow<string>('ACCESS_TOKEN_PUBLIC_KEY').replace(/\\n/g, '\n'),
                signOptions: {
                    algorithm: 'RS256',
                    expiresIn: '15m', // Short-lived access token
                },
            }),
        }),
    ],
    controllers: [AdminAuthController, AuthController],
    providers: [
        {
            provide: 'REFRESH_JWT_SERVICE',
            useFactory: (configService: ConfigService) => {
                return new JwtService({
                    secret: configService.getOrThrow<string>('REFRESH_TOKEN_SECRET'),
                    signOptions: {
                        algorithm: 'HS256',
                        expiresIn: '7d', // Long-lived refresh token
                    },
                });
            },
            inject: [ConfigService],
        },
        // Token Service
        TokenService,
        JwtStrategy,
        // Auth Services
        AdminAuthService,
        UserAuthService,
        // Guards & Validators
        AuthGuardAccess,
        PermissionsGuard,
        RolesGuard,
        AuthValidatorService,
    ],
    exports: [AuthValidatorService, PassportModule, JwtModule, TokenService, AuthGuardAccess],
})
export class AuthModule {}
