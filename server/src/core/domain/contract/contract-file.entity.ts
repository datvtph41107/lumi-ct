import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '../base.entity';

@Entity('contract_files')
export class ContractFile extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'char', length: 36 })
    contract_id: string;

    @Column({ type: 'varchar', length: 255 })
    file_name: string;

    @Column({ type: 'varchar', length: 2048 })
    file_url: string;

    @Column({ type: 'bigint' })
    file_size: number;

    @Column({ type: 'varchar', length: 100 })
    mime_type: string;

    @Column({ type: 'int', default: 1 })
    version: number;

    @Column({ type: 'boolean', default: false, nullable: true })
    is_latest?: boolean;

    @Column({ type: 'text', nullable: true })
    description?: string;
}
