import { Entity, Column, Index, BaseEntity, PrimaryGeneratedColumn } from 'typeorm';
import { ContractStatus } from '@/core/shared/enums/base.enums';

export enum ContractPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
}

export enum ContractMode {
    BASIC = 'basic',
    EDITOR = 'editor',
    UPLOAD = 'upload',
}

@Entity('contracts')
@Index(['status'])
@Index(['contract_type'])
export class Contract extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
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

    @Column({ type: 'char', length: 36, nullable: true })
    drafter_id?: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    drafter_name?: string;

    @Column({ type: 'char', length: 36, nullable: true })
    manager_id?: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    manager_name?: string;

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

    @Column({ type: 'enum', enum: ContractMode, nullable: true })
    mode?: ContractMode;

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
