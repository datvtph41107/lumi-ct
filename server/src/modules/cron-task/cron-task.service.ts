// src/providers/cron-task/cron-task.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as moment from 'moment-timezone';
import { NotificationService } from '../notification/notification.service';
// Removed unused imports of ContractPhase and ContractTask to fix build

import { LoggerTypes } from '@/core/shared/logger/logger.types';

@Injectable()
export class CronTaskService {
    constructor(
        @Inject('LOGGER') private readonly logger: LoggerTypes,
        private readonly notificationService: NotificationService,
    ) {
        moment.tz.setDefault('Asia/Ho_Chi_Minh');
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handlePhaseAndTaskNotification() {
        const now = moment().format('YYYY-MM-DD HH:mm:ss');
        this.logger.APP.info(`[${now}] Running scheduled task check...`);

        try {
            const reminderDays = [3, 1, 0];
            for (const day of reminderDays) {
                this.logger.APP.debug(`Processing reminders for day offset: ${day}`);
                // Delegate to NotificationService cron processors
                await this.notificationService.processReminders();
            }

            // Process pending/failed notifications
            await this.notificationService.processPendingNotifications();
        } catch (err) {
            this.logger.APP.error('Cron job failed:', err);
        }
    }
    private formatReminderText(daysBefore: number, keyword = 'due'): string {
        return daysBefore === 0 ? `${keyword} today` : `${keyword} in ${daysBefore} day(s)`;
    }
}
