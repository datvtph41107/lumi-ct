import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { HttpLoggerModule } from './core/shared/logger/http/http-logger.module';
import { AdminModule } from './modules/admin/admin.module';
import { UserModule } from './modules/user/user.module';
import { ContractsModule } from './modules/contract/contract.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CronTaskModule } from './modules/cron-task/cron-task.module';
import { ScheduleModule } from '@nestjs/schedule';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                const host = config.get<string>('DB_HOST');
                if (host) {
                    return {
                        type: 'mysql',
                        host,
                        port: parseInt(config.get<string>('DB_PORT') || '3306'),
                        username: config.get<string>('DB_USER') || 'root',
                        password: config.get<string>('DB_PASS') || '',
                        database: config.get<string>('DB_NAME') || 'contract_db',
                        autoLoadEntities: true,
                        synchronize: true,
                        logging: true,
                    } as any;
                }
                return {
                    type: 'sqlite',
                    database: ':memory:',
                    autoLoadEntities: true,
                    synchronize: true,
                    logging: false,
                } as any;
            },
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
        CronTaskModule,
    ],
    providers: [
        {
            provide: 'DATA_SOURCE',
            useExisting: DataSource,
        },
    ],
})
export class AppModule {}
