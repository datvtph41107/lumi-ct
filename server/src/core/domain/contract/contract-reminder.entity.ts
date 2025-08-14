import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '../base.entity';

export enum ReminderType {
    MILESTONE_DUE = 'milestone_due',
    MILESTONE_OVERDUE = 'milestone_overdue',
    TASK_DUE = 'task_due',
    TASK_OVERDUE = 'task_overdue',
    CONTRACT_EXPIRING = 'contract_expiring',
    CONTRACT_EXPIRED = 'contract_expired',
    APPROVAL_REQUIRED = 'approval_required',
    REVIEW_REQUIRED = 'review_required',
}

export enum ReminderFrequency {
    ONCE = 'once',
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
}

export enum ReminderStatus {
    ACTIVE = 'active',
    PAUSED = 'paused',
    CANCELLED = 'cancelled',
    COMPLETED = 'completed',
}

@Entity('contract_reminders')
export class ContractReminder extends BaseEntity {
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

    @Column({ type: 'enum', enum: ReminderType })
    type: ReminderType;

    @Column({ type: 'enum', enum: ReminderFrequency, default: ReminderFrequency.ONCE })
    frequency: ReminderFrequency;

    @Column({ type: 'enum', enum: ReminderStatus, default: ReminderStatus.ACTIVE })
    status: ReminderStatus;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'text' })
    message: string;

    @Column({ type: 'datetime' })
    trigger_date: Date;

    @Column({ type: 'int', default: 0 })
    advance_days: number;

    @Column({ type: 'json', nullable: true })
    notification_channels?: string[];

    @Column({ type: 'json', nullable: true })
    recipients?: number[];

    @Column({ type: 'json', nullable: true })
    conditions?: Record<string, any>;

    @Column({ type: 'datetime', nullable: true })
    last_triggered_at?: Date;

    @Column({ type: 'int', default: 0 })
    trigger_count: number;

    @Column({ type: 'int', default: -1 })
    max_triggers: number;

    @Column({ type: 'json', nullable: true })
    metadata?: Record<string, any>;

    @Column({ type: 'char', length: 36, nullable: true })
    created_by?: string;

    @Column({ type: 'char', length: 36, nullable: true })
    updated_by?: string;
}