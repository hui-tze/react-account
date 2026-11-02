import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {Uom} from "@/apis/models/uom";
import {PaginationResponse} from "@/apis/pagination";

export type UomRequest = Omit<Uom, "id" | "company_id">

// listing table — always sends `page`, so the backend paginates
export function useGetAllUom(params: URLSearchParams): SWRResponse<PaginationResponse<Uom>> {
    return useConsoleSwr(`/uom?${params}`, authFetcher);
}

// dropdowns — no `page`, so the backend returns every row
export function useGetUomOptions(): SWRResponse<Uom[]> {
    return useConsoleSwr("/uom", authFetcher);
}

export function useGetOneUom(id: number | string, config?: SWRConfiguration): SWRResponse<Uom> {
    return useConsoleSwr(`/uom/${id}`, authFetcher, config);
}

export function addUom(data: UomRequest): Promise<Uom> {
    return authApiRequest("/uom").add(data).post();
}

export function updateUom(id: number | string, data: UomRequest): Promise<Uom> {
    return authApiRequest(`/uom/${id}`).add(data).put();
}

export function deleteUom(id: number | string): Promise<void> {
    return authApiRequest(`/uom/${id}`).delete();
}
