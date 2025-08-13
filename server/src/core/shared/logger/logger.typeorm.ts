import { Logger as TypeOrmLogger } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { createLogger } from 'winston';
import { winstonFormats, winstonTransports } from './logger.config';

@Injectable()
export class TypeOrmWinstonLogger implements TypeOrmLogger {
    private readonly logger = createLogger({
        format: winstonFormats.db,
        transports: winstonTransports.db,
    });

    logQuery(query: string, parameters?: any[]) {
        this.logger.info({
            type: 'QUERY',
            message: {
                query,
                parameters,
            },
        });
    }

    logQueryError(error: string, query: string, parameters?: any[]) {
        this.logger.error({
            type: 'QUERY_ERROR',
            message: {
                query,
                parameters,
                error,
            },
        });
    }

    logQuerySlow(time: number, query: string, parameters?: any[]) {
        this.logger.warn({
            type: 'SLOW_QUERY',
            message: {
                time,
                query,
                parameters,
            },
        });
    }

    logSchemaBuild(message: string) {
        this.logger.info({
            type: 'SCHEMA_BUILD',
            message,
        });
    }

    logMigration(message: string) {
        this.logger.info({
            type: 'MIGRATION',
            message,
        });
    }

    log(level: 'log' | 'info' | 'warn', message: string) {
        switch (level) {
            case 'log':
            case 'info':
                this.logger.info({ type: 'GENERAL', message });
                break;
            case 'warn':
                this.logger.warn({ type: 'GENERAL', message });
                break;
        }
    }
}
