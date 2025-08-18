import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { LoggerModule } from '@/core/shared/logger/logger.module';
import { DatabaseModule } from '@/providers/database';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/core/domain/user/user.entity';

@Module({
    imports: [LoggerModule, DatabaseModule, AuthModule, TypeOrmModule.forFeature([User])],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule {}
