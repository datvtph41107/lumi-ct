import { IsString, IsOptional, IsDateString, IsEnum, IsUUID, IsArray, IsInt, Min } from 'class-validator';
import { NotificationType } from '@/core/shared/enums/base.enums';
import { NotificationChannel } from '@/core/domain/notification/notification.entity';
import { ReminderType, ReminderFrequency } from '@/core/domain/contract/contract-reminder.entity';

export class CreateNotificationDto {
    @IsEnum(NotificationType)
    type: NotificationType;

    @IsEnum(NotificationChannel)
    channel: NotificationChannel;

    @IsString()
    title: string;

    @IsString()
    message: string;

    @IsOptional()
    @IsDateString()
    scheduled_at?: string;

    @IsOptional()
    metadata?: Record<string, any>;
}

export class CreateReminderDto {
    @IsEnum(ReminderType)
    type: ReminderType;

    @IsEnum(ReminderFrequency)
    frequency: ReminderFrequency;

    @IsString()
    title: string;

    @IsString()
    message: string;

    @IsDateString()
    trigger_date: string; // ISO string, will be converted to Date in service

    @IsOptional()
    @IsInt()
    @Min(0)
    advance_days?: number;

    @IsOptional()
    @IsArray()
    notification_channels?: NotificationChannel[];

    @IsOptional()
    @IsArray()
    recipients?: number[];

    @IsOptional()
    @IsUUID()
    milestone_id?: string;

    @IsOptional()
    @IsUUID()
    task_id?: string;

    @IsOptional()
    metadata?: Record<string, any>;
}
