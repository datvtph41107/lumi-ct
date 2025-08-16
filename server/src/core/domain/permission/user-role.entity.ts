import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { BaseEntity } from '../base.entity';

@Entity('user_roles')
@Index(['user_id'])
@Index(['role_id'])
@Index(['scope', 'scope_id'])
export class UserRole extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'int' })
    user_id: number;

    @Column({ type: 'uuid' })
    role_id: string;

    @Column({ type: 'varchar', length: 50, default: 'global' })
    scope: string;

    @Column({ type: 'int', nullable: true })
    scope_id?: number;

    @Column({ type: 'int', nullable: true })
    granted_by?: number;

    @Column({ type: 'datetime', nullable: true })
    granted_at?: Date;

    @Column({ type: 'boolean', default: true })
    is_active: boolean;
}
