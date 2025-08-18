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
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmWinstonLogger } from '@/core/shared/logger/logger.typeorm';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            useFactory: () => ({
                type: 'mysql' as const,
                host: process.env.DB_HOST,
                port: parseInt(process.env.DB_PORT || '3306'),
                username: process.env.DB_USER,
                password: process.env.DB_PASS,
                database: process.env.DB_NAME,
                synchronize: process.env.DB_HOST !== 'production',
                logging: true,
                logger: new TypeOrmWinstonLogger(),
                entities: [join(__dirname, '..', 'src/core/domain/**/*.entity.{js,ts}')],
            }),
        }),
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
