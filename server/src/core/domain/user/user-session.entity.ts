import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('user_sessions')
@Index('IDX_session_user_id', ['userId'])
@Index('IDX_session_jti', ['jti'])
export class UserSession {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'session_id', type: 'varchar', length: 255, unique: true })
    sessionId: string;

    @Column({ name: 'user_id', type: 'int' })
    userId: number;

    @Column({ name: 'jti', type: 'varchar', length: 255 })
    jti: string;

    // ✅ Token family for rotation tracking
    @Column({ name: 'family_id', type: 'varchar', length: 255, nullable: true })
    familyId: string | null;

    // ✅ Token generation for rotation tracking
    @Column({ name: 'generation', type: 'int', default: 1 })
    generation: number;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive: boolean;

    @Column({ name: 'last_activity', type: 'timestamp' })
    lastActivity: Date;

    @Column({ name: 'revoked_at', type: 'timestamp', nullable: true })
    revokedAt: Date | null;

    // ✅ Additional security fields
    @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
    ipAddress: string | null;

    @Column({ name: 'user_agent', type: 'text', nullable: true })
    userAgent: string | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
