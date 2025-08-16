import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';

@Entity('user_sessions')
@Index(['user_id', 'session_id'], { unique: true })
@Index(['refresh_token'], { unique: true })
export class UserSession {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id', type: 'int' })
    user_id: number;

    @Column({ name: 'session_id', type: 'varchar', length: 255 })
    session_id: string;

    @Column({ name: 'refresh_token', type: 'varchar', length: 500 })
    refresh_token: string;

    @Column({ name: 'access_token_hash', type: 'varchar', length: 255, nullable: true })
    access_token_hash: string;

    @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
    ip_address: string;

    @Column({ name: 'user_agent', type: 'text', nullable: true })
    user_agent: string;

    @Column({ name: 'device_info', type: 'jsonb', nullable: true })
    device_info: any;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    is_active: boolean;

    @Column({ name: 'last_activity', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    last_activity: Date;

    @Column({ name: 'expires_at', type: 'timestamp' })
    expires_at: Date;

    @Column({ name: 'logout_at', type: 'timestamp', nullable: true })
    logout_at: Date;

    @Column({ name: 'logout_reason', type: 'varchar', length: 100, nullable: true })
    logout_reason: string;

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;
}
