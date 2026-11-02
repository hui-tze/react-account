import {type Designation} from "@/apis/models/designation";
import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {PaginationResponse} from "../pagination";

export type AddDesignation = Omit<Designation, 'id' | 'old_id' | 'created_at' | 'updated_at'>

export type UpdateDesignation = Partial<AddDesignation>;

export function useGetAllDesignation(params: URLSearchParams): SWRResponse<PaginationResponse<Designation>> {
    return useConsoleSwr(`/designations?${params}`, authFetcher);
}

export function useGetOneDesignation(id: number|string, config?: SWRConfiguration): SWRResponse<Designation> {
    return useConsoleSwr(`/designations/${id}`, authFetcher, config);
}

export function useGetDesignationOptions(branchId: number|string): SWRResponse<Designation[]> {
    return useConsoleSwr(`/designations/options?branch_id=${branchId}`, authFetcher);
}

export function addDesignation(data: AddDesignation): Promise<void> {
    return authApiRequest("/designations").add(data).post();
}

export function updateDesignation(id: number|string, data: UpdateDesignation): Promise<Designation> {
    return authApiRequest(`/designations/${id}`).add(data).put();
}
