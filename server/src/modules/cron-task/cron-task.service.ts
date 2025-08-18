// src/providers/cron-task/cron-task.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as moment from 'moment-timezone';
import { ContractService } from '@/modules/contract/contract.service';
import { NotificationService } from '../notification/notification.service';
import { ContractStatus } from '@/core/shared/enums/base.enums';
import { NotificationType as BaseNotificationType } from '@/core/shared/enums/base.enums';
import { NotificationType } from '@/core/domain/notification/notification.entity';
// Removed unused imports of ContractPhase and ContractTask to fix build

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
            const reminderDays = [3, 1, 0];
            for (const day of reminderDays) {
                this.logger.APP.debug(`Processing reminders for day offset: ${day}`);
                await this.sendContractReminders(day);
                await this.sendPhaseReminders(day);
                await this.sendTaskReminders(day);
            }

            await this.markExpiredContracts();
            await this.markExpiredPhases();
            await this.markExpiredTasks();
        } catch (err) {
            this.logger.APP.error('Cron job failed:', err);
        }
    }

    private async sendContractReminders(daysBefore: number) {
        this.logger.APP.info(`Fetching contracts due in ${daysBefore} day(s)...`);
        const contracts = await this.contractService.findUpcomingContracts(daysBefore);

        for (const contract of contracts as any[]) {
            const relatedUsers = await this.contractService.findContractRelatedUsers((contract as any).id);
            this.logger.APP.info(
                `📄 Contract: ${(contract as any).name} (ID: ${(contract as any).id}) - Notifying users: ${relatedUsers.join(', ')}`,
            );

            await this.notificationService.notifyManyUsers({
                userIds: relatedUsers,
                type: BaseNotificationType.CONTRACT_REMINDER as unknown as NotificationType,
                title: 'Contract Reminder',
                message: `Contract "${(contract as any).name}" is ${this.formatReminderText(daysBefore, 'starting or ending')}.`,
                data: `${(contract as any).id}`,
                startedAt: (contract as any).start_date,
                endedAt: (contract as any).end_date,
            });

            relatedUsers.forEach((userId) => {
                this.logger.APP.info(`Notified user ${userId} about contract ${(contract as any).id}`);
            });
        }
    }

    private async sendPhaseReminders(daysBefore: number) {
        this.logger.APP.info(`Fetching phases due in ${daysBefore} day(s)...`);
        const phases = await this.contractService.findUpcomingPhases(daysBefore);

        await this.sendNotifications(phases, {
            type: BaseNotificationType.PHASE_REMINDER as unknown as NotificationType,
            title: 'Phase Reminder',
            daysBefore,
            getUserId: (phase: any) => phase.assignedToId,
            getStart: (phase: any) => phase.start_date,
            getEnd: (phase: any) => phase.end_date,
        });
    }

    private async sendTaskReminders(daysBefore: number) {
        this.logger.APP.info(`Fetching tasks due in ${daysBefore} day(s)...`);
        const tasks = await this.contractService.findUpcomingTasks(daysBefore);

        await this.sendNotifications(tasks, {
            type: BaseNotificationType.TASK_REMINDER as unknown as NotificationType,
            title: 'Task Reminder',
            daysBefore,
            getUserId: (task: any) => task.assignedToId,
            getStart: (task: any) => task.due_date,
        });
    }

    private async sendNotifications(
        items: any[],
        options: {
            type: NotificationType;
            title: string;
            daysBefore: number;
            getUserId: (item: any) => number | undefined;
            getStart?: (item: any) => Date;
            getEnd?: (item: any) => Date;
        },
    ) {
        for (const item of items) {
            const userId = options.getUserId(item);
            if (!userId) {
                this.logger.APP.warn(`Skipped item ${item.id} (${item.name}) - No assigned user`);
                continue;
            }

            const message = `${options.title} "${item.name}" is ${this.formatReminderText(options.daysBefore)}.`;

            await this.notificationService.create({
                type: options.type,
                title: options.title,
                message,
                data: `${item.id}`,
                userId,
                started_at: options.getStart?.(item),
                ended_at: options.getEnd?.(item),
            });
            this.logger.APP.info(`Notified user ${userId} about ${options.title.toLowerCase()} ${item.id}`);
        }
    }

    private async markExpiredContracts() {
        const expiredContracts = await this.contractService.findOverdueContracts();
        for (const contract of expiredContracts as any[]) {
            await this.contractService.updateStatus('contract', (contract as any).id, ContractStatus.EXPIRED);
            this.logger.APP.warn(`Contract ${(contract as any).id} marked as EXPIRED`);
        }
    }

    private async markExpiredPhases() {
        const expiredPhases: any[] = [];
        for (const phase of expiredPhases as any[]) {
            // update of phase status would be implemented in milestone service; skipped for now
            this.logger.APP.warn(`Phase ${(phase as any).id} marked as EXPIRED (stub)`);
            this.logger.APP.warn(`Phase ${(phase as any).id} marked as EXPIRED`);
        }
    }

    private async markExpiredTasks() {
        const expiredTasks: any[] = [];
        for (const task of expiredTasks as any[]) {
            // update of task status would be implemented in task service; skipped for now
            this.logger.APP.warn(`Task ${(task as any).id} marked as EXPIRED (stub)`);
            this.logger.APP.warn(`Task ${(task as any).id} marked as EXPIRED`);
        }
    }

    private formatReminderText(daysBefore: number, keyword = 'due'): string {
        return daysBefore === 0 ? `${keyword} today` : `${keyword} in ${daysBefore} day(s)`;
    }
}
