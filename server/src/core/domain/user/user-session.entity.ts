import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { User } from './user.entity';

@Entity('user_sessions')
@Index(['user_id'])
@Index(['session_id'], { unique: true })
@Index(['jti'])
export class UserSession extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'int' })
    user_id: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user?: User;

    @Column({ type: 'uuid' })
    session_id: string;

    @Column({ type: 'varchar', length: 512 })
    refresh_token: string;

    @Column({ type: 'varchar', length: 512 })
    access_token_hash: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    ip_address?: string;

    @Column({ type: 'varchar', length: 512, nullable: true })
    user_agent?: string;

    @Column({ type: 'json', nullable: true })
    device_info?: any;

    @Column({ type: 'datetime' })
    expires_at: Date;

    @Column({ type: 'datetime' })
    last_activity: Date;

    @Column({ type: 'boolean', default: true })
    is_active: boolean;

    @Column({ type: 'datetime', nullable: true })
    logout_at?: Date;

    @Column({ type: 'varchar', length: 255, nullable: true })
    logout_reason?: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    jti?: string;

    @Column({ type: 'datetime', nullable: true })
    revoked_at?: Date;
}
