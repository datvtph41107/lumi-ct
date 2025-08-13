import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '../base.entity';

@Entity('user_permissions')
export class UserPermission extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'bigint' })
    user_id: number;

    @Column({ default: false })
    create_contract: boolean;

    @Column({ default: false })
    create_report: boolean;

    @Column({ default: true })
    read: boolean;

    @Column({ default: false })
    update: boolean;

    @Column({ default: false })
    delete: boolean;

    @Column({ default: false })
    approve: boolean;

    @Column({ default: false })
    assign: boolean;
}
