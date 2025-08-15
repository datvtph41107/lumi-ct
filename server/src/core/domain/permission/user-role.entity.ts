import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Role } from './role.entity';

@Entity('user_roles')
@Index(['user_id', 'role_id', 'scope', 'scope_id'], { unique: true })
export class UserRole {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id', type: 'int' })
    user_id: number;

    @Column({ name: 'role_id', type: 'uuid' })
    role_id: string;

    @Column({ name: 'scope', type: 'varchar', length: 50, default: 'global' })
    scope: 'global' | 'department' | 'project' | 'contract';

    @Column({ name: 'scope_id', type: 'int', nullable: true })
    scope_id: number;

    @Column({ name: 'granted_by', type: 'int', nullable: true })
    granted_by: number;

    @Column({ name: 'granted_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    granted_at: Date;

    @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
    expires_at: Date;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    is_active: boolean;

    @Column({ name: 'metadata', type: 'jsonb', nullable: true })
    metadata: any;

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;

    // Relations
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Role, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'role_id' })
    role: Role;

    @ManyToOne(() => User, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'granted_by' })
    granted_by_user: User;
}
