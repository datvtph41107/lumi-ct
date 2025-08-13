import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '../base.entity';

export enum MilestoneStatus {
    PENDING = 'pending',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    OVERDUE = 'overdue',
    CANCELLED = 'cancelled',
}

export enum MilestonePriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
}

@Entity('milestones')
export class Milestone extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'char', length: 36 })
    contract_id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'json', nullable: true })
    date_range?: { start_date: string; end_date: string };

    @Column({ type: 'char', length: 36 })
    assignee_id: string;

    @Column({ type: 'varchar', length: 255 })
    assignee_name: string;

    @Column({ type: 'enum', enum: MilestoneStatus })
    status: MilestoneStatus;

    @Column({ type: 'enum', enum: MilestonePriority })
    priority: MilestonePriority;

    @Column({ type: 'int', default: 0 })
    progress: number;

    @Column({ type: 'json', nullable: true })
    deliverables?: string[];

    @Column({ type: 'char', length: 36, nullable: true })
    updated_by?: string;
}
