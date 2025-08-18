// === src/domain/user/user.entity.ts ===
import { Status } from 'src/core/shared/enums/base.enums';
import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { BaseEntity } from '../base.entity';

@Entity('users')
@Index(['department_id'])
@Index(['role'])
@Index(['status'])
export class User extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    username: string;

    @Column({ type: 'string', nullable: true })
    email?: string;

    @Column()
    password: string;

    @Column({ default: true })
    is_active: boolean;

    @Column({ type: 'enum', enum: Status, default: Status.INACTIVE })
    status: Status;

    @Column({ nullable: true })
    remember_token?: string;

    @Column({ name: 'role_id', nullable: true })
    roleId: string;

    @Column({ type: 'bigint', nullable: true })
    department_id?: number;
}
