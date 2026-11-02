import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {ClaimApplication, ClaimApplicationDetails} from "../models/claim-application";
import {PaginationResponse} from "../pagination";

export type ApproveClaimRequest = {
    reimbursable_amount: string,
    comment?: string,
}
export type ReturnRejectClaimRequest = {
    comment?: string,
}

export function useGetAllClaimApplication(params: URLSearchParams): SWRResponse<PaginationResponse<ClaimApplication>> {
    return useConsoleSwr(`/claim-applications?${params}`, authFetcher);
}

export function useGetOneClaimApplication(id: number|string, config?: SWRConfiguration): SWRResponse<ClaimApplicationDetails> {
    return useConsoleSwr(`/claim-applications/${id}`, authFetcher, config);
}

export function useApproveClaimApplication(id: string, data: ApproveClaimRequest): Promise<void> {
    return authApiRequest(`/claim-applications/${id}/approve`).add(data).post();
}

export function useReturnClaimApplication(id: string, data: ReturnRejectClaimRequest): Promise<void> {
    return authApiRequest(`/claim-applications/${id}/return`).add(data).post();
}

export function useRejectClaimApplication(id: string, data: ReturnRejectClaimRequest): Promise<void> {
    return authApiRequest(`/claim-applications/${id}/reject`).add(data).post();
}