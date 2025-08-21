import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('system_logs')
@Index(['level'])
@Index(['created_at'])
@Index(['user_id'])
export class SystemLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ['info', 'warn', 'error', 'debug'], default: 'info' })
  level: 'info' | 'warn' | 'error' | 'debug';

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'text', nullable: true })
  context: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  user_id: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip: string;

  @Column({ type: 'text', nullable: true })
  user_agent: string;

  @CreateDateColumn()
  created_at: Date;
}