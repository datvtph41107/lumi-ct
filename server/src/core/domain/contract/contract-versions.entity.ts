import { Entity, PrimaryGeneratedColumn, Column, Index, BaseEntity } from 'typeorm';

@Entity('contract_versions')
@Index(['contract_id'])
export class ContractVersion extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'char', length: 36 })
    contract_id: string;

    @Column({ type: 'int' })
    version_number: number;

    @Column({ type: 'json' })
    content_snapshot: any;

    @Column({ type: 'char', length: 36 })
    edited_by: string;

    @Column({ type: 'datetime' })
    edited_at: Date;

    @Column({ type: 'text', nullable: true })
    change_summary?: string;
}
