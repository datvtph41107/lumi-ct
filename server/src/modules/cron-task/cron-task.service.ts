// src/providers/cron-task/cron-task.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as moment from 'moment-timezone';
import { ContractService } from '@/modules/contract/contract.service';
import { NotificationService } from '../notification/notification.service';
import { ContractStatus, NotificationType } from '@/core/shared/enums/base.enums';
import { ContractPhase } from '@/core/domain/contract';
import { ContractTask } from '@/core/domain/contract/contract-taks.entity';
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

        for (const contract of contracts) {
            const relatedUsers = await this.contractService.findContractRelatedUsers(contract.id);
            this.logger.APP.info(
                `📄 Contract: ${contract.name} (ID: ${contract.id}) - Notifying users: ${relatedUsers.join(', ')}`,
            );

            await this.notificationService.notifyManyUsers({
                userIds: relatedUsers,
                type: NotificationType.CONTRACT_REMINDER,
                title: 'Contract Reminder',
                message: `Contract "${contract.name}" is ${this.formatReminderText(daysBefore, 'starting or ending')}.`,
                data: `${contract.id}`,
                startedAt: contract.start_date,
                endedAt: contract.end_date,
            });

            relatedUsers.forEach((userId) => {
                this.logger.APP.info(`Notified user ${userId} about contract ${contract.id}`);
            });
        }
    }

    private async sendPhaseReminders(daysBefore: number) {
        this.logger.APP.info(`Fetching phases due in ${daysBefore} day(s)...`);
        const phases = await this.contractService.findUpcomingPhases(daysBefore);

        await this.sendNotifications<ContractPhase>(phases, {
            type: NotificationType.PHASE_REMINDER,
            title: 'Phase Reminder',
            daysBefore,
            getUserId: (phase) => phase.assignedToId,
            getStart: (phase) => phase.start_date,
            getEnd: (phase) => phase.end_date,
        });
    }

    private async sendTaskReminders(daysBefore: number) {
        this.logger.APP.info(`Fetching tasks due in ${daysBefore} day(s)...`);
        const tasks = await this.contractService.findUpcomingTasks(daysBefore);

        await this.sendNotifications<ContractTask>(tasks, {
            type: NotificationType.TASK_REMINDER,
            title: 'Task Reminder',
            daysBefore,
            getUserId: (task) => task.assignedToId,
            getStart: (task) => task.due_date,
        });
    }

    private async sendNotifications<T extends { id: number; name: string }>(
        items: T[],
        options: {
            type: NotificationType;
            title: string;
            daysBefore: number;
            getUserId: (item: T) => number | undefined;
            getStart?: (item: T) => Date;
            getEnd?: (item: T) => Date;
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
        for (const contract of expiredContracts) {
            await this.contractService.updateStatus('contract', contract.id, ContractStatus.EXPIRED);
            this.logger.APP.warn(`Contract ${contract.id} marked as EXPIRED`);
        }
    }

    private async markExpiredPhases() {
        const expiredPhases = await this.contractService.findOverduePhases();
        for (const phase of expiredPhases) {
            await this.contractService.updateStatus('phase', phase.id, ContractStatus.EXPIRED);
            this.logger.APP.warn(`Phase ${phase.id} marked as EXPIRED`);
        }
    }

    private async markExpiredTasks() {
        const expiredTasks = await this.contractService.findOverdueTasks();
        for (const task of expiredTasks) {
            await this.contractService.updateStatus('task', task.id, ContractStatus.EXPIRED);
            this.logger.APP.warn(`Task ${task.id} marked as EXPIRED`);
        }
    }

    private formatReminderText(daysBefore: number, keyword = 'due'): string {
        return daysBefore === 0 ? `${keyword} today` : `${keyword} in ${daysBefore} day(s)`;
    }
}
