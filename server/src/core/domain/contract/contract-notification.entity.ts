import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '../base.entity';

export enum NotificationType {
    MILESTONE_DUE = 'milestone_due',
    MILESTONE_OVERDUE = 'milestone_overdue',
    TASK_DUE = 'task_due',
    TASK_OVERDUE = 'task_overdue',
    CONTRACT_EXPIRING = 'contract_expiring',
    CONTRACT_EXPIRED = 'contract_expired',
    APPROVAL_REQUIRED = 'approval_required',
    REVIEW_REQUIRED = 'review_required',
    COLLABORATOR_ADDED = 'collaborator_added',
    COLLABORATOR_REMOVED = 'collaborator_removed',
    OWNERSHIP_TRANSFERRED = 'ownership_transferred',
}

export enum NotificationStatus {
    PENDING = 'pending',
    SENT = 'sent',
    FAILED = 'failed',
    CANCELLED = 'cancelled',
}

export enum NotificationChannel {
    EMAIL = 'email',
    SMS = 'sms',
    PUSH = 'push',
    IN_APP = 'in_app',
    WEBHOOK = 'webhook',
}

@Entity('contract_notifications')
export class ContractNotification extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'char', length: 36 })
    contract_id: string;

    @Column({ type: 'char', length: 36, nullable: true })
    milestone_id?: string;

    @Column({ type: 'char', length: 36, nullable: true })
    task_id?: string;

    @Column({ type: 'int' })
    user_id: number;

    @Column({ type: 'enum', enum: NotificationType })
    type: NotificationType;

    @Column({ type: 'enum', enum: NotificationStatus, default: NotificationStatus.PENDING })
    status: NotificationStatus;

    @Column({ type: 'enum', enum: NotificationChannel })
    channel: NotificationChannel;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'text' })
    message: string;

    @Column({ type: 'json', nullable: true })
    metadata?: Record<string, any>;

    @Column({ type: 'datetime', nullable: true })
    scheduled_at?: Date;

    @Column({ type: 'datetime', nullable: true })
    sent_at?: Date;

    @Column({ type: 'int', default: 0 })
    retry_count: number;

    @Column({ type: 'datetime', nullable: true })
    next_retry_at?: Date;

    @Column({ type: 'text', nullable: true })
    error_message?: string;

    @Column({ type: 'boolean', default: false })
    is_read: boolean;

    @Column({ type: 'datetime', nullable: true })
    read_at?: Date;
}