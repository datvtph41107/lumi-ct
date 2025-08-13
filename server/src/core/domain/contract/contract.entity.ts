import { Entity, PrimaryColumn, Column, Index, BaseEntity } from 'typeorm';

export enum ContractStatus {
    DRAFT = 'draft',
    IN_REVIEW = 'in_review',
    ACTIVE = 'active',
    CANCELLED = 'cancelled',
}

export enum ContractPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
}

@Entity('contracts')
@Index(['status'])
@Index(['contract_type'])
export class Contract extends BaseEntity {
    @PrimaryColumn({ type: 'char', length: 36 })
    id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    contract_code?: string;

    @Column({ type: 'varchar', length: 50 })
    contract_type: string;

    @Column({ type: 'varchar', length: 50 })
    category: string;

    @Column({ type: 'enum', enum: ContractPriority, default: ContractPriority.MEDIUM })
    priority: ContractPriority;

    @Column({ type: 'char', length: 36 })
    drafter_id: string;

    @Column({ type: 'varchar', length: 255 })
    drafter_name: string;

    @Column({ type: 'char', length: 36 })
    manager_id: string;

    @Column({ type: 'varchar', length: 255 })
    manager_name: string;

    @Column({ type: 'char', length: 36, nullable: true })
    template_id?: string;

    @Column({ type: 'enum', enum: ContractStatus, default: ContractStatus.DRAFT })
    status: ContractStatus;

    @Column({ type: 'json', nullable: true })
    tags?: string[];

    @Column({ type: 'text', nullable: true })
    notes?: string;

    @Column({ type: 'datetime', nullable: true })
    start_date?: Date;

    @Column({ type: 'datetime', nullable: true })
    end_date?: Date;

    @Column({ type: 'varchar', length: 20, nullable: true })
    mode?: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    current_stage?: string;

    @Column({ type: 'int', default: 1 })
    version: number;

    @Column({ type: 'char', length: 36, nullable: true })
    current_version_id?: string;

    @Column({ type: 'boolean', default: true })
    auto_save_enabled: boolean;

    @Column({ type: 'boolean', default: false })
    is_draft: boolean;

    @Column({ type: 'datetime', nullable: true })
    last_auto_save?: Date;

    @Column({ type: 'datetime', nullable: true })
    deleted_at?: Date;

    @Column({ type: 'char', length: 36, nullable: true })
    deleted_by?: string;

    @Column({ type: 'char', length: 36, nullable: true })
    created_by?: string;

    @Column({ type: 'char', length: 36, nullable: true })
    updated_by?: string;
}
