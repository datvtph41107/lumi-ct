import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('system_metrics')
@Index(['name'])
@Index(['created_at'])
export class SystemMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number;

  @Column({ type: 'varchar', length: 20, default: 'count' })
  unit: string;

  @Column({ type: 'text', nullable: true })
  tags: string;

  @CreateDateColumn()
  created_at: Date;
}