import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {SalesType} from "@/apis/models/sales-type";
import {PaginationResponse} from "@/apis/pagination";

export type SalesTypeRequest = Omit<SalesType, "id" | "company_id" | "calculation_factor"> & {calculation_factor: number}

// listing table — always sends `page`, so the backend paginates
export function useGetAllSalesType(params: URLSearchParams): SWRResponse<PaginationResponse<SalesType>> {
    return useConsoleSwr(`/sales-type?${params}`, authFetcher);
}

// dropdowns — no `page`, so the backend returns every row
export function useGetSalesTypeOptions(): SWRResponse<SalesType[]> {
    return useConsoleSwr("/sales-type", authFetcher);
}

export function useGetOneSalesType(id: number | string, config?: SWRConfiguration): SWRResponse<SalesType> {
    return useConsoleSwr(`/sales-type/${id}`, authFetcher, config);
}

export function addSalesType(data: SalesTypeRequest): Promise<SalesType> {
    return authApiRequest("/sales-type").add(data).post();
}

export function updateSalesType(id: number | string, data: SalesTypeRequest): Promise<SalesType> {
    return authApiRequest(`/sales-type/${id}`).add(data).put();
}

export function deleteSalesType(id: number | string): Promise<void> {
    return authApiRequest(`/sales-type/${id}`).delete();
}
