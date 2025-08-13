import { AdminRole } from 'src/core/shared/enums/base.enums';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '../base.entity';

@Entity('admins')
export class Admin extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    remember_token?: string;

    @Column({ type: 'enum', enum: AdminRole, default: AdminRole.SUPER_ADMIN })
    role: AdminRole;
}
