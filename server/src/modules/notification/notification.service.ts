import { Injectable, Inject, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { DataSource, Repository, LessThan, MoreThan, Between } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LoggerTypes } from '@/core/shared/logger/logger.types';
import {
    ContractNotification,
    NotificationType,
    NotificationStatus,
    NotificationChannel,
} from '@/core/domain/notification/notification.entity';
import {
    ContractReminder,
    ReminderType,
    ReminderStatus,
    ReminderFrequency,
} from '@/core/domain/contract/contract-reminder.entity';
import { Milestone, MilestoneStatus } from '@/core/domain/contract/contract-milestones.entity';
import { Task, TaskStatus } from '@/core/domain/contract/contract-taks.entity';
import { Contract, ContractStatus } from '@/core/domain/contract/contract.entity';
import { SystemNotificationSettings } from '@/core/domain/notification/system-notification-settings.entity';

export interface CreateNotificationDto {
    contract_id: string;
    milestone_id?: string;
    task_id?: string;
    user_id: number;
    type: NotificationType;
    channel: NotificationChannel;
    title: string;
    message: string;
    scheduled_at?: Date;
    metadata?: Record<string, any>;
}

export interface CreateReminderDto {
    contract_id: string;
    milestone_id?: string;
    task_id?: string;
    user_id: number;
    type: ReminderType;
    frequency: ReminderFrequency;
    title: string;
    message: string;
    trigger_date: Date;
    advance_days?: number;
    notification_channels?: string[];
    recipients?: number[];
    conditions?: Record<string, any>;
    max_triggers?: number;
    metadata?: Record<string, any>;
}

@Injectable()
export class NotificationService {
    private readonly notificationRepo: Repository<ContractNotification>;
    private readonly reminderRepo: Repository<ContractReminder>;
    private readonly milestoneRepo: Repository<Milestone>;
    private readonly taskRepo: Repository<Task>;
    private readonly contractRepo: Repository<Contract>;
    private readonly sysRepo: Repository<SystemNotificationSettings>;

    constructor(
        @Inject('DATA_SOURCE') private readonly db: DataSource,
        @Inject('LOGGER') private readonly logger: LoggerTypes,
    ) {
        this.notificationRepo = this.db.getRepository(ContractNotification);
        this.reminderRepo = this.db.getRepository(ContractReminder);
        this.milestoneRepo = this.db.getRepository(Milestone);
        this.taskRepo = this.db.getRepository(Task);
        this.contractRepo = this.db.getRepository(Contract);
        this.sysRepo = this.db.getRepository(SystemNotificationSettings);
    }

    // ===== NOTIFICATION MANAGEMENT =====
    async createNotification(dto: CreateNotificationDto): Promise<ContractNotification> {
        try {
            const notification = this.notificationRepo.create({
                ...dto,
                status: NotificationStatus.PENDING,
            });

            const saved = await this.notificationRepo.save(notification);

            this.logger.APP.info('Notification created', {
                id: saved.id,
                type: dto.type,
                contract_id: dto.contract_id,
                user_id: dto.user_id,
            });

            return saved;
        } catch (err) {
            this.logger.APP.error('Error creating notification', err);
            throw new InternalServerErrorException('Failed to create notification');
        }
    }

    async sendNotification(notificationId: string): Promise<boolean> {
        const notification = await this.notificationRepo.findOne({ where: { id: notificationId } });
        if (!notification) {
            throw new BadRequestException('Notification not found');
        }

        try {
            // Simulate sending notification
            await this.notificationRepo.update(notificationId, {
                status: NotificationStatus.SENT,
                sent_at: new Date(),
            });

            this.logger.APP.info('Notification sent', {
                id: notificationId,
                type: notification.type,
                channel: notification.channel,
            });

            return true;
        } catch (err) {
            await this.notificationRepo.update(notificationId, {
                status: NotificationStatus.FAILED,
                error_message: err.message,
                retry_count: notification.retry_count + 1,
            });

            this.logger.APP.error('Error sending notification', err);
            return false;
        }
    }

