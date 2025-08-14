import { Module } from '@nestjs/common';
import { HttpLoggerModule } from './core/shared/logger/http/http-logger.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ScheduleModule } from '@nestjs/schedule';
import { ContractsModule } from './modules/contract/contract.module';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'src/common/storage/uploads'),
            serveRoot: '/uploads',
        }),
        HttpLoggerModule,
        ContractsModule,
    ],
})
export class AppModule {}
