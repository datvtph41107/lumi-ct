import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { BaseEntity } from '../base.entity';

@Entity('permissions')
@Index(['resource', 'action'], { unique: true })
export class Permission extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    resource: string; // contract, user, notification, etc.

    @Column({ type: 'varchar', length: 100 })
    action: string; // create, read, update, delete, approve, etc.

    @Column({ type: 'varchar', length: 150, nullable: true })
    display_name?: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'boolean', default: true })
    is_active: boolean;

    @Column({ type: 'boolean', default: false })
    is_system: boolean;

    @Column({ type: 'int', default: 1 })
    priority: number;

    @Column({ type: 'json', nullable: true })
    conditions_schema?: Record<string, any>; // JSON schema for conditions

    @Column({ type: 'json', nullable: true })
    metadata?: Record<string, any>; // Additional permission metadata

    @Column({ type: 'char', length: 36, nullable: true })
    created_by?: string;

    @Column({ type: 'char', length: 36, nullable: true })
    updated_by?: string;
}
