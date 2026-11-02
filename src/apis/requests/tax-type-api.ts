import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {TaxType} from "@/apis/models/tax-type";
import {PaginationResponse} from "@/apis/pagination";

export type TaxTypeRequest = Omit<TaxType, "id" | "company_id" | "rate"> & {
    rate: number | null,
}

// listing table — always sends `page`, so the backend paginates
export function useGetAllTaxType(params: URLSearchParams): SWRResponse<PaginationResponse<TaxType>> {
    return useConsoleSwr(`/tax-type?${params}`, authFetcher);
}

// dropdowns — no `page`, so the backend returns every row
export function useGetTaxTypeOptions(): SWRResponse<TaxType[]> {
    return useConsoleSwr("/tax-type", authFetcher);
}

export function useGetOneTaxType(id: number | string, config?: SWRConfiguration): SWRResponse<TaxType> {
    return useConsoleSwr(`/tax-type/${id}`, authFetcher, config);
}

export function addTaxType(data: TaxTypeRequest): Promise<TaxType> {
    return authApiRequest("/tax-type").add(data).post();
}

export function updateTaxType(id: number | string, data: TaxTypeRequest): Promise<TaxType> {
    return authApiRequest(`/tax-type/${id}`).add(data).put();
}

export function deleteTaxType(id: number | string): Promise<void> {
    return authApiRequest(`/tax-type/${id}`).delete();
}
