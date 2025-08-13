export interface FilterParams {
    query?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
}

export interface PaginationMeta {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
}

export interface PaginationLinks {
    first: string;
    previous: string | null;
    next: string | null;
    last: string;
}

export interface PaginatedResult<T> {
    items: T[];
    meta: PaginationMeta;
    links: PaginationLinks;
}
