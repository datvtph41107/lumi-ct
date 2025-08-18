import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { HttpLoggerModule } from '@/core/shared/logger/http/http-logger.module';
import { AdminModule } from '@/modules/admin/admin.module';
import { UserModule } from '@/modules/user/user.module';
import { ContractsModule } from '@/modules/contract/contract.module';
import { NotificationModule } from '@/modules/notification/notification.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CronTaskModule } from '@/modules/cron-task/cron-task.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'src/common/storage/uploads'),
            serveRoot: '/uploads',
        }),
        HttpLoggerModule,
        AuthModule,
        AdminModule,
        UserModule,
        ContractsModule,
        NotificationModule,
        CronTaskModule,
    ],
})
export class AppModule {}
