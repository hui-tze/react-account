import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {InventoryLocation} from "@/apis/models/inventory-location";
import {PaginationResponse} from "@/apis/pagination";

export type InventoryLocationRequest = Omit<InventoryLocation, "id" | "company_id">

// listing table — always sends `page`, so the backend paginates
export function useGetAllInventoryLocation(params: URLSearchParams): SWRResponse<PaginationResponse<InventoryLocation>> {
    return useConsoleSwr(`/inventory-location?${params}`, authFetcher);
}

// dropdowns — no `page`, so the backend returns every row
export function useGetInventoryLocationOptions(): SWRResponse<InventoryLocation[]> {
    return useConsoleSwr("/inventory-location", authFetcher);
}

export function useGetOneInventoryLocation(id: number | string, config?: SWRConfiguration): SWRResponse<InventoryLocation> {
    return useConsoleSwr(`/inventory-location/${id}`, authFetcher, config);
}

export function addInventoryLocation(data: InventoryLocationRequest): Promise<InventoryLocation> {
    return authApiRequest("/inventory-location").add(data).post();
}

export function updateInventoryLocation(id: number | string, data: InventoryLocationRequest): Promise<InventoryLocation> {
    return authApiRequest(`/inventory-location/${id}`).add(data).put();
}

export function deleteInventoryLocation(id: number | string): Promise<void> {
    return authApiRequest(`/inventory-location/${id}`).delete();
}
