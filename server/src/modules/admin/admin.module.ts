import { Module } from '@nestjs/common';
import { LoggerModule } from '@/core/shared/logger/logger.module';

import { AdminController } from './admin.controller';
import { AuthModule } from '../auth/auth.module';
import { AdminService } from './admin.service';
import { DatabaseModule } from '@/providers/database';

@Module({
    imports: [LoggerModule, DatabaseModule, AuthModule],
    controllers: [AdminController],
    providers: [AdminService],
})
export class AdminModule {}
