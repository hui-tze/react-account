import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {InventoryDocument} from "@/apis/models/inventory-document";
import {PaginationResponse} from "@/apis/pagination";
import {LocationTransferRequest} from "@/apis/requests/inventory-document-request";

// listing table — always sends `page`, so the backend paginates
export function useGetAllLocationTransfer(params: URLSearchParams): SWRResponse<PaginationResponse<InventoryDocument>> {
    return useConsoleSwr(`/location-transfer?${params}`, authFetcher);
}

export function useGetOneLocationTransfer(id: number | string, config?: SWRConfiguration): SWRResponse<InventoryDocument> {
    return useConsoleSwr(`/location-transfer/${id}`, authFetcher, config);
}

export function addLocationTransfer(data: LocationTransferRequest): Promise<InventoryDocument> {
    return authApiRequest("/location-transfer").add(data).post();
}

export function updateLocationTransfer(id: number | string, data: LocationTransferRequest): Promise<InventoryDocument> {
    return authApiRequest(`/location-transfer/${id}`).add(data).put();
}

// voids the document and its stock movements
export function voidLocationTransfer(id: number | string): Promise<void> {
    return authApiRequest(`/location-transfer/${id}`).delete();
}
