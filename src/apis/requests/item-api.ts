import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {Item} from "@/apis/models/item";
import {PaginationResponse} from "@/apis/pagination";

type CostField = "purchase_cost" | "material_cost" | "labour_cost" | "overhead_cost";

export type ItemRequest = Omit<Item, "id" | "company_id" | CostField>
export type ItemStandardCostRequest = Record<CostField, number>

// listing table — always sends `page`, so the backend paginates
export function useGetAllItem(params: URLSearchParams): SWRResponse<PaginationResponse<Item>> {
    return useConsoleSwr(`/item?${params}`, authFetcher);
}

// dropdowns — no `page`, so the backend returns every row
export function useGetItemOptions(): SWRResponse<Item[]> {
    return useConsoleSwr("/item", authFetcher);
}

export function useGetOneItem(id: number | string, config?: SWRConfiguration): SWRResponse<Item> {
    return useConsoleSwr(`/item/${id}`, authFetcher, config);
}

export function addItem(data: ItemRequest): Promise<Item> {
    return authApiRequest("/item").add(data).post();
}

export function updateItem(id: number | string, data: ItemRequest): Promise<Item> {
    return authApiRequest(`/item/${id}`).add(data).put();
}

export function updateItemStandardCost(id: number | string, data: ItemStandardCostRequest): Promise<Item> {
    return authApiRequest(`/item/${id}/standard-cost`).add(data).put();
}

export function deleteItem(id: number | string): Promise<void> {
    return authApiRequest(`/item/${id}`).delete();
}
