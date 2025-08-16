import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { BaseEntity } from '../base.entity';

@Entity('roles')
@Index(['name'], { unique: true })
export class Role extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    name: string;

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

    @Column({ type: 'varchar', length: 50, default: 'global' })
    scope: string; // global, department, contract

    @Column({ type: 'bigint', nullable: true })
    scope_id?: number; // department_id or contract_id

    @Column({ type: 'json', nullable: true })
    permissions?: string[]; // Array of permission strings (resource:action)

    @Column({ type: 'json', nullable: true })
    conditions?: Record<string, any>; // Role-specific conditions

    @Column({ type: 'json', nullable: true })
    metadata?: Record<string, any>; // Additional role metadata

    @Column({ type: 'char', length: 36, nullable: true })
    created_by?: string;

    @Column({ type: 'char', length: 36, nullable: true })
    updated_by?: string;
}
