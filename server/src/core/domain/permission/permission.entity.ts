import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { BaseEntity } from '../base.entity';

@Entity('permissions')
@Index(['resource', 'action'], { unique: true })
export class Permission extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    resource: string;

    @Column({ type: 'varchar', length: 100 })
    action: string;

    @Column({ type: 'varchar', length: 150, nullable: true })
    display_name?: string;

    @Column({ type: 'boolean', default: true })
    is_active: boolean;

    @Column({ type: 'json', nullable: true })
    conditions_schema?: Record<string, any>;
}
