import { Module } from '@nestjs/common';
import { loggerProviders } from './logger.providers';
import { TypeOrmWinstonLogger } from './logger.typeorm';

@Module({
    providers: [...loggerProviders, TypeOrmWinstonLogger],
    exports: [...loggerProviders, TypeOrmWinstonLogger],
})
export class LoggerModule {}
