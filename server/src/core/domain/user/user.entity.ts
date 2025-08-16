// === src/domain/user/user.entity.ts ===
import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { BaseEntity } from '../base.entity';

export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended',
    PENDING = 'pending',
}

export enum UserRole {
    USER = 'user',
    STAFF = 'staff',
    MANAGER = 'manager',
    ADMIN = 'admin',
}

@Entity('users')
@Index(['department_id'])
@Index(['role'])
@Index(['status'])
@Index(['email'], { unique: true })
@Index(['username'], { unique: true })
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    username: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 255 })
    password: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    phone?: string;

    @Column({ type: 'text', nullable: true })
    address?: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    avatar?: string;

    @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
    status: UserStatus;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
    role: UserRole;

    @Column({ type: 'bigint', nullable: true })
    department_id?: number;

    @Column({ type: 'varchar', length: 100, nullable: true })
    department_name?: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    position?: string;

    @Column({ type: 'json', nullable: true })
    role_ids?: string[]; // Array of role UUIDs for RBAC

    @Column({ type: 'json', nullable: true })
    permissions?: string[]; // Array of permission strings

    @Column({ type: 'json', nullable: true })
    settings?: Record<string, any>; // User preferences

    @Column({ type: 'datetime', nullable: true })
    last_login?: Date;

    @Column({ type: 'varchar', length: 255, nullable: true })
    remember_token?: string;

    @Column({ type: 'boolean', default: true })
    is_active: boolean;

    @Column({ type: 'boolean', default: false })
    is_system: boolean;

    @Column({ type: 'datetime', nullable: true })
    password_changed_at?: Date;

    @Column({ type: 'datetime', nullable: true })
    email_verified_at?: Date;
}
