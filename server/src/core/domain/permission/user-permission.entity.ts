import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { BaseEntity } from '../base.entity';

@Entity('user_permissions')
@Index(['user_id'], { unique: true })
export class UserPermission extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'int' })
    user_id: number;

    @Column({ type: 'boolean', default: false })
    create_contract: boolean;

    @Column({ type: 'boolean', default: false })
    create_report: boolean;

    @Column({ type: 'boolean', default: false })
    read: boolean;

    @Column({ type: 'boolean', default: false })
    update: boolean;

    @Column({ type: 'boolean', default: false })
    delete: boolean;

    @Column({ type: 'boolean', default: false })
    approve: boolean;

    @Column({ type: 'boolean', default: false })
    assign: boolean;

    @Column({ type: 'varchar', length: 10, nullable: true })
    department_code?: string | null;
}