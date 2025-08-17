// src/providers/cron-task/cron-task.module.ts
import { Module } from '@nestjs/common';
import { CronTaskService } from './cron-task.service';
import { ContractsModule } from '@/modules/contract/contract.module';
// import { SocketService } from '@/core/providers/socket.service'; // nếu có dùng socket
import { LoggerModule } from '@/core/shared/logger/logger.module';
import { DatabaseModule } from '@/providers/database';
import { NotificationModule } from '../notification/notification.module';
// import { CleanupService } from './cleanup.service';
import { AuthModule } from '../auth/auth.module';
import { CleanupService } from './cleanup.service';

@Module({
    imports: [LoggerModule, DatabaseModule, ContractsModule, NotificationModule, AuthModule],
    providers: [
        CronTaskService,
        CleanupService,
        // SocketService, // nếu dùng push socket
    ],
})
export class CronTaskModule {}
