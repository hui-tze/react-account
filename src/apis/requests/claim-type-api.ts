import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {PaginationResponse} from "../pagination";
import {ClaimType, DynamicField} from "../models/claim-type";
import {TargetAudienceType} from "@/constants/TargetAudienceType";
import {ClaimCategoryDetails} from "./claim-category-api";

export type ClaimTypeRequest = Omit<ClaimType, 'id'|'branch_id'|'current_dyn_form_uid'|'category'> & {
    claim_category_id: number,
    scopes: {
        type: TargetAudienceType,
        value: string[],
    }[],
}
export type ClaimTypeDetails = Omit<ClaimType, 'category'> & {
    category: ClaimCategoryDetails,
    applied_scopes: {
        id: number,
        claim_id: number,
        type: TargetAudienceType,
        value: string[],
    }[],
}
export type MyClaimType = ClaimType & {
    monthly_consumption: string,
    yearly_consumption: string,
}

export function useGetAllClaimType(params: URLSearchParams): SWRResponse<PaginationResponse<ClaimType>> {
    return useConsoleSwr(`/claims?${params}`, authFetcher);
}

export function useGetOneClaimType(id: number|string, config?: SWRConfiguration): SWRResponse<ClaimTypeDetails> {
    return useConsoleSwr(`/claims/${id}`, authFetcher, config);
}

export function createClaimType(data: ClaimTypeRequest): Promise<void> {
    return authApiRequest("/claims").add(data).post();
}

export function updateClaimType(id: number|string, data: ClaimTypeRequest): Promise<ClaimTypeDetails> {
    return authApiRequest(`/claims/${id}`).add(data).put();
}

export function deleteClaimType(id: number|string): Promise<[]> {
    return authApiRequest(`/claims/${id}`).delete();
}

export function useGetAllMyClaimType(params?: URLSearchParams): SWRResponse<MyClaimType[]> {
    return useConsoleSwr(`/claims/me?${params}`, authFetcher);
}

export function useGetOneMyClaimType(id: number|string, config?: SWRConfiguration): SWRResponse<ClaimTypeDetails> {
    return useConsoleSwr(`/claims/me/${id}`, authFetcher, config);
}
