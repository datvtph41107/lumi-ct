import { IsString, IsOptional, IsDateString, IsEnum, IsUUID, IsArray } from 'class-validator';

export enum NotificationType {
    MILESTONE_DUE = 'milestone_due',
    TASK_ASSIGNED = 'task_assigned',
    CONTRACT_APPROVED = 'contract_approved',
    CONTRACT_REJECTED = 'contract_rejected',
    CHANGES_REQUESTED = 'changes_requested',
    REMINDER = 'reminder',
}

export enum NotificationPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    URGENT = 'urgent',
}

export class CreateNotificationDto {
    @IsString()
    title: string;

    @IsString()
    message: string;

    @IsEnum(NotificationType)
    type: NotificationType;

    @IsEnum(NotificationPriority)
    priority: NotificationPriority = NotificationPriority.MEDIUM;

    @IsOptional()
    @IsArray()
    @IsUUID(undefined, { each: true })
    recipient_ids?: string[];

    @IsOptional()
    @IsString()
    action_url?: string;

    @IsOptional()
    @IsDateString()
    scheduled_at?: string;
}

export class CreateReminderDto {
    @IsString()
    title: string;

    @IsString()
    message: string;

    @IsDateString()
    due_date: string;

    @IsOptional()
    @IsArray()
    @IsUUID(undefined, { each: true })
    recipient_ids?: string[];

    @IsOptional()
    @IsUUID()
    milestone_id?: string;

    @IsOptional()
    @IsUUID()
    task_id?: string;

    @IsOptional()
    @IsString()
    repeat_pattern?: string; // daily, weekly, monthly
}
