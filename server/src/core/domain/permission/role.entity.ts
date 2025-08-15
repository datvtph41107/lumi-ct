import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToMany,
    JoinTable,
    Index,
} from 'typeorm';
import { UserRole } from './user-role.entity';
import { Permission } from './permission.entity';

@Entity('roles')
@Index(['name'], { unique: true })
export class Role {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'name', type: 'varchar', length: 100, unique: true })
    name: string;

    @Column({ name: 'display_name', type: 'varchar', length: 200 })
    display_name: string;

    @Column({ name: 'description', type: 'text', nullable: true })
    description: string;

    @Column({ name: 'is_system', type: 'boolean', default: false })
    is_system: boolean;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    is_active: boolean;

    @Column({ name: 'priority', type: 'int', default: 0 })
    priority: number;

    @Column({ name: 'metadata', type: 'jsonb', nullable: true })
    metadata: any;

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;

    // Relations
    @OneToMany(() => UserRole, (userRole) => userRole.role)
    user_roles: UserRole[];

    @ManyToMany(() => Permission)
    @JoinTable({
        name: 'role_permissions',
        joinColumn: { name: 'role_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
    })
    permissions: Permission[];
}
