import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { HttpLoggerModule } from './core/shared/logger/http/http-logger.module';
import { AdminModule } from './modules/admin/admin.module';
import { UserModule } from './modules/user/user.module';
import { ContractModule } from './modules/contract/contract.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CronTaskModule } from './modules/cron-task/cron-task.module';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from './providers/database';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        DatabaseModule,
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'src/common/storage/uploads'),
            serveRoot: '/uploads',
        }),
        HttpLoggerModule,
        AuthModule,
        AdminModule,
        UserModule,
        ContractModule,
        CronTaskModule,
    ],
})
export class AppModule {}
