import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '../base.entity';

export enum TaskStatus {
    PENDING = 'pending',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

export enum TaskPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
}

@Entity('tasks')
export class Task extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'char', length: 36 })
    milestone_id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'char', length: 36 })
    assignee_id: string;

    @Column({ type: 'varchar', length: 255 })
    assignee_name: string;

    @Column({ type: 'json', nullable: true })
    time_range?: { estimated_hours: number; actual_hours?: number };

    @Column({ type: 'enum', enum: TaskStatus })
    status: TaskStatus;

    @Column({ type: 'enum', enum: TaskPriority })
    priority: TaskPriority;

    @Column({ type: 'datetime', nullable: true })
    due_date?: Date;

    @Column({ type: 'char', length: 36, nullable: true })
    updated_by?: string;

    @Column({ type: 'json', default: '[]' })
    dependencies: string[];

    @Column({ type: 'json', default: '[]' })
    attachments: string[];

    @Column({ type: 'json', default: '[]' })
    comments: string[];
}
