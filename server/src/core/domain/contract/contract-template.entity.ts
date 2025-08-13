import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '../base.entity';
@Entity('contract_templates')
export class ContractTemplate extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'varchar', length: 50 })
    contract_type: string;

    @Column({ type: 'varchar', length: 50 })
    category: string;

    @Column({ type: 'varchar', length: 20 })
    mode: string; // basic | editor | upload

    @Column({ type: 'varchar', length: 255, nullable: true })
    thumbnail_url?: string;

    @Column({ type: 'json', nullable: true })
    sections?: any[];

    @Column({ type: 'json', nullable: true })
    fields?: any[];

    @Column({ type: 'json', nullable: true })
    editor_structure?: any;

    @Column({ type: 'text', nullable: true })
    editor_content?: string;

    @Column({ type: 'boolean', default: true })
    is_active: boolean;

    @Column({ type: 'boolean', default: false })
    is_public: boolean;

    @Column({ type: 'varchar', length: 20 })
    version: string;

    @Column({ type: 'json', nullable: true })
    tags?: string[];

    @Column({ type: 'char', length: 36 })
    created_by: string;

    @Column({ type: 'char', length: 36 })
    updated_by: string;
}
