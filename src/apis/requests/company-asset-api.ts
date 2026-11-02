import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {PaginationResponse} from "../pagination";
import {CompanyAsset} from "../models/company-asset";
import {Attachment} from "../models/attachment";
import {CompanyAssetConditionMonitor} from "./my-company-asset-api";

export type CompanyAssetRequest = Omit<CompanyAsset, 'id'|'branch_id'|'type'> & {
    assignee_ids: number[],
    attachments: Omit<Attachment, 'temp_url'>[],
    temp: File[],
}
export type CompanyAssetAttachment = Attachment & {
    id: number,
}
export type CompanyAssetDetails = CompanyAsset & {
    assignees: {
        id: number,
        comp_asset_id: number,
        staff_id: number
    }[],
    attachments: CompanyAssetAttachment[]
}
export type CompanyAssetConditionDetails = CompanyAsset & {
    cond_mons: CompanyAssetConditionMonitor[]
}

export function useGetAllCompanyAsset(params: URLSearchParams): SWRResponse<PaginationResponse<CompanyAsset>> {
    return useConsoleSwr(`/comp-assets?${params}`, authFetcher);
}

export function useGetOneCompanyAsset(id: number|string, config?: SWRConfiguration): SWRResponse<CompanyAssetDetails> {
    return useConsoleSwr(`/comp-assets/${id}`, authFetcher, config);
}

export function useGetCompanyAssetOptions(branchId: number|string): SWRResponse<CompanyAsset[]> {
    return useConsoleSwr(`/comp-assets/options?branch_id=${branchId}`, authFetcher);
}

export function addCompanyAsset(data: CompanyAssetRequest): Promise<void> {
    return authApiRequest("/comp-assets").add(data).post();
}

export function updateCompanyAsset(id: number|string, data: CompanyAssetRequest): Promise<CompanyAsset> {
    return authApiRequest(`/comp-assets/${id}`).add(data).put();
}

export function deleteCompanyAsset(id: number|string): Promise<[]> {
    return authApiRequest(`/comp-assets/${id}`).delete();
}

export function useGetAllCompanyAssetCondition(params: URLSearchParams): SWRResponse<PaginationResponse<CompanyAssetConditionDetails>> {
    return useConsoleSwr(`/comp-assets/cond-mons/filter?${params}`, authFetcher);
}
