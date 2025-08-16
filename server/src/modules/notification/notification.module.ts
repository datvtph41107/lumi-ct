// src/providers/cron-task/cron-task.module.ts
import { Module } from '@nestjs/common';
import { ContractModule } from '@/modules/contract/contract.module';
import { NotificationService } from '../notification/notification.service';
// import { SocketService } from '@/core/providers/socket.service'; // nếu có dùng socket
import { LoggerModule } from '@/core/shared/logger/logger.module';
import { DatabaseModule } from '@/providers/database';
import { NotificationController } from './notification.controller';

@Module({
    imports: [LoggerModule, DatabaseModule, ContractModule],
    controllers: [NotificationController],
    providers: [
        NotificationService,
        // SocketService, // nếu dùng push socket
    ],
    exports: [NotificationService],
})
export class NotificationModule {}
