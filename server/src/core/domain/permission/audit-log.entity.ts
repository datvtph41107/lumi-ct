import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '../base.entity';

@Entity('audit_logs')
export class AuditLog extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'char', length: 36, nullable: true })
    contract_id?: string;

    @Column({ type: 'int', nullable: true })
    user_id?: number;

    @Column({ type: 'varchar', length: 255 })
    action: string;

    @Column({ type: 'json', nullable: true })
    meta?: any;

    @Column({ type: 'text', nullable: true })
    description?: string;
}
