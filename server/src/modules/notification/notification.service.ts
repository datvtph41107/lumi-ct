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
import { Contract } from '@/core/domain/contract/contract.entity';
import { ContractStatus } from '@/core/shared/enums/base.enums';
import { InjectRepository } from '@nestjs/typeorm';
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

    constructor(
        @Inject('DATA_SOURCE') private readonly db: DataSource,
        @Inject('LOGGER') private readonly logger: LoggerTypes,
        @InjectRepository(SystemNotificationSettings) private readonly sysRepo: Repository<SystemNotificationSettings>,
    ) {
        this.notificationRepo = this.db.getRepository(ContractNotification);
        this.reminderRepo = this.db.getRepository(ContractReminder);
        this.milestoneRepo = this.db.getRepository(Milestone);
        this.taskRepo = this.db.getRepository(Task);
        this.contractRepo = this.db.getRepository(Contract);
    }

    async create(input: {
        type: NotificationType;
        title: string;
        message: string;
        data?: string;
        userId: number;
        started_at?: Date;
        ended_at?: Date;
    }): Promise<{ id: string }> {
        const entity = this.notificationRepo.create({
            contract_id: input.data || '',
            user_id: input.userId,
            type: input.type,
            channel: NotificationChannel.IN_APP,
            title: input.title,
            message: input.message,
            status: NotificationStatus.PENDING,
            scheduled_at: new Date(),
            metadata: { started_at: input.started_at, ended_at: input.ended_at },
        });
        const saved = await this.notificationRepo.save(entity);
        return { id: saved.id };
    }

    async notifyManyUsers(opts: {
        userIds: number[];
        type: NotificationType;
        title: string;
        message: string;
        data?: string;
        startedAt?: Date;
        endedAt?: Date;
    }): Promise<void> {
        for (const uid of opts.userIds) {
            await this.create({
                type: opts.type,
                title: opts.title,
                message: opts.message,
                data: opts.data,
                userId: uid,
                started_at: opts.startedAt,
                ended_at: opts.endedAt,
            });
        }
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
            // TODO: Implement actual notification sending logic
            // This would integrate with email service, SMS service, push notification service, etc.

            switch (notification.channel) {
                case NotificationChannel.EMAIL:
                    await this.sendEmailNotification(notification);
                    break;
                case NotificationChannel.SMS:
                    await this.sendSMSNotification(notification);
                    break;
                case NotificationChannel.PUSH:
                    await this.sendPushNotification(notification);
                    break;
                case NotificationChannel.IN_APP:
                    await this.sendInAppNotification(notification);
                    break;
                case NotificationChannel.WEBHOOK:
                    await this.sendWebhookNotification(notification);
                    break;
                default:
                    throw new BadRequestException(`Unsupported notification channel: ${notification.channel}`);
            }

            // Update notification status
            notification.status = NotificationStatus.SENT;
            notification.sent_at = new Date();
            await this.notificationRepo.save(notification);

            this.logger.APP.info('Notification sent successfully', {
                id: notification.id,
                channel: notification.channel,
            });

            return true;
        } catch (err) {
            // Update notification status to failed
            notification.status = NotificationStatus.FAILED;
            notification.error_message = err.message;
            notification.retry_count += 1;

            // Set next retry time (exponential backoff)
            const retryDelay = Math.min(Math.pow(2, notification.retry_count) * 5, 60); // 5, 10, 20, 40, 60 minutes
            notification.next_retry_at = new Date(Date.now() + retryDelay * 60 * 1000);

            await this.notificationRepo.save(notification);

            this.logger.APP.error('Failed to send notification', {
                id: notification.id,
                error: err.message,
                retry_count: notification.retry_count,
            });

            return false;
        }
    }

    async getPendingNotifications(): Promise<ContractNotification[]> {
        const now = new Date();
        return this.notificationRepo.find({
            where: {
                status: NotificationStatus.PENDING,
                scheduled_at: LessThan(now),
            },
            order: { scheduled_at: 'ASC' },
        });
    }

    async getNotificationsByContract(contractId: string): Promise<ContractNotification[]> {
        return this.notificationRepo.find({ where: { contract_id: contractId }, order: { created_at: 'DESC' as any } });
    }

    async getFailedNotifications(): Promise<ContractNotification[]> {
        const now = new Date();
        return this.notificationRepo.find({
            where: {
                status: NotificationStatus.FAILED,
                next_retry_at: LessThan(now),
                retry_count: LessThan(5), // Max 5 retries
            },
            order: { next_retry_at: 'ASC' },
        });
    }

    // ===== REMINDER MANAGEMENT =====
    async createReminder(dto: CreateReminderDto): Promise<ContractReminder> {
        try {
            const reminder = this.reminderRepo.create({
                ...dto,
                status: ReminderStatus.ACTIVE,
                max_triggers: dto.max_triggers || -1, // -1 means unlimited
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

    async getActiveReminders(): Promise<ContractReminder[]> {
        const now = new Date();
        return this.reminderRepo.find({
            where: {
                status: ReminderStatus.ACTIVE,
                trigger_date: LessThan(now),
            },
            order: { trigger_date: 'ASC' },
        });
    }

    async cancelRemindersByMilestone(milestoneId: string): Promise<void> {
        await this.reminderRepo.update(
            { milestone_id: milestoneId, status: ReminderStatus.ACTIVE },
            { status: ReminderStatus.CANCELLED },
        );
    }

    async cancelRemindersByTask(taskId: string): Promise<void> {
        await this.reminderRepo.update(
            { task_id: taskId, status: ReminderStatus.ACTIVE },
            { status: ReminderStatus.CANCELLED },
        );
    }

    async cancelRemindersByContract(contractId: string): Promise<void> {
        await this.reminderRepo.update(
            { contract_id: contractId, status: ReminderStatus.ACTIVE },
            { status: ReminderStatus.CANCELLED },
        );
    }

    async getRemindersByContract(contractId: string): Promise<ContractReminder[]> {
        return this.reminderRepo.find({
            where: { contract_id: contractId },
            order: { trigger_date: 'ASC' },
        });
    }

    async getRemindersByUser(userId: number): Promise<ContractReminder[]> {
        return this.reminderRepo.find({
            where: { user_id: userId, status: ReminderStatus.ACTIVE },
            order: { trigger_date: 'ASC' },
        });
    }

    async updateReminder(reminderId: string, updates: Partial<CreateReminderDto>): Promise<ContractReminder> {
        const reminder = await this.reminderRepo.findOne({ where: { id: reminderId } });
        if (!reminder) {
            throw new BadRequestException('Reminder not found');
        }

        Object.assign(reminder, updates);
        return this.reminderRepo.save(reminder);
    }

    async deleteReminder(reminderId: string): Promise<void> {
        const reminder = await this.reminderRepo.findOne({ where: { id: reminderId } });
        if (!reminder) {
            throw new BadRequestException('Reminder not found');
        }

        reminder.status = ReminderStatus.CANCELLED;
        await this.reminderRepo.save(reminder);
    }

    async triggerReminder(reminderId: string): Promise<boolean> {
        const reminder = await this.reminderRepo.findOne({ where: { id: reminderId } });
        if (!reminder) {
            throw new BadRequestException('Reminder not found');
        }

        try {
            // Check if reminder should be triggered
            if (reminder.status !== ReminderStatus.ACTIVE) {
                return false;
            }

            if (reminder.max_triggers > 0 && reminder.trigger_count >= reminder.max_triggers) {
                reminder.status = ReminderStatus.COMPLETED;
                await this.reminderRepo.save(reminder);
                return false;
            }

            // Create and send notifications for all recipients
            const recipients = reminder.recipients || [reminder.user_id];
            const channels = reminder.notification_channels || [NotificationChannel.EMAIL];

            for (const userId of recipients) {
                for (const channel of channels) {
                    await this.createNotification({
                        contract_id: reminder.contract_id,
                        milestone_id: reminder.milestone_id,
                        task_id: reminder.task_id,
                        user_id: userId,
                        type: this.mapReminderTypeToNotificationType(reminder.type),
                        channel: channel as NotificationChannel,
                        title: reminder.title,
                        message: reminder.message,
                        scheduled_at: new Date(),
                        metadata: reminder.metadata,
                    });
                }
            }

            // Update reminder
            reminder.last_triggered_at = new Date();
            reminder.trigger_count += 1;

            // Calculate next trigger date based on frequency
            if (reminder.frequency !== ReminderFrequency.ONCE) {
                reminder.trigger_date = this.calculateNextTriggerDate(reminder.trigger_date, reminder.frequency);
            } else {
                reminder.status = ReminderStatus.COMPLETED;
            }

            await this.reminderRepo.save(reminder);

            this.logger.APP.info('Reminder triggered successfully', {
                id: reminder.id,
                trigger_count: reminder.trigger_count,
            });

            return true;
        } catch (err) {
            this.logger.APP.error('Failed to trigger reminder', {
                id: reminder.id,
                error: err.message,
            });
            return false;
        }
    }

    // ===== CRON JOBS =====
    @Cron(CronExpression.EVERY_MINUTE)
    async processPendingNotifications() {
        try {
            const pendingNotifications = await this.getPendingNotifications();

            for (const notification of pendingNotifications) {
                await this.sendNotification(notification.id);
            }

            const failedNotifications = await this.getFailedNotifications();

            for (const notification of failedNotifications) {
                await this.sendNotification(notification.id);
            }

            if (pendingNotifications.length > 0 || failedNotifications.length > 0) {
                this.logger.APP.info('Processed notifications', {
                    pending: pendingNotifications.length,
                    failed: failedNotifications.length,
                });
            }
        } catch (err) {
            this.logger.APP.error('Error processing pending notifications', err);
        }
    }

    @Cron(CronExpression.EVERY_5_MINUTES)
    async processReminders() {
        try {
            const activeReminders = await this.getActiveReminders();

            for (const reminder of activeReminders) {
                await this.triggerReminder(reminder.id);
            }

            if (activeReminders.length > 0) {
                this.logger.APP.info('Processed reminders', {
                    count: activeReminders.length,
                });
            }
        } catch (err) {
            this.logger.APP.error('Error processing reminders', err);
        }
    }

    @Cron(CronExpression.EVERY_DAY_AT_9AM)
    async checkMilestoneDueDates() {
        try {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            // Find milestones due tomorrow
            const dueMilestones = await this.milestoneRepo.find({
                where: {
                    status: MilestoneStatus.PENDING,
                    date_range: Between(today, tomorrow),
                },
            });

            for (const milestone of dueMilestones) {
                await this.createMilestoneDueReminder(milestone);
            }

            // Find overdue milestones
            const overdueMilestones = await this.milestoneRepo.find({
                where: {
                    status: MilestoneStatus.PENDING,
                    date_range: LessThan(today),
                },
            });

            for (const milestone of overdueMilestones) {
                await this.createMilestoneOverdueReminder(milestone);
            }

            if (dueMilestones.length > 0 || overdueMilestones.length > 0) {
                this.logger.APP.info('Checked milestone due dates', {
                    due: dueMilestones.length,
                    overdue: overdueMilestones.length,
                });
            }
        } catch (err) {
            this.logger.APP.error('Error checking milestone due dates', err);
        }
    }

    @Cron(CronExpression.EVERY_DAY_AT_9AM)
    async checkTaskDueDates() {
        try {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            // Find tasks due tomorrow
            const dueTasks = await this.taskRepo.find({
                where: {
                    status: TaskStatus.PENDING,
                    due_date: Between(today, tomorrow),
                },
            });

            for (const task of dueTasks) {
                await this.createTaskDueReminder(task);
            }

            // Find overdue tasks
            const overdueTasks = await this.taskRepo.find({
                where: {
                    status: TaskStatus.PENDING,
                    due_date: LessThan(today),
                },
            });

            for (const task of overdueTasks) {
                await this.createTaskOverdueReminder(task);
            }

            if (dueTasks.length > 0 || overdueTasks.length > 0) {
                this.logger.APP.info('Checked task due dates', {
                    due: dueTasks.length,
                    overdue: overdueTasks.length,
                });
            }
        } catch (err) {
            this.logger.APP.error('Error checking task due dates', err);
        }
    }

    @Cron(CronExpression.EVERY_DAY_AT_9AM)
    async checkContractExpiry() {
        try {
            const today = new Date();
            const thirtyDaysFromNow = new Date(today);
            thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

            // Find contracts expiring in 30 days
            const expiringContracts = await this.contractRepo.find({
                where: {
                    status: ContractStatus.ACTIVE,
                    end_date: Between(today, thirtyDaysFromNow),
                },
            });

            for (const contract of expiringContracts) {
                await this.createContractExpiringReminder(contract);
            }

            // Find expired contracts
            const expiredContracts = await this.contractRepo.find({
                where: {
                    status: ContractStatus.ACTIVE,
                    end_date: LessThan(today),
                },
            });

            for (const contract of expiredContracts) {
                await this.createContractExpiredReminder(contract);
            }

            if (expiringContracts.length > 0 || expiredContracts.length > 0) {
                this.logger.APP.info('Checked contract expiry', {
                    expiring: expiringContracts.length,
                    expired: expiredContracts.length,
                });
            }
        } catch (err) {
            this.logger.APP.error('Error checking contract expiry', err);
        }
    }

    // ===== HELPER METHODS =====
    private mapReminderTypeToNotificationType(reminderType: ReminderType): NotificationType {
        const mapping: Record<ReminderType, NotificationType> = {
            [ReminderType.MILESTONE_DUE]: NotificationType.MILESTONE_DUE,
            [ReminderType.MILESTONE_OVERDUE]: NotificationType.MILESTONE_OVERDUE,
            [ReminderType.TASK_DUE]: NotificationType.TASK_DUE,
            [ReminderType.TASK_OVERDUE]: NotificationType.TASK_OVERDUE,
            [ReminderType.CONTRACT_EXPIRING]: NotificationType.CONTRACT_EXPIRING,
            [ReminderType.CONTRACT_EXPIRED]: NotificationType.CONTRACT_EXPIRED,
            [ReminderType.APPROVAL_REQUIRED]: NotificationType.APPROVAL_REQUIRED,
            [ReminderType.REVIEW_REQUIRED]: NotificationType.REVIEW_REQUIRED,
        };
        return mapping[reminderType];
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
                return nextDate;
        }

        return nextDate;
    }

    private async createMilestoneDueReminder(milestone: Milestone): Promise<void> {
        const contract = await this.contractRepo.findOne({ where: { id: milestone.contract_id } });
        if (!contract) return;

        await this.createReminder({
            contract_id: milestone.contract_id,
            milestone_id: milestone.id,
            user_id: parseInt(milestone.assignee_id),
            type: ReminderType.MILESTONE_DUE,
            frequency: ReminderFrequency.ONCE,
            title: `Milestone Due: ${milestone.name}`,
            message: `The milestone "${milestone.name}" is due tomorrow. Please review and update the progress.`,
            trigger_date: new Date(),
            notification_channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
            metadata: {
                milestone_name: milestone.name,
                contract_name: contract.name,
            },
        });
    }

    // Public wrappers used by contract service
    async createMilestoneReminder(milestone: Milestone): Promise<void> {
        await this.createMilestoneDueReminder(milestone);
    }
    async createTaskReminder(task: Task): Promise<void> {
        await this.createTaskDueReminder(task);
    }

    private async createMilestoneOverdueReminder(milestone: Milestone): Promise<void> {
        const contract = await this.contractRepo.findOne({ where: { id: milestone.contract_id } });
        if (!contract) return;

        await this.createReminder({
            contract_id: milestone.contract_id,
            milestone_id: milestone.id,
            user_id: parseInt(milestone.assignee_id),
            type: ReminderType.MILESTONE_OVERDUE,
            frequency: ReminderFrequency.DAILY,
            title: `Milestone Overdue: ${milestone.name}`,
            message: `The milestone "${milestone.name}" is overdue. Please take immediate action.`,
            trigger_date: new Date(),
            notification_channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
            max_triggers: 7, // Stop after 7 days
            metadata: {
                milestone_name: milestone.name,
                contract_name: contract.name,
            },
        });
    }

    private async createTaskDueReminder(task: Task): Promise<void> {
        const milestone = await this.milestoneRepo.findOne({ where: { id: task.milestone_id } });
        if (!milestone) return;

        await this.createReminder({
            contract_id: milestone.contract_id,
            task_id: task.id,
            user_id: parseInt(task.assignee_id),
            type: ReminderType.TASK_DUE,
            frequency: ReminderFrequency.ONCE,
            title: `Task Due: ${task.name}`,
            message: `The task "${task.name}" is due tomorrow. Please complete it on time.`,
            trigger_date: new Date(),
            notification_channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
            metadata: {
                task_name: task.name,
                milestone_name: milestone.name,
            },
        });
    }

    private async createTaskOverdueReminder(task: Task): Promise<void> {
        const milestone = await this.milestoneRepo.findOne({ where: { id: task.milestone_id } });
        if (!milestone) return;

        await this.createReminder({
            contract_id: milestone.contract_id,
            task_id: task.id,
            user_id: parseInt(task.assignee_id),
            type: ReminderType.TASK_OVERDUE,
            frequency: ReminderFrequency.DAILY,
            title: `Task Overdue: ${task.name}`,
            message: `The task "${task.name}" is overdue. Please complete it as soon as possible.`,
            trigger_date: new Date(),
            notification_channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
            max_triggers: 5, // Stop after 5 days
            metadata: {
                task_name: task.name,
                milestone_name: milestone.name,
            },
        });
    }

    private async createContractExpiringReminder(contract: Contract): Promise<void> {
        await this.createReminder({
            contract_id: contract.id,
            user_id: parseInt(contract.created_by || '0'),
            type: ReminderType.CONTRACT_EXPIRING,
            frequency: ReminderFrequency.WEEKLY,
            title: `Contract Expiring: ${contract.name}`,
            message: `The contract "${contract.name}" will expire in 30 days. Please review and take necessary action.`,
            trigger_date: new Date(),
            notification_channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
            max_triggers: 4, // Stop after 4 weeks
            metadata: {
                contract_name: contract.name,
                expiry_date: contract.end_date,
            },
        });
    }

    private async createContractExpiredReminder(contract: Contract): Promise<void> {
        await this.createReminder({
            contract_id: contract.id,
            user_id: parseInt(contract.created_by || '0'),
            type: ReminderType.CONTRACT_EXPIRED,
            frequency: ReminderFrequency.WEEKLY,
            title: `Contract Expired: ${contract.name}`,
            message: `The contract "${contract.name}" has expired. Please review and update the status.`,
            trigger_date: new Date(),
            notification_channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
            max_triggers: 2, // Stop after 2 weeks
            metadata: {
                contract_name: contract.name,
                expiry_date: contract.end_date,
            },
        });
    }

    // ===== NOTIFICATION SENDING METHODS (PLACEHOLDER) =====
    private async sendEmailNotification(notification: ContractNotification): Promise<void> {
        // Integrate with your mail provider here (e.g., nodemailer, SES)
        // Example stub that logs payload and simulates async send
        const to = notification.metadata?.recipient_email || 'noreply@example.com';
        const subject = notification.title || 'Thông báo hợp đồng';
        const text = notification.message || '';
        this.logger.APP.info('[Email] sending', { to, subject });
        await new Promise((r) => setTimeout(r, 50));
        this.logger.APP.info('[Email] sent', { id: notification.id });
    }

    private async sendSMSNotification(notification: ContractNotification): Promise<void> {
        // Integrate with SMS provider (Twilio, etc.)
        const phone = notification.metadata?.phone;
        this.logger.APP.info('[SMS] sending', { phone });
        await new Promise((r) => setTimeout(r, 25));
    }

    private async sendPushNotification(notification: ContractNotification): Promise<void> {
        // Integrate with push (Firebase/OneSignal/Web Push)
        const deviceToken = notification.metadata?.deviceToken;
        this.logger.APP.info('[PUSH] sending', { deviceToken });
        await new Promise((r) => setTimeout(r, 25));
    }

    private async sendInAppNotification(notification: ContractNotification): Promise<void> {
        // Store to DB or emit via websocket to client
        this.logger.APP.info('[IN_APP] stored', { id: notification.id });
    }

    private async sendWebhookNotification(notification: ContractNotification): Promise<void> {
        // POST to a configured webhook url
        const url = notification.metadata?.webhookUrl;
        this.logger.APP.info('[WEBHOOK] posting', { url });
        await new Promise((r) => setTimeout(r, 25));
    }

    // ===== GLOBAL SETTINGS (DB-backed with default fallback) =====
    async getGlobalSettings() {
        let settings = await this.sysRepo.find({ order: { created_at: 'DESC' as any }, take: 1 });
        if (!settings || settings.length === 0) {
            return {
                enableEmailNotifications: true,
                enableSMSNotifications: false,
                enableInAppNotifications: true,
                enablePushNotifications: true,
                workingHours: {
                    start: '09:00',
                    end: '17:00',
                    timezone: 'Asia/Ho_Chi_Minh',
                    workingDays: [1, 2, 3, 4, 5],
                },
                quietHours: { enabled: false, start: '22:00', end: '08:00' },
                escalationRules: { enabled: false, escalateAfter: { value: 24, unit: 'hours' }, escalateTo: [] },
                defaultRecipients: [],
            };
        }
        const s = settings[0];
        return {
            enableEmailNotifications: s.enable_email_notifications,
            enableSMSNotifications: s.enable_sms_notifications,
            enableInAppNotifications: s.enable_inapp_notifications,
            enablePushNotifications: s.enable_push_notifications,
            workingHours: s.working_hours,
            quietHours: s.quiet_hours,
            escalationRules: s.escalation_rules,
            defaultRecipients: s.default_recipients || [],
        };
    }

    async updateGlobalSettings(input: any) {
        const entity = this.sysRepo.create({
            enable_email_notifications: !!input.enableEmailNotifications,
            enable_sms_notifications: !!input.enableSMSNotifications,
            enable_inapp_notifications: !!input.enableInAppNotifications,
            enable_push_notifications: !!input.enablePushNotifications,
            working_hours: input.workingHours,
            quiet_hours: input.quietHours,
            escalation_rules: input.escalationRules,
            default_recipients: input.defaultRecipients || [],
        });
        const saved = await this.sysRepo.save(entity);
        this.logger.APP.info('[Notifications] global settings updated', { id: saved.id });
        return this.getGlobalSettings();
    }
}
