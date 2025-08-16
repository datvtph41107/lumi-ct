import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { BaseEntity } from '../base.entity';

@Entity('user_role_mappings')
@Index(['user_id'])
@Index(['role_id'])
@Index(['scope', 'scope_id'])
export class UserRoleMapping extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'int' })
    user_id: number;

    @Column({ type: 'uuid' })
    role_id: string;

    @Column({ type: 'varchar', length: 50, default: 'global' })
    scope: string; // global, department, contract

    @Column({ type: 'bigint', nullable: true })
    scope_id?: number; // department_id or contract_id

    @Column({ type: 'int', nullable: true })
    granted_by?: number;

    @Column({ type: 'datetime', nullable: true })
    granted_at?: Date;

    @Column({ type: 'datetime', nullable: true })
    expires_at?: Date;

    @Column({ type: 'boolean', default: true })
    is_active: boolean;

    @Column({ type: 'json', nullable: true })
    conditions?: Record<string, any>; // Role-specific conditions for this user

    @Column({ type: 'json', nullable: true })
    metadata?: Record<string, any>; // Additional mapping metadata
}