    async getNotificationsByUser(userId: number, filters?: any): Promise<ContractNotification[]> {
        const queryBuilder = this.notificationRepo.createQueryBuilder('notification')
            .where('notification.user_id = :userId', { userId })
            .orderBy('notification.created_at', 'DESC');

        if (filters?.is_read !== undefined) {
            queryBuilder.andWhere('notification.is_read = :isRead', { isRead: filters.is_read });
        }

        if (filters?.type) {
            queryBuilder.andWhere('notification.type = :type', { type: filters.type });
        }

        return queryBuilder.getMany();
    }

    async markAsRead(notificationId: string, userId: number): Promise<void> {
        await this.notificationRepo.update(
            { id: notificationId, user_id: userId },
            { is_read: true, read_at: new Date() }
        );
    }

    async markAllAsRead(userId: number): Promise<void> {
        await this.notificationRepo.update(
            { user_id: userId, is_read: false },
            { is_read: true, read_at: new Date() }
        );
    }

    // ===== REMINDER MANAGEMENT =====
    async createReminder(dto: CreateReminderDto): Promise<ContractReminder> {
        try {
            const reminder = this.reminderRepo.create({
                ...dto,
                status: ReminderStatus.ACTIVE,
                trigger_count: 0,
            });

            const saved = await this.reminderRepo.save(reminder);

            this.logger.APP.info('Reminder created', {
                id: saved.id,
                type: dto.type,
                contract_id: dto.contract_id,
                trigger_date: dto.trigger_date,
            });

            return saved;
        } catch (err) {
            this.logger.APP.error('Error creating reminder', err);
            throw new InternalServerErrorException('Failed to create reminder');
        }
    }

    async processReminders(): Promise<void> {
        const now = new Date();
        const reminders = await this.reminderRepo.find({
            where: {
                status: ReminderStatus.ACTIVE,
                trigger_date: LessThan(now),
            },
        });

        for (const reminder of reminders) {
            try {
                await this.processReminder(reminder);
            } catch (err) {
                this.logger.APP.error('Error processing reminder', { reminderId: reminder.id, error: err });
            }
        }
    }

    private async processReminder(reminder: ContractReminder): Promise<void> {
        // Create notification for reminder
        await this.createNotification({
            contract_id: reminder.contract_id,
            milestone_id: reminder.milestone_id,
            task_id: reminder.task_id,
            user_id: reminder.user_id,
            type: NotificationType.MILESTONE_DUE,
            channel: NotificationChannel.EMAIL,
            title: reminder.title,
            message: reminder.message,
            metadata: reminder.metadata,
        });

        // Update reminder
        reminder.trigger_count += 1;
        if (reminder.max_triggers && reminder.trigger_count >= reminder.max_triggers) {
            reminder.status = ReminderStatus.COMPLETED;
        } else {
            // Calculate next trigger date based on frequency
            reminder.trigger_date = this.calculateNextTriggerDate(reminder.trigger_date, reminder.frequency);
        }

        await this.reminderRepo.save(reminder);
    }

    private calculateNextTriggerDate(currentDate: Date, frequency: ReminderFrequency): Date {
        const nextDate = new Date(currentDate);
        
        switch (frequency) {
            case ReminderFrequency.DAILY:
                nextDate.setDate(nextDate.getDate() + 1);
                break;
            case ReminderFrequency.WEEKLY:
                nextDate.setDate(nextDate.getDate() + 7);
                break;
            case ReminderFrequency.MONTHLY:
                nextDate.setMonth(nextDate.getMonth() + 1);
                break;
            default:
                nextDate.setDate(nextDate.getDate() + 1);
        }

        return nextDate;
    }

    // ===== CRON JOBS =====
    @Cron(CronExpression.EVERY_MINUTE)
    async handleScheduledNotifications(): Promise<void> {
        const now = new Date();
        const notifications = await this.notificationRepo.find({
            where: {
                status: NotificationStatus.PENDING,
                scheduled_at: LessThan(now),
            },
        });

        for (const notification of notifications) {
            await this.sendNotification(notification.id);
        }
    }

    @Cron(CronExpression.EVERY_5_MINUTES)
    async handleReminders(): Promise<void> {
        await this.processReminders();
    }

    @Cron(CronExpression.EVERY_HOUR)
    async cleanupOldNotifications(): Promise<void> {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        await this.notificationRepo.delete({
            created_at: LessThan(thirtyDaysAgo),
            status: NotificationStatus.SENT,
        });
    }
}
