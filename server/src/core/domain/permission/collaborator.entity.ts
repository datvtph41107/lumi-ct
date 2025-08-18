import { Entity, PrimaryColumn, Column } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { CollaboratorRole } from './collaborator-role.enum';

@Entity('collaborators')
export class Collaborator extends BaseEntity {
    @PrimaryColumn({ type: 'char', length: 36 })
    contract_id: string;

    @PrimaryColumn({ type: 'int' })
    user_id: number;

    @Column({ type: 'varchar', length: 20 })
    role: CollaboratorRole;

    @Column({ type: 'boolean', default: true })
    active: boolean;

    @Column({ type: 'boolean', default: false })
    can_export: boolean;

    @Column({ type: 'boolean', default: false })
    can_manage_collaborators: boolean;
}
