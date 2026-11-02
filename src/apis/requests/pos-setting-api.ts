import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {PosSetting} from "@/apis/models/pos-setting";
import {PaginationResponse} from "@/apis/pagination";

export type PosSettingRequest = Omit<PosSetting, "id" | "company_id">

// listing table — always sends `page`, so the backend paginates
export function useGetAllPosSetting(params: URLSearchParams): SWRResponse<PaginationResponse<PosSetting>> {
    return useConsoleSwr(`/pos-setting?${params}`, authFetcher);
}

// dropdowns — no `page`, so the backend returns every row
export function useGetPosSettingOptions(): SWRResponse<PosSetting[]> {
    return useConsoleSwr("/pos-setting", authFetcher);
}

export function useGetOnePosSetting(id: number | string, config?: SWRConfiguration): SWRResponse<PosSetting> {
    return useConsoleSwr(`/pos-setting/${id}`, authFetcher, config);
}

export function addPosSetting(data: PosSettingRequest): Promise<PosSetting> {
    return authApiRequest("/pos-setting").add(data).post();
}

export function updatePosSetting(id: number | string, data: PosSettingRequest): Promise<PosSetting> {
    return authApiRequest(`/pos-setting/${id}`).add(data).put();
}

export function deletePosSetting(id: number | string): Promise<void> {
    return authApiRequest(`/pos-setting/${id}`).delete();
}
