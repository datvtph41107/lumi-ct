import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('system_configs')
@Index(['key'], { unique: true })
export class SystemConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  key: string;

  @Column({ type: 'text' })
  value: string;

  @Column({ type: 'varchar', length: 50, default: 'string' })
  type: 'string' | 'number' | 'boolean' | 'json' | 'array';

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50, default: 'system' })
  category: 'system' | 'security' | 'email' | 'notification' | 'contract' | 'user';

  @Column({ type: 'boolean', default: false })
  is_encrypted: boolean;

  @Column({ type: 'boolean', default: true })
  is_editable: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  created_by: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  updated_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}