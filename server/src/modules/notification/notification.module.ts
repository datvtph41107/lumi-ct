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
import { NotificationProcessor } from '@/core/queue/processors/notification.processor';

@Module({
    imports: [
        LoggerModule,
        DatabaseModule,
        TypeOrmModule.forFeature([Notification, SystemNotificationSettings]),
        // External module dependencies - use forwardRef to avoid circular dependency
        forwardRef(() => import('@/modules/contract/contract.module').then((m) => m.ContractsModule)),
        forwardRef(() => import('@/modules/user/user.module').then((m) => m.UserModule)),
    ],
    controllers: [NotificationController],
    providers: [
        NotificationService,
        // TODO: Add SocketService for real-time notifications
        NotificationProcessor,
    ],
    exports: [NotificationService],
})
export class NotificationModule {}
