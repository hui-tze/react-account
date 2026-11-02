import {useCallback, useEffect, useState} from "react";
import {useAddressPagination} from "@/hooks/pagination";
import type {SWRResponse} from "swr";
import {PaginationMeta, PaginationResponse} from "@/apis/pagination";

export type SimpleRemotePaginateTableProps = typeof useSimpleRemotePaginateTable;

export function useLocalPaginateTable<T>(data: T[] | undefined, pageSize: number, initialPage = 1) {
    const [page, setPage] = useState(initialPage);
    const [records, setRecords] = useState<T[] | undefined>(data);
    const [filteredRecords, setFilteredRecords] = useState<T[] | undefined>(undefined);
    const updateRecords = useCallback((data: T[]) => {
        setRecords(data);
        setPage(1);
    }, []);

    useEffect(() => {
        if (!data) return;
        setRecords(data);
        setFilteredRecords(data.slice(0, pageSize));
    }, [data]);

    useEffect(() => {
        if (records == null) return;
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setFilteredRecords(records.slice(from, to));
    }, [page, records]);

    return {
        records,
        updateRecords,
        tableProps: {
            sx: {
                minHeight: filteredRecords == null || filteredRecords?.length == 0 ? "230px" : "unset",
            },
            withBorder: true,
            striped: true,
            highlightOnHover: true,
            borderRadius: "sm",
            records: filteredRecords,
            totalRecords: records?.length,
            recordsPerPage: pageSize,
            fetching: filteredRecords == null,
            page,
            onPageChange: (p: number) => setPage(p),
        },
    };
}

export type RemotePaginateTableParam = {
    meta?: PaginationMeta,
    onPageChange: (page: number) => void,
    fetching: boolean,
}

export function useRemotePaginateTable<T>(
    data: T[] | undefined, {
        meta,
        onPageChange,
        fetching = false,
    }: RemotePaginateTableParam,
) {
    const curMeta: PaginationMeta = meta ?? {
        total: 0,
        count: 15,
        current_page: 1,
        last_page: 1,
        from: 0,
        to: 0,
    };

    return {
        records: data,
        tableProps: {
            meta: curMeta,
            withBorder: true,
            striped: true,
            highlightOnHover: true,
            borderRadius: "sm",
            records: data,
            fetching: data == null || fetching,
            onPageChange: onPageChange,
        },
    };
}

export function useSimpleRemotePaginateTable<T>(useFetcher: (params: URLSearchParams) => SWRResponse<PaginationResponse<T>>) {
    const {setPage, setFilter, params} = useAddressPagination();
    const { data, isLoading, mutate, error } = useFetcher(params);
  
    const remotePaginateTableProps = useRemotePaginateTable(data?.data, {
        meta: data?.meta,
        onPageChange: setPage,
        fetching: isLoading,
    });

    return {
        isLoading,
        setFilter,
        mutate,
        error,
        ...remotePaginateTableProps
    };
}
