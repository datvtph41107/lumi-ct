import { winstonFormats, winstonTransports } from './logger.config';
import { createLogger } from 'winston';
import type { LoggerTypes } from './logger.types';

const LOGGER_KEYS = ['APP', 'HTTP', 'DB'];

// Proxy allows catch and control access actions to an object (get),(set),(apply)
export const loggerProviders = [
    {
        provide: 'LOGGER',
        useFactory: (): LoggerTypes => {
            // target: original data
            return new Proxy({} as LoggerTypes, {
                get: (_, prop: string) => {
                    if (!LOGGER_KEYS.includes(prop)) {
                        // injecting provider will autoy call .then or .onModuleInit()/
                        return undefined;
                    }

                    switch (prop) {
                        case 'APP':
                            return createLogger({
                                format: winstonFormats.app,
                                transports: winstonTransports.app,
                            });
                        case 'HTTP':
                            return createLogger({
                                format: winstonFormats.http,
                                transports: winstonTransports.http,
                            });
                        case 'DB':
                            return createLogger({
                                format: winstonFormats.db,
                                transports: winstonTransports.db,
                            });
                        default:
                            return undefined;
                    }
                },
            });
        },
    },
];
