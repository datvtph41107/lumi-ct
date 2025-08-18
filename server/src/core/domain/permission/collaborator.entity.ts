import { Entity, PrimaryColumn, Column } from 'typeorm';
import { BaseEntity } from '../base.entity';

@Entity('collaborators')
export class Collaborator extends BaseEntity {
    @PrimaryColumn({ type: 'char', length: 36 })
    contract_id: string;

    @PrimaryColumn({ type: 'uuid' })
    user_id: string;

    @Column({ type: 'boolean', default: false })
    owner: boolean;

    @Column({ type: 'boolean', default: false })
    editor: boolean;

    @Column({ type: 'boolean', default: false })
    reviewer: boolean;

    @Column({ type: 'boolean', default: false })
    viewer: boolean;

    @Column({ type: 'boolean', default: false })
    export: boolean;

    @Column({ type: 'boolean', default: false })
    assign_change: boolean;
}
