import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import type { LoggerTypes } from '@/core/shared/logger/logger.types';
import { TokenService } from '../auth/jwt/jwt.service';

@Injectable()
export class CleanupService {
    constructor(
        @Inject('LOGGER') private readonly logger: LoggerTypes,
        private readonly tokenService: TokenService,
    ) {}

    // ✅ Run cleanup every hour
    @Cron(CronExpression.EVERY_HOUR)
    async handleTokenCleanup() {
        this.logger.APP.info('Starting scheduled token cleanup...');

        try {
            await this.tokenService.cleanupExpiredTokens();

            const stats = await this.tokenService.getSessionStatistics();
            this.logger.APP.info('Token cleanup completed', stats);
        } catch (error) {
            this.logger.APP.error('Token cleanup failed:', error);
        }
    }

    // ✅ Run detailed cleanup daily at 2 AM
    @Cron('0 2 * * *')
    async handleDailyCleanup() {
        this.logger.APP.info('Starting daily cleanup...');

        try {
            await this.tokenService.cleanupExpiredTokens();

            const stats = await this.tokenService.getSessionStatistics();
            this.logger.APP.info('Daily cleanup completed', {
                ...stats,
                timestamp: new Date().toISOString(),
            });
        } catch (error) {
            this.logger.APP.error('Daily cleanup failed:', error);
        }
    }
}
