import { NotificationType } from 'src/core/shared/enums/base.enums';
import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { BaseEntity } from '../base.entity';

@Entity('notifications')
export class Notification extends BaseEntity {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ type: 'enum', enum: NotificationType })
    type: NotificationType;

    @Column()
    title: string;

    @Column({ nullable: true, type: 'text' })
    message?: string;

    @Column({ nullable: true })
    data?: string; // chứa dữ liệu linh hoạt: taskId, contractId, link...

    @Column({ name: 'user_id', nullable: true })
    @Index()
    user_id?: number; // người nhận thông báo

    @Column({ nullable: true })
    read_at?: Date;

    @Column({ nullable: true })
    started_at?: Date;

    @Column({ nullable: true })
    ended_at?: Date;
}
