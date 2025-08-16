// src/providers/cron-task/cron-task.module.ts
import { Module } from '@nestjs/common';
import { ContractModule } from '@/modules/contract/contract.module';
import { NotificationService } from '../notification/notification.service';
// import { SocketService } from '@/core/providers/socket.service'; // nếu có dùng socket
import { LoggerModule } from '@/core/shared/logger/logger.module';
import { DatabaseModule } from '@/providers/database';
import { NotificationController } from './notification.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemNotificationSettings } from '@/core/domain/notification/system-notification-settings.entity';

@Module({
    imports: [LoggerModule, DatabaseModule, ContractModule, TypeOrmModule.forFeature([SystemNotificationSettings])],
    controllers: [NotificationController],
    providers: [
        NotificationService,
        // SocketService, // nếu dùng push socket
    ],
    exports: [NotificationService],
})
export class NotificationModule {}
