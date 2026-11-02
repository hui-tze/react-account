import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {TaxGroup} from "@/apis/models/tax-group";
import {PaginationResponse} from "@/apis/pagination";

export type TaxGroupItemRequest = {
    tax_type_id: number | null,
    apply_to_shipping: boolean,
    sequence: number | null,
    is_compound: boolean,
}

export type TaxGroupRequest = {
    name: string,
    status: string,
    tax_types: TaxGroupItemRequest[],
}

// listing table — always sends `page`, so the backend paginates
export function useGetAllTaxGroup(params: URLSearchParams): SWRResponse<PaginationResponse<TaxGroup>> {
    return useConsoleSwr(`/tax-group?${params}`, authFetcher);
}

// dropdowns — no `page`, so the backend returns every row
export function useGetTaxGroupOptions(): SWRResponse<TaxGroup[]> {
    return useConsoleSwr("/tax-group", authFetcher);
}

export function useGetOneTaxGroup(id: number | string, config?: SWRConfiguration): SWRResponse<TaxGroup> {
    return useConsoleSwr(`/tax-group/${id}`, authFetcher, config);
}

export function addTaxGroup(data: TaxGroupRequest): Promise<TaxGroup> {
    return authApiRequest("/tax-group").add(data).post();
}

export function updateTaxGroup(id: number | string, data: TaxGroupRequest): Promise<TaxGroup> {
    return authApiRequest(`/tax-group/${id}`).add(data).put();
}

export function deleteTaxGroup(id: number | string): Promise<void> {
    return authApiRequest(`/tax-group/${id}`).delete();
}
