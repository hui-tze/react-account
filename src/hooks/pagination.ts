import {useSearchParams} from "react-router-dom";
import qs from "qs";
import {useCallback, useState} from "react";
import {QueryFilter} from "@/lib/query-filter/filter";

export type UsePaginationState = {
    page: number,
    params: URLSearchParams,
    setPage: (page: number) => void,
    setFilter: (callback: (q: QueryFilter) => boolean) => () => void
}

export type PaginationStateProvider = () => UsePaginationState;

type UsePaginationSearchParam = {
    set: (nextInit: (prev: URLSearchParams) => URLSearchParams) => void,
    currentPage: string|number|undefined
}

function usePaginationSearchParam({set, currentPage}: UsePaginationSearchParam) {
    const setFilter = useCallback((callback: (q: QueryFilter) => boolean) => {
        return () => {
            const queryFilter = new QueryFilter();
            const resetPage = callback(queryFilter);
            const page = currentPage ? currentPage : 1;
            set(
                () => {
                    return new URLSearchParams(qs.stringify({
                        page: resetPage ? 1 : page,
                        ...Object.fromEntries(queryFilter.getFilter())
                    }));
                }
            );
        };
    }, [currentPage]);

    const setPage = useCallback((page: number) => {
        set(
            (prevParams) => {
                prevParams.set('page', page.toString());
                return new URLSearchParams(prevParams);
            }
        );
    }, [set]);

    return {
        setFilter,
        setPage,
    };
}

export function useAddressPagination(): UsePaginationState {
    const [params, setParams] = useSearchParams();
    const page = params.get("page") ?? 1;
    const {setFilter, setPage} = usePaginationSearchParam({
        set: setParams,
        currentPage: page
    });

    return {
        page: +page,
        params: params,
        setPage,
        setFilter
    };
}

export function useStatePagination(): UsePaginationState {
    const [searchParams, setSearchParam] = useState(
        new URLSearchParams(qs.stringify({
            page: 1
        }))
    );
    const page = searchParams.get("page") ?? "1";
    const {setFilter, setPage} = usePaginationSearchParam({
        set: setSearchParam,
        currentPage: page
    });

    return {
        page: +page,
        params: searchParams,
        setPage,
        setFilter
    };
}
