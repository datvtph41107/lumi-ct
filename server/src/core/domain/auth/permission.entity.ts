import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  Index,
} from 'typeorm';
import { Role } from './role.entity';

@Entity('permissions')
@Index(['resource', 'action'], { unique: true })
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'resource', type: 'varchar', length: 100 })
  resource: string;

  @Column({ name: 'action', type: 'varchar', length: 100 })
  action: string;

  @Column({ name: 'display_name', type: 'varchar', length: 200 })
  display_name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'is_system', type: 'boolean', default: false })
  is_system: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  is_active: boolean;

  @Column({ name: 'conditions_schema', type: 'jsonb', nullable: true })
  conditions_schema: any;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  // Relations
  @ManyToMany(() => Role, role => role.permissions)
  roles: Role[];
}