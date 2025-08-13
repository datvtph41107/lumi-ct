import type { Logger } from 'winston';

export interface LoggerTypes {
    APP: Logger;
    HTTP: Logger;
    DB: Logger;
}
