import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {ItemTaxCategory} from "@/apis/models/item-tax-category";
import {PaginationResponse} from "@/apis/pagination";

export type ItemTaxCategoryRequest = {
    name: string,
    tax_exempt: boolean,
    status: string,
    exempt_tax_type_ids: number[],
}

// listing table — always sends `page`, so the backend paginates
export function useGetAllItemTaxCategory(params: URLSearchParams): SWRResponse<PaginationResponse<ItemTaxCategory>> {
    return useConsoleSwr(`/item-tax-category?${params}`, authFetcher);
}

// dropdowns — no `page`, so the backend returns every row
export function useGetItemTaxCategoryOptions(): SWRResponse<ItemTaxCategory[]> {
    return useConsoleSwr("/item-tax-category", authFetcher);
}

export function useGetOneItemTaxCategory(id: number | string, config?: SWRConfiguration): SWRResponse<ItemTaxCategory> {
    return useConsoleSwr(`/item-tax-category/${id}`, authFetcher, config);
}

export function addItemTaxCategory(data: ItemTaxCategoryRequest): Promise<ItemTaxCategory> {
    return authApiRequest("/item-tax-category").add(data).post();
}

export function updateItemTaxCategory(id: number | string, data: ItemTaxCategoryRequest): Promise<ItemTaxCategory> {
    return authApiRequest(`/item-tax-category/${id}`).add(data).put();
}

export function deleteItemTaxCategory(id: number | string): Promise<void> {
    return authApiRequest(`/item-tax-category/${id}`).delete();
}
