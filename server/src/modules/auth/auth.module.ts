import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthCoreService } from '../../core/services/auth-core.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { PermissionGuard } from '../../core/guards/permission.guard';
import { User } from '../../core/domain/user/user.entity';
import { UserSession } from '../../core/domain/auth/user-session.entity';
import { Role } from '../../core/domain/auth/role.entity';
import { Permission } from '../../core/domain/auth/permission.entity';
import { UserRole } from '../../core/domain/auth/user-role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, 
      UserSession, 
      Role, 
      Permission, 
      UserRole
    ]),
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
  providers: [
    AuthService, 
    AuthCoreService,
    JwtStrategy, 
    JwtRefreshStrategy,
    PermissionGuard
  ],
  exports: [
    AuthService, 
    AuthCoreService,
    JwtStrategy, 
    JwtRefreshStrategy,
    PermissionGuard
  ],
})
export class AuthModule {}
