import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import { RequestContext } from './context/request.context';
import {
    FilterParams,
    PaginatedResult,
    PaginationLinks,
    PaginationMeta,
} from '@/core/shared/interface/paginate.interface';
import * as dayjs from 'dayjs';

export class FilterQuery {
    readonly query: string;
    readonly startDate: string;
    readonly endDate: string;
    readonly page: number;
    readonly size: number;

    static readonly FORMAT = 'YYYY-MM-DD HH:mm:ss';

    constructor(params: FilterParams) {
        this.query = params.query ?? '';
        this.startDate = params.startDate ?? '';
        this.endDate = params.endDate ?? '';
        this.page = Math.max(params.page ?? 1, 1);
        this.size = Math.max(params.size ?? 20, 1);
    }

    getStartDate(): Date | undefined {
        try {
            return this.startDate ? dayjs(this.startDate, FilterQuery.FORMAT).toDate() : undefined;
        } catch {
            return undefined;
        }
    }

    getEndDate(): Date | undefined {
        try {
            return this.endDate ? dayjs(this.endDate, FilterQuery.FORMAT).toDate() : undefined;
        } catch {
            return undefined;
        }
    }

    getSkip(): number {
        return (this.page - 1) * this.size;
    }

    getTake(): number {
        return this.size;
    }

    toString(): string {
        return `[Filter] query="${this.query}", page=${this.page}, size=${this.size}, start="${this.startDate}", end="${this.endDate}"}`;
    }
}

export async function paginate<T extends ObjectLiteral>(
    qb: SelectQueryBuilder<T>,
    filter: FilterQuery,
    options: {
        qbNameEntity?: string;
        defaultOrderBy?: string;
        sortDirection?: 'ASC' | 'DESC' | boolean;
    } = {},
): Promise<PaginatedResult<T>> {
    const { qbNameEntity = '', defaultOrderBy = 'created_at' } = options;
    const sortDirection: 'ASC' | 'DESC' =
        options.sortDirection === true
            ? 'ASC'
            : options.sortDirection === false
              ? 'DESC'
              : options.sortDirection?.toString().toUpperCase() === 'ASC'
                ? 'ASC'
                : 'DESC';

    const baseUrl = RequestContext.getBaseUrl();
    qb.skip(filter.getSkip()).take(filter.getTake()).orderBy(`${qbNameEntity}.${defaultOrderBy}`, sortDirection);

    const [items, total] = await qb.getManyAndCount();

    return {
        items,
        meta: buildPaginationMeta(total, filter.page, filter.size),
        links: buildPaginationLinks(baseUrl, filter.page, filter.size, total),
    };
}

function buildPaginationMeta(total: number, page: number, size: number): PaginationMeta {
    const totalPages = Math.ceil(total / size);
    return {
        totalItems: total,
        itemCount: size,
        itemsPerPage: size,
        totalPages,
        currentPage: page + 1,
    };
}

function buildPaginationLinks(baseUrl: string, page: number, size: number, total: number): PaginationLinks {
    const totalPages = Math.ceil(total / size);
    const buildUrl = (p: number) => `${baseUrl}?page=${p}&limit=${size}`;

    return {
        first: buildUrl(1),
        previous: page > 1 ? buildUrl(page - 1) : null,
        next: page < totalPages ? buildUrl(page + 1) : null,
        last: buildUrl(totalPages),
    };
}
