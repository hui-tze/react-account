import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {SalesGroup} from "@/apis/models/sales-group";
import {PaginationResponse} from "@/apis/pagination";

export type SalesGroupRequest = Omit<SalesGroup, "id" | "company_id">

// listing table — always sends `page`, so the backend paginates
export function useGetAllSalesGroup(params: URLSearchParams): SWRResponse<PaginationResponse<SalesGroup>> {
    return useConsoleSwr(`/sales-group?${params}`, authFetcher);
}

// dropdowns — no `page`, so the backend returns every row
export function useGetSalesGroupOptions(): SWRResponse<SalesGroup[]> {
    return useConsoleSwr("/sales-group", authFetcher);
}

export function useGetOneSalesGroup(id: number | string, config?: SWRConfiguration): SWRResponse<SalesGroup> {
    return useConsoleSwr(`/sales-group/${id}`, authFetcher, config);
}

export function addSalesGroup(data: SalesGroupRequest): Promise<SalesGroup> {
    return authApiRequest("/sales-group").add(data).post();
}

export function updateSalesGroup(id: number | string, data: SalesGroupRequest): Promise<SalesGroup> {
    return authApiRequest(`/sales-group/${id}`).add(data).put();
}

export function deleteSalesGroup(id: number | string): Promise<void> {
    return authApiRequest(`/sales-group/${id}`).delete();
}
