import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {ItemCategory} from "@/apis/models/item-category";
import {PaginationResponse} from "@/apis/pagination";

export type ItemCategoryRequest = Omit<ItemCategory, "id" | "company_id">

// listing table — always sends `page`, so the backend paginates
export function useGetAllItemCategory(params: URLSearchParams): SWRResponse<PaginationResponse<ItemCategory>> {
    return useConsoleSwr(`/item-category?${params}`, authFetcher);
}

// dropdowns — no `page`, so the backend returns every row
export function useGetItemCategoryOptions(): SWRResponse<ItemCategory[]> {
    return useConsoleSwr("/item-category", authFetcher);
}

export function useGetOneItemCategory(id: number | string, config?: SWRConfiguration): SWRResponse<ItemCategory> {
    return useConsoleSwr(`/item-category/${id}`, authFetcher, config);
}

export function addItemCategory(data: ItemCategoryRequest): Promise<ItemCategory> {
    return authApiRequest("/item-category").add(data).post();
}

export function updateItemCategory(id: number | string, data: ItemCategoryRequest): Promise<ItemCategory> {
    return authApiRequest(`/item-category/${id}`).add(data).put();
}

export function deleteItemCategory(id: number | string): Promise<void> {
    return authApiRequest(`/item-category/${id}`).delete();
}
