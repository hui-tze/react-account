import {authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {InventoryMovement, StockCard} from "@/apis/models/inventory-movement";
import {PaginationResponse} from "@/apis/pagination";

// the stock ledger is read-only — movements are posted by their source documents

// listing table — always sends `page`, so the backend paginates
export function useGetAllInventoryMovement(params: URLSearchParams): SWRResponse<PaginationResponse<InventoryMovement>> {
    return useConsoleSwr(`/inventory-movement?${params}`, authFetcher);
}

export function useGetOneInventoryMovement(id: number | string, config?: SWRConfiguration): SWRResponse<InventoryMovement> {
    return useConsoleSwr(`/inventory-movement/${id}`, authFetcher, config);
}

/** On-hand quantity per item id at a location (no request until a location is picked). */
export function useGetStockOnHand(locationId?: number | null): SWRResponse<Record<string, number>> {
    return useConsoleSwr(locationId ? `/inventory-movement/stock-on-hand?inventory_location_id=${locationId}` : null, authFetcher);
}

/** Opening / in / out / closing for one item (no request until an item is picked). */
export function useGetStockCard(params: URLSearchParams | null): SWRResponse<StockCard> {
    return useConsoleSwr(params ? `/inventory-movement/stock-card?${params}` : null, authFetcher);
}
