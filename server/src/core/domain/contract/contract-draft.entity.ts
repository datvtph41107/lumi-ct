import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '../base.entity';

@Entity('contract_drafts')
export class ContractDraft extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'json' })
    contract_data: any;

    @Column({ type: 'varchar', length: 20 })
    current_stage: string;

    @Column({ type: 'json' })
    stage_validations: Record<string, any>;

    @Column({ type: 'boolean', default: true })
    is_draft: boolean;

    @Column({ type: 'char', length: 36 })
    created_by: string;
}
