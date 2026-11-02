import {KeyedMutator, SWRResponse} from "swr";
import HkDataTable, {ColumnProps} from ".";
import {memo, ReactNode, useEffect, useState} from "react";
import {type PaginationResponse} from "@/apis/pagination";
import {useSimpleRemotePaginateTable} from "@/hooks/tables";
import {useAddressPagination} from "@/hooks/pagination";
import PaginatedTableFooter from "./PaginatedTableFooter";
import {isDateRange, TableFilters} from "@/apis/table";
import {ErrorCard} from "../Display/ErrorCard";

export type ColumnRecord = {
  [key: string]: string | string[] | number | number[] | boolean | undefined | null | ColumnRecord | ColumnRecord[];
};
export type ParsedColumnRecord = string|number|boolean|undefined|null;
export interface CommonColumnProps<TData> {
    accessor: string,
    title?: ReactNode,
    render?: (record: TData, index: number, mutator: KeyedMutator<PaginationResponse<TData>>) => ReactNode,
}
export type RowData<T> = T[] | PaginationResponse<T>;

export type AutoGenerateRemoteTableProps<T> = {
    useFetcher: (params: URLSearchParams) => SWRResponse<PaginationResponse<T>>,
    params: TableFilters,
    sort?: string[];
    idAccessor?: string,
    onRowClick?: (value: T) => void,
    rowClassName?: (row: T) => string | undefined,
    canClickRow?: (row: T) => boolean,
    columns: ColumnProps<T>[],
    hover?: boolean,
}

// Type Guard to check if data is paginated
export function isPaginatedData<T>(data: RowData<T>): data is PaginationResponse<T> {
  return (data as PaginationResponse<T>).data !== undefined;
}

function AutoGenerateRemoteTableComp<T extends ColumnRecord>({
    useFetcher,
    params,
    sort = [],
    idAccessor,
    onRowClick,
    rowClassName,
    canClickRow,
    columns,
    hover,
}: AutoGenerateRemoteTableProps<T>) {
    const {setFilter, params: query} = useAddressPagination();

    useEffect(setFilter((q) => {
        Object.keys(params).forEach((accessor) => {
            const filter = params[accessor as keyof TableFilters];
            if (!filter || typeof filter !== 'object') return;
        
            const value = filter.value;
            const by = filter.filter.by;
        
            if (value && ((typeof value === 'string' && value.length > 0) || isDateRange(value) ||
                (Array.isArray(value) && value.length > 0))) 
            {
                switch (by) {
                    case 'date_eq':
                        q.whereDateEqual(accessor, value as string);
                        break;

                    case 'date_between':
                        if (isDateRange(value)) {
                            q.whereDateRange(accessor, value.start, value.end);
                        }
                        break;

                    case 'eq':
                        q.where(accessor, value as string);
                        break;

                    case 'is':
                        q.whereIs(accessor, value as string);
                        break;

                    case 'like':
                        q.whereLike(accessor, value as string);
                        break;

                    case 'in':
                        q.whereIn(accessor, value as string[]);
                        break;
                }
            }
        });

        if (sort.length > 0) {
            sort.forEach((sortRule) => {
                const [field, order] = sortRule.split("|");
                if (field) {
                    if (order === "desc") q.sortByDesc(field);
                    else q.sortByAsc(field);
                }
            });
        } else {
            q.sortByAsc("id");
        }
        
        return true;
    }), [params, useFetcher]);   // a new fetcher means the page's own filters changed: back to page 1

    // the effect above writes page / sort / filters into the URL; fetching before that
    // would send a bare request (unpaginated on the backend) and then the real one
    if (!query.has("page")) {
        return (
            <div className="loader-pendulums mt-10" />
        );
    }

    return (
        <RemoteTableBody useFetcher={useFetcher} idAccessor={idAccessor} onRowClick={onRowClick} rowClassName={rowClassName} canClickRow={canClickRow} columns={columns} hover={hover} />
    );
}

function RemoteTableBody<T extends ColumnRecord>({
    useFetcher,
    idAccessor,
    onRowClick,
    rowClassName,
    canClickRow,
    columns,
    hover,
}: Omit<AutoGenerateRemoteTableProps<T>, "params" | "sort">) {
    const {isLoading, tableProps, mutate, error} = useSimpleRemotePaginateTable(useFetcher);

    const data = tableProps.records ? tableProps.records : [];

    if(error) {
        return (
            <ErrorCard error={error} />
        );
    }

    if (isLoading) {
        return (
            <div className="loader-pendulums mt-10" />
        );
    }

    return (
        <>
            <HkDataTable
                column={columns}
                rowData={data}
                rowSelection={false}
                classes="table nowrap w-100"
                responsive
                hover={hover ?? false}
                mutator={mutate}
                idAccessor={idAccessor}
                onRowClick={onRowClick}
                rowClassName={rowClassName}
                canClickRow={canClickRow}
            />

            {
                ! (data.length === 0) &&
                <PaginatedTableFooter
                    setPage={tableProps.onPageChange}
                    meta={tableProps.meta}
                />
            }
            
        </>
    );
}

// re-render only for a new fetcher (pages wrap theirs in useCallback over their filters);
// columns etc. are inline props and would otherwise re-render the table on every parent render
export const AutoGenerateRemoteTable = memo(AutoGenerateRemoteTableComp, (prev, next) => prev.useFetcher === next.useFetcher) as typeof AutoGenerateRemoteTableComp;
