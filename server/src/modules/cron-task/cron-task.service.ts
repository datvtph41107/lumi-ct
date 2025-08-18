// src/providers/cron-task/cron-task.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as moment from 'moment-timezone';
import { ContractService } from '@/modules/contract/contract.service';
import { NotificationService } from '../notification/notification.service';
import { ContractStatus } from '@/core/shared/enums/base.enums';
import { NotificationType } from '@/core/domain/notification/notification.entity';
import { LoggerTypes } from '@/core/shared/logger/logger.types';

@Injectable()
export class CronTaskService {
    constructor(
        @Inject('LOGGER') private readonly logger: LoggerTypes,
        private readonly contractService: ContractService,
        private readonly notificationService: NotificationService,
    ) {
        moment.tz.setDefault('Asia/Ho_Chi_Minh');
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handlePhaseAndTaskNotification() {
        const now = moment().format('YYYY-MM-DD HH:mm:ss');
        this.logger.APP.info(`[${now}] Running scheduled task check...`);

        try {
            // Minimal noop to keep cron alive without missing service methods
            this.logger.APP.info('Cron heartbeat ok');
        } catch (err) {
            this.logger.APP.error('Cron job failed:', err);
        }
    }
}
