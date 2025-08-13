import type { AxiosRequestConfig, AxiosResponse } from "axios";

export const LogLevel = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3,
} as const;

export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];

export class Logger {
    private static instance: Logger;
    private logLevel: LogLevel = LogLevel.INFO;
    private enabled: boolean;

    private constructor() {
        this.enabled = process.env.NODE_ENV === "development";
    }

    static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    setLogLevel(level: LogLevel): void {
        this.logLevel = level;
    }

    error(message: string, data?: unknown): void {
        if (this.enabled && this.logLevel >= LogLevel.ERROR) {
            console.error(`[API ERROR] ${message}`, data);
        }
    }

    warn(message: string, data?: unknown): void {
        if (this.enabled && this.logLevel >= LogLevel.WARN) {
            console.warn(`[API WARN] ${message}`, data);
        }
    }

    info(message: string, data?: unknown): void {
        if (this.enabled && this.logLevel >= LogLevel.INFO) {
            console.info(`[API INFO] ${message}`, data);
        }
    }

    debug(message: string, data?: unknown): void {
        if (this.enabled && this.logLevel >= LogLevel.DEBUG) {
            console.debug(`[API DEBUG] ${message}`, data);
        }
    }

    // Đơn giản hóa request/response logging
    request(config: AxiosRequestConfig): void {
        this.debug("→ Request:", {
            method: config.method?.toUpperCase(),
            url: config.url,
        });
    }

    response(response: AxiosResponse): void {
        this.debug("← Response:", {
            status: response.status,
            url: response.config?.url,
        });
    }
}
