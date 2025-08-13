import { extractQbName } from '@/common/utils/generate-table.utils';
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

export class BaseQueryBuilder<T extends ObjectLiteral> {
    protected readonly qb: SelectQueryBuilder<T>;
    protected readonly qbName: string;

    constructor(qb: SelectQueryBuilder<T>) {
        this.qb = qb;
        this.qbName = extractQbName(qb);
    }

    search(query?: string, column = 'name') {
        if (query) {
            this.qb.andWhere(`${this.qbName}.${column} LIKE :q`, { q: `%${query}%` });
        }
        return this;
    }

    createdBetween(start?: Date, end?: Date, column = 'created_at') {
        if (start && end) {
            this.qb.andWhere(`${this.qbName}.${column} BETWEEN :start AND :end`, { start, end });
        }
        return this;
    }

    withType(type?: string, column = 'type') {
        if (type) {
            this.qb.andWhere(`${this.qbName}.${column} = :type`, { type });
        }
        return this;
    }

    withStatus(status?: string, column = 'status') {
        if (status) {
            this.qb.andWhere(`${this.qbName}.${column} = :status`, { status });
        }
        return this;
    }

    values(): SelectQueryBuilder<T> {
        return this.qb;
    }

    getMany(): Promise<T[]> {
        return this.qb.getMany();
    }
}
