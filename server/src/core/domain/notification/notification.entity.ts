import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { NotificationType } from '../../shared/enums/base.enums';

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

@Entity('notifications')
export class Notification extends BaseEntity {
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
