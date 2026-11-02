import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {ItemPurchasePrice} from "@/apis/models/item-purchase-price";
import {PaginationResponse} from "@/apis/pagination";

type DecimalField = "conversion_factor" | "price" | "minimum_quantity";

export type ItemPurchasePriceRequest = Omit<ItemPurchasePrice, "id" | DecimalField | "item" | "supplier" | "supplier_uom"> & Record<DecimalField, number>

// listing table — always sends `page`, so the backend paginates
export function useGetAllItemPurchasePrice(params: URLSearchParams): SWRResponse<PaginationResponse<ItemPurchasePrice>> {
    return useConsoleSwr(`/item-purchase-price?${params}`, authFetcher);
}

export function useGetOneItemPurchasePrice(id: number | string, config?: SWRConfiguration): SWRResponse<ItemPurchasePrice> {
    return useConsoleSwr(`/item-purchase-price/${id}`, authFetcher, config);
}

export function addItemPurchasePrice(data: ItemPurchasePriceRequest): Promise<ItemPurchasePrice> {
    return authApiRequest("/item-purchase-price").add(data).post();
}

export function updateItemPurchasePrice(id: number | string, data: ItemPurchasePriceRequest): Promise<ItemPurchasePrice> {
    return authApiRequest(`/item-purchase-price/${id}`).add(data).put();
}

export function deleteItemPurchasePrice(id: number | string): Promise<void> {
    return authApiRequest(`/item-purchase-price/${id}`).delete();
}
