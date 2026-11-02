import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {PaginationResponse} from "../pagination";
import {CompanyAsset} from "../models/company-asset";
import {Attachment} from "../models/attachment";
import {CompanyAssetDetails} from "./company-asset-api";

export type CompanyAssetConditionMonitorRequest = {
    remark: string|null,
    attachments: Omit<Attachment, 'temp_url'>[],
    comp_asset_id: number,
    temp: File[],
}
export type CompanyAssetConditionMonitorAttachment = Attachment & {
    id: number,
}
export type CompanyAssetConditionMonitor = {
    id: number,
    comp_asset_id: number,
    staff_id: number,
    remark: string|null,
    created_at: string
    attachments: CompanyAssetConditionMonitorAttachment[]
}

export function useGetAllMyCompanyAsset(params: URLSearchParams): SWRResponse<PaginationResponse<CompanyAsset>> {
    return useConsoleSwr(`/comp-assets/me?${params}`, authFetcher);
}

export function useGetOneMyCompanyAsset(id: number|string, config?: SWRConfiguration): SWRResponse<CompanyAssetDetails> {
    return useConsoleSwr(`/comp-assets/me/${id}`, authFetcher, config);
}

export function useGetAllMyCompanyAssetConditionMonitor(id: string, params: URLSearchParams): SWRResponse<PaginationResponse<CompanyAssetConditionMonitor>> {
    return useConsoleSwr(`/comp-assets/me/${id}/cond-mons?${params}`, authFetcher);
}

export function useGetOneMyCompanyAssetConditionMonitor(id: number|string, config?: SWRConfiguration): SWRResponse<CompanyAssetConditionMonitor> {
    return useConsoleSwr(`/comp-asset-cond-mons/me/${id}`, authFetcher, config);
}

export function addCompanyAssetConditionMonitor(id: string, data: CompanyAssetConditionMonitorRequest): Promise<void> {
    return authApiRequest(`/comp-assets/me/${id}/add-cond-mon`).add(data).post();
}

export function updateCompanyAssetConditionMonitor(id: number|string, data: CompanyAssetConditionMonitorRequest): Promise<CompanyAsset> {
    return authApiRequest(`/comp-asset-cond-mons/me/${id}`).add(data).put();
}
