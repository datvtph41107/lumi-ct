import { Entity, PrimaryColumn, Column } from 'typeorm';
import { BaseEntity } from '../base.entity';

@Entity('contract_contents')
export class ContractContent extends BaseEntity {
    @PrimaryColumn({ type: 'char', length: 36 })
    contract_id: string;

    @Column({ type: 'varchar', length: 20 })
    mode: string;

    @Column({ type: 'json', nullable: true })
    basic_content?: any;

    @Column({ type: 'json', nullable: true })
    editor_content?: any;

    @Column({ type: 'json', nullable: true })
    uploaded_file?: any;
}
