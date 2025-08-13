import { format, transports } from 'winston';
import * as path from 'path';
import 'winston-daily-rotate-file';

const logPath = process.env.LOG_PATH || 'logs';

export const winstonTransports = {
    app: [
        new transports.File({
            level: 'error',
            filename: path.resolve(logPath, 'error.log'),
            handleExceptions: true,
            maxsize: 10 * 1024 * 1024,
            maxFiles: 50,
        }),
        new transports.File({
            level: 'info',
            filename: path.resolve(logPath, 'app.log'),
            handleExceptions: true,
            maxsize: 10 * 1024 * 1024,
            maxFiles: 50,
        }),
    ],
    http: [
        new transports.File({
            level: 'info',
            filename: path.resolve(logPath, 'http.log'),
            handleExceptions: false,
            maxsize: 10 * 1024 * 1024,
            maxFiles: 50,
        }),
    ],
    db: [
        new transports.File({
            level: 'error',
            filename: path.resolve(logPath, 'sql_error.log'),
            handleExceptions: false,
            maxsize: 10 * 1024 * 1024,
            maxFiles: 50,
        }),
        new transports.File({
            level: 'info',
            filename: path.resolve(logPath, 'sql_query.log'),
            handleExceptions: false,
            maxsize: 10 * 1024 * 1024,
            maxFiles: 50,
        }),
    ],
};

export const winstonFormats = {
    app: format.combine(
        format.label({ label: 'Contract-MNG' }),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf((info) => {
            return `${String(info.timestamp)} [${String(info.level).toUpperCase()}]: ${String(info.message)}`;
        }),
    ),
    http: format.combine(
        format.label({ label: 'HTTP' }),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf((info) => {
            return `[${String(info.label)}]\t${String(info.timestamp)}\t[${String(info.level).toUpperCase()}]\t[${String(info.type) || ''}]\t[${String(info.ip) || ''}]\t[${String(info.method) || ''}]\t${String(info.path) || ''} \t---- ${JSON.stringify(info.message)} ;`;
        }),
    ),

    db: format.combine(
        format.label({ label: 'DATABASE' }),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf((info) => {
            return `[${String(info.label)}]\t${String(info.timestamp)}\t[${String(info.level)}]\t[${String(info.type) || 'SQL'}]\t${JSON.stringify(info.message)}`;
        }),
    ),
};
