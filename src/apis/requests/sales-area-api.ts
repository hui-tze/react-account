import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {SalesArea} from "@/apis/models/sales-area";
import {PaginationResponse} from "@/apis/pagination";

export type SalesAreaRequest = Omit<SalesArea, "id" | "company_id">

// listing table — always sends `page`, so the backend paginates
export function useGetAllSalesArea(params: URLSearchParams): SWRResponse<PaginationResponse<SalesArea>> {
    return useConsoleSwr(`/sales-area?${params}`, authFetcher);
}

// dropdowns — no `page`, so the backend returns every row
export function useGetSalesAreaOptions(): SWRResponse<SalesArea[]> {
    return useConsoleSwr("/sales-area", authFetcher);
}

export function useGetOneSalesArea(id: number | string, config?: SWRConfiguration): SWRResponse<SalesArea> {
    return useConsoleSwr(`/sales-area/${id}`, authFetcher, config);
}

export function addSalesArea(data: SalesAreaRequest): Promise<SalesArea> {
    return authApiRequest("/sales-area").add(data).post();
}

export function updateSalesArea(id: number | string, data: SalesAreaRequest): Promise<SalesArea> {
    return authApiRequest(`/sales-area/${id}`).add(data).put();
}

export function deleteSalesArea(id: number | string): Promise<void> {
    return authApiRequest(`/sales-area/${id}`).delete();
}
