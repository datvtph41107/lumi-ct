// src/core/domain/contract/contract-query.builder.ts
import { DataSource, ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { BaseQueryBuilder } from './base.query';
import moment from 'moment-timezone';

export class ContractQueryBuilder<T extends ObjectLiteral> extends BaseQueryBuilder<T> {
    constructor(qb: SelectQueryBuilder<T>) { super(qb); }

    withDepartment(departmentId?: number) {
        if (departmentId) this.qb.andWhere(`${this.qbName}.department_id = :department_id`, { department_id: departmentId });
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
        const targetDate = moment().add(daysBefore, 'days').format('YYYY-MM-DD');
        this.qb.andWhere(
            `DATE(${this.qbName}.start_date) = :targetDate OR DATE(${this.qbName}.end_date) = :targetDate`,
            { targetDate },
        );
        return this;
    }

    whereStartOrEndDatePassed() {
        const today = moment().format('YYYY-MM-DD');
        this.qb.andWhere(
            `(DATE(${this.qbName}.end_date) < :today OR DATE(${this.qbName}.start_date) < :today)`,
            { today },
        );
        return this;
    }
}
