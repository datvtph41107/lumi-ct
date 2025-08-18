import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('user_sessions')
@Index(['user_id'])
@Index(['session_id'], { unique: true })
export class UserSession {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'int' })
    user_id: number;

    @Column({ type: 'varchar', length: 64 })
    session_id: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    refresh_token?: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    access_token_hash?: string;

    @Column({ type: 'varchar', length: 64, nullable: true })
    jti?: string;

    @Column({ type: 'varchar', length: 45, nullable: true })
    ip_address?: string;

    @Column({ type: 'json', nullable: true })
    device_info?: any;

    @Column({ type: 'varchar', length: 255, nullable: true })
    user_agent?: string;

    @Column({ type: 'datetime' })
    expires_at: Date;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    last_activity: Date;

    @Column({ type: 'boolean', default: true })
    is_active: boolean;

    @Column({ type: 'datetime', nullable: true })
    logout_at?: Date;

    @Column({ type: 'varchar', length: 50, nullable: true })
    logout_reason?: string;

    @Column({ type: 'datetime', nullable: true })
    revoked_at?: Date;

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;
}
