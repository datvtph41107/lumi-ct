import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemController } from './system.controller';
import { SystemService } from './system.service';
import { SystemConfig } from '@/core/domain/system/system-config.entity';
import { SystemLog } from '@/core/domain/system/system-log.entity';
import { SystemMetric } from '@/core/domain/system/system-metric.entity';
import { BackupService } from './backup.service';
import { MonitoringService } from './monitoring.service';
import { ConfigurationService } from './configuration.service';
import { QueueModule } from '@/core/queue/queue.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SystemConfig, SystemLog, SystemMetric]),
    QueueModule,
  ],
  controllers: [SystemController],
  providers: [
    SystemService,
    BackupService,
    MonitoringService,
    ConfigurationService,
  ],
  exports: [SystemService, BackupService, MonitoringService, ConfigurationService],
})
export class SystemModule {}