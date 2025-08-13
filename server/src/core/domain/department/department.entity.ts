import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';
import { BaseEntity } from '../base.entity';

@Entity('departments')
@Unique(['name'])
@Unique(['code'])
export class Department extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    code: string;

    @Column({ type: 'bigint', nullable: true })
    manager_id?: number;
}
