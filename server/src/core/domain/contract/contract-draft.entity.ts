import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '../base.entity';

@Entity('contract_drafts')
export class ContractDraft extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'char', length: 36 })
    contract_id: string;

    @Column({ type: 'varchar', length: 50 })
    stage: string;

    @Column({ type: 'json' })
    data: any;

    @Column({ type: 'int', default: 1 })
    version: number;

    @Column({ type: 'int' })
    created_by: number;
}
