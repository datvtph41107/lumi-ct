import { useState, useCallback, useEffect } from "react";
import type { PaginationParams, PaginatedResponse, ApiError } from "~/types/api.types";

interface UsePaginationOptions<T> {
    apiFunction: (params: PaginationParams) => Promise<PaginatedResponse<T>>;
    initialParams?: Partial<PaginationParams>;
    autoFetch?: boolean;
}

interface UsePaginationReturn<T> {
    data: T[];
    meta: PaginatedResponse<T>["meta"] | null;
    loading: boolean;
    error: ApiError | null;
    params: PaginationParams;
    setParams: (params: Partial<PaginationParams>) => void;
    refetch: () => Promise<void>;
    nextPage: () => void;
    prevPage: () => void;
    goToPage: (page: number) => void;
}

export function usePagination<T>({ apiFunction, initialParams = {}, autoFetch = true }: UsePaginationOptions<T>): UsePaginationReturn<T> {
    const [data, setData] = useState<T[]>([]);
    const [meta, setMeta] = useState<PaginatedResponse<T>["meta"] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ApiError | null>(null);
    const [params, setParamsState] = useState<PaginationParams>({
        page: 1,
        limit: 10,
        ...initialParams,
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiFunction(params);
            setData(response.data);
            setMeta(response.meta);
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError);
        } finally {
            setLoading(false);
        }
    }, [apiFunction, params]);

    const setParams = useCallback((newParams: Partial<PaginationParams>) => {
        setParamsState((prev) => ({ ...prev, ...newParams }));
    }, []);

    const nextPage = useCallback(() => {
        if (meta && params.page! < meta.totalPages) {
            setParams({ page: params.page! + 1 });
        }
    }, [meta, params.page, setParams]);

    const prevPage = useCallback(() => {
        if (params.page! > 1) {
            setParams({ page: params.page! - 1 });
        }
    }, [params.page, setParams]);

    const goToPage = useCallback(
        (page: number) => {
            setParams({ page });
        },
        [setParams],
    );

    useEffect(() => {
        if (autoFetch) {
            fetchData();
        }
    }, [fetchData, autoFetch]);

    return {
        data,
        meta,
        loading,
        error,
        params,
        setParams,
        refetch: fetchData,
        nextPage,
        prevPage,
        goToPage,
    };
}
