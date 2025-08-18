import { Module } from '@nestjs/common';
import { LoggerModule } from '@/core/shared/logger/logger.module';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminController } from './admin.controller';
import { AuthModule } from '../auth/auth.module';
import { AdminService } from './admin.service';
import { DatabaseModule } from '@/providers/database';
import { Role } from '@/core/domain/permission/role.entity';

@Module({
    imports: [
        LoggerModule, 
        DatabaseModule, 
        AuthModule,
        TypeOrmModule.forFeature([Role]),
    ],
    controllers: [AdminController],
    providers: [AdminService],
})
export class AdminModule {}
