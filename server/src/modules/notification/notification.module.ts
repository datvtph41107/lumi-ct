import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { NotificationController } from './notification.controller';

// Services
import { NotificationService } from './notification.service';

// External modules
import { LoggerModule } from '@/core/shared/logger/logger.module';
import { DatabaseModule } from '@/providers/database';

// Entities
import { Notification } from '@/core/domain/notification/notification.entity';
import { SystemNotificationSettings } from '@/core/domain/notification/system-notification-settings.entity';
import { Contract } from '@/core/domain/contract/contract.entity';
import { ContractReminder } from '@/core/domain/contract/contract-reminder.entity';
import { Notification as ContractNotification } from '@/core/domain/notification/notification.entity';

@Module({
    imports: [
        LoggerModule,
        DatabaseModule,
        TypeOrmModule.forFeature([
            Notification,
            SystemNotificationSettings,
            ContractReminder,
            ContractNotification,
            Contract,
        ]),
        // External module dependencies - use forwardRef to avoid circular dependency
        forwardRef(() => import('@/modules/contract/contract.module').then((m) => m.ContractsModule)),
    ],
    controllers: [NotificationController],
    providers: [
        NotificationService,
        // TODO: Add SocketService for real-time notifications
    ],
    exports: [NotificationService],
})
export class NotificationModule {}
