// === src/domain/user/user.entity.ts ===
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index } from 'typeorm';
import { Role } from '@/core/shared/enums/base.enums';

@Entity('users')
@Index(['username'], { unique: true })
@Index(['email'], { unique: true })
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    username: string;

    @Column({ type: 'varchar', length: 255 })
    password: string;

    @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
    email: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    full_name: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    phone: string;

    @Column({ type: 'enum', enum: Role, default: Role.USER })
    role: Role;

    @Column({ type: 'varchar', length: 100, nullable: true })
    department_id: string;

    @Column({ type: 'boolean', default: true })
    is_active: boolean;

    @Column({ type: 'boolean', default: false })
    is_verified: boolean;

    @Column({ type: 'boolean', default: false })
    mfa_enabled: boolean;

    @Column({ type: 'varchar', length: 255, nullable: true })
    mfa_secret: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    backup_codes: string; // JSON array of backup codes

    @Column({ type: 'timestamp', nullable: true })
    last_login_at: Date;

    @Column({ type: 'varchar', length: 45, nullable: true })
    last_login_ip: string;

    @Column({ type: 'int', default: 0 })
    login_attempts: number;

    @Column({ type: 'timestamp', nullable: true })
    locked_until: Date;

    @Column({ type: 'timestamp', nullable: true })
    password_changed_at: Date;

    @Column({ type: 'timestamp', nullable: true })
    password_expires_at: Date;

    @Column({ type: 'boolean', default: false })
    force_password_change: boolean;

    @Column({ type: 'varchar', length: 255, nullable: true })
    avatar_url: string;

    @Column({ type: 'json', nullable: true })
    preferences: any;

    @Column({ type: 'varchar', length: 100, nullable: true })
    created_by: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    updated_by: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at: Date;
}
