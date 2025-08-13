// src/core/domain/contract/contract-query.builder.ts
import { DataSource, ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { BaseQueryBuilder } from './base.query';
import moment from 'moment-timezone';
import { ContractStatus } from '@/core/domain/contract/contract.entity';

type UserIds = { userId: number | null };
const FORMAT = 'YYYY-MM-DD';

export class ContractQueryBuilder<T extends ObjectLiteral> extends BaseQueryBuilder<T> {
    constructor(qb: SelectQueryBuilder<T>) {
        super(qb);
    }

    withDepartment(departmentId?: number) {
        if (departmentId) {
            this.qb.andWhere(`${this.qbName}.department_id = :department_id`, { department_id: departmentId });
        }
        return this;
    }

    withManagerOrCreator(userId: number) {
        this.qb.andWhere(`(${this.qbName}.manager_id = :uid OR ${this.qbName}.created_by = :uid)`, { uid: userId });
        return this;
    }

    withCollaborator(userId: number, dataSource: DataSource) {
        this.qb.andWhere(
            `EXISTS (
                SELECT 1 FROM collaborators col
                WHERE col.contract_id = ${this.qbName}.id
                AND col.user_id = :uid
                AND col.active = TRUE
            )`,
            { uid: userId },
        );
        return this;
    }

    whereStartOrEndDateIn(daysBefore: number) {
        const targetDate = moment().add(daysBefore, 'days').format(FORMAT);
        this.qb.andWhere(
            `DATE(${this.qbName}.start_date) = :targetDate OR DATE(${this.qbName}.end_date) = :targetDate`,
            { targetDate },
        );
        return this;
    }

    whereStartOrEndDatePassed() {
        const today = moment().format(FORMAT);
        this.qb.andWhere(
            `(DATE(${this.qbName}.end_date) < :today OR DATE(${this.qbName}.start_date) < :today) 
             AND ${this.qbName}.status NOT IN (:...finishedStatuses)`,
            { today, finishedStatuses: [ContractStatus.COMPLETED, ContractStatus.CANCELLED] },
        );
        return this;
    }

    // Các wherePhase... và whereTask... giữ nguyên

    static async findRelatedUserIds(contractId: number, dataSource: DataSource): Promise<number[]> {
        const contract = await dataSource
            .getRepository('contracts')
            .createQueryBuilder('c')
            .where('c.id = :id', { id: contractId })
            .getOne();

        if (!contract) return [];

        const taskUsers: UserIds[] = await dataSource
            .getRepository('contract_tasks')
            .createQueryBuilder('t')
            .select('DISTINCT t.assigned_to_id', 'userId')
            .where('t.contract_id = :id', { id: contractId })
            .getRawMany();

        const phaseUsers: UserIds[] = await dataSource
            .getRepository('contract_phases')
            .createQueryBuilder('p')
            .select('DISTINCT p.assigned_to_id', 'userId')
            .where('p.contract_id = :id', { id: contractId })
            .getRawMany();

        const ids = new Set<number>();
        if (contract.created_by) ids.add(contract.created_by);

        taskUsers.forEach((u) => u.userId && ids.add(Number(u.userId)));
        phaseUsers.forEach((u) => u.userId && ids.add(Number(u.userId)));

        return Array.from(ids);
    }
}
