import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {ItemSalePrice} from "@/apis/models/item-sale-price";
import {PaginationResponse} from "@/apis/pagination";

export type ItemSalePriceRequest = Omit<ItemSalePrice, "id" | "price" | "item" | "sales_type" | "currency"> & {price: number}

// listing table — always sends `page`, so the backend paginates
export function useGetAllItemSalePrice(params: URLSearchParams): SWRResponse<PaginationResponse<ItemSalePrice>> {
    return useConsoleSwr(`/item-sale-price?${params}`, authFetcher);
}

export function useGetOneItemSalePrice(id: number | string, config?: SWRConfiguration): SWRResponse<ItemSalePrice> {
    return useConsoleSwr(`/item-sale-price/${id}`, authFetcher, config);
}

export function addItemSalePrice(data: ItemSalePriceRequest): Promise<ItemSalePrice> {
    return authApiRequest("/item-sale-price").add(data).post();
}

export function updateItemSalePrice(id: number | string, data: ItemSalePriceRequest): Promise<ItemSalePrice> {
    return authApiRequest(`/item-sale-price/${id}`).add(data).put();
}

export function deleteItemSalePrice(id: number | string): Promise<void> {
    return authApiRequest(`/item-sale-price/${id}`).delete();
}
