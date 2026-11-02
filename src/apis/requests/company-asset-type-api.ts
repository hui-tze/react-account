import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {PaginationResponse} from "../pagination";
import {CompanyAssetType} from "../models/company-asset";
import {SelectOptionProps} from "../models/common";

export type CompanyAssetTypeRequest = Omit<CompanyAssetType, 'id'|'branch_id'>

export function useGetAllCompanyAssetType(params: URLSearchParams): SWRResponse<PaginationResponse<CompanyAssetType>> {
    return useConsoleSwr(`/comp-asset-types?${params}`, authFetcher);
}

export function useGetOneCompanyAssetType(id: number|string, config?: SWRConfiguration): SWRResponse<CompanyAssetType> {
    return useConsoleSwr(`/comp-asset-types/${id}`, authFetcher, config);
}

export function useGetCompanyAssetTypeOptions(): SWRResponse<SelectOptionProps[]> {
    return useConsoleSwr(`/comp-asset-types/options`, authFetcher);
}

export function addCompanyAssetType(data: CompanyAssetTypeRequest): Promise<void> {
    return authApiRequest("/comp-asset-types").add(data).post();
}

export function updateCompanyAssetType(id: number|string, data: CompanyAssetTypeRequest): Promise<CompanyAssetType> {
    return authApiRequest(`/comp-asset-types/${id}`).add(data).put();
}

export function deleteCompanyAssetType(id: number|string): Promise<[]> {
    return authApiRequest(`/comp-asset-types/${id}`).delete();
}
