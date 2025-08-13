import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '../base.entity';

@Entity('partners')
export class Partner extends BaseEntity {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    contact_info?: string;

    @Column({ nullable: true })
    notes?: string;
}
