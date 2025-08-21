import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueueService } from './queue.service';
import { EmailProcessor } from './processors/email.processor';
import { NotificationProcessor } from './processors/notification.processor';
import { ContractProcessor } from './processors/contract.processor';
import { AuditProcessor } from './processors/audit.processor';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD'),
          db: configService.get<number>('REDIS_DB', 0),
        },
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      }),
    }),
    BullModule.registerQueue(
      {
        name: 'email',
      },
      {
        name: 'notification',
      },
      {
        name: 'contract',
      },
      {
        name: 'audit',
      },
    ),
  ],
  providers: [
    QueueService,
    EmailProcessor,
    NotificationProcessor,
    ContractProcessor,
    AuditProcessor,
  ],
  exports: [QueueService, BullModule],
})
export class QueueModule {}