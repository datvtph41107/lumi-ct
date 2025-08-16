// === src/domain/user/user.entity.ts ===
import { Role, Status } from 'src/core/shared/enums/base.enums';
import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { BaseEntity } from '../base.entity';

@Entity('users')
@Index(['department_id'])
@Index(['role'])
@Index(['status'])
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    username: string;

    @Column({ nullable: true })
    email?: string; // only for notifications, not for login

    @Column()
    password: string;

    @Column({ default: true })
    is_active: boolean;

    @Column({ type: 'enum', enum: Status, default: Status.INACTIVE })
    status: Status;

    @Column({ nullable: true })
    remember_token?: string;

    @Column({ type: 'enum', enum: Role })
    role: Role;

    @Column({ type: 'bigint', nullable: true })
    department_id?: number;
}
