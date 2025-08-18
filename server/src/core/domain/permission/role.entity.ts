import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { BaseEntity } from '../base.entity';

@Entity('roles')
@Index(['name'], { unique: true })
export class Role extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'boolean', default: true })
    is_active: boolean;
}
