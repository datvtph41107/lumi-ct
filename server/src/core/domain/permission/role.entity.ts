import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, Index } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Permission } from './permission.entity';

@Entity('roles')
@Index(['name'], { unique: true })
export class Role extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
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

    @ManyToMany(() => Permission, { cascade: true })
    @JoinTable({ name: 'role_permissions' })
    permissions: Permission[];
}
