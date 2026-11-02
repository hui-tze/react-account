import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {InventoryDocument} from "@/apis/models/inventory-document";
import {PaginationResponse} from "@/apis/pagination";
import {InventoryAdjustmentRequest} from "@/apis/requests/inventory-document-request";

// listing table — always sends `page`, so the backend paginates
export function useGetAllInventoryAdjustment(params: URLSearchParams): SWRResponse<PaginationResponse<InventoryDocument>> {
    return useConsoleSwr(`/inventory-adjustment?${params}`, authFetcher);
}

export function useGetOneInventoryAdjustment(id: number | string, config?: SWRConfiguration): SWRResponse<InventoryDocument> {
    return useConsoleSwr(`/inventory-adjustment/${id}`, authFetcher, config);
}

export function addInventoryAdjustment(data: InventoryAdjustmentRequest): Promise<InventoryDocument> {
    return authApiRequest("/inventory-adjustment").add(data).post();
}

export function updateInventoryAdjustment(id: number | string, data: InventoryAdjustmentRequest): Promise<InventoryDocument> {
    return authApiRequest(`/inventory-adjustment/${id}`).add(data).put();
}

// voids the document and its stock movements
export function voidInventoryAdjustment(id: number | string): Promise<void> {
    return authApiRequest(`/inventory-adjustment/${id}`).delete();
}
