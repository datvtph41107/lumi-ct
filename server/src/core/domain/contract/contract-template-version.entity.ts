import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { BaseEntity } from '../base.entity';

@Entity('contract_template_versions')
@Index(['template_id'])
export class ContractTemplateVersion extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'char', length: 36 })
    template_id: string;

    @Column({ type: 'int' })
    version_number: number;

    @Column({ type: 'json' })
    content_snapshot: any;

    @Column({ type: 'json', nullable: true })
    placeholders?: any;

    @Column({ type: 'text', nullable: true })
    changelog?: string;

    @Column({ type: 'char', length: 36 })
    created_by: string;
}
