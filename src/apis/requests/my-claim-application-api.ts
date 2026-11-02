import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {Attachment} from "../models/attachment";
import {ClaimApplication, ClaimApplicationDetails, ClaimApplicationWorkflowInfo} from "../models/claim-application";
import {PaginationResponse} from "../pagination";
import {ClaimStatus} from "@/constants/ClaimApplicationStatus";

export type DynFieldRequest = {
    uid: string,
    value: string,
}
export type ApplyClaimRequest = {
    action: string,
    claim_id: number,
    claim_sub_category: string,
    title: string,
    receipt_no: string,
    receipt_date: string,
    receipt_amount: string,
    reimbursement_amount: string,
    remarks: string,
    dyn_fields: DynFieldRequest[],
    sub_dyn_fields: DynFieldRequest[],
    attachments: Omit<Attachment, 'temp_url'>[],
    temp: File[],
};
export type CancelClaimRequest = {
    comment?: string,
}
export type MyClaimApplication = Omit<ClaimApplication, 'staff'>;
export type ClaimSummary = {
    count: number,
    total_reimbursable_amount: string|number
};
export type MyClaimApplicationOverview = Record<ClaimStatus, ClaimSummary>;
export type PendingMyActionClaim = ClaimApplication & {
    workflow: ClaimApplicationWorkflowInfo,
}

export function useDraftMyClaimApplication(data: ApplyClaimRequest): Promise<void> {
    return authApiRequest(`/claim-applications/me/draft`).add(data).post();
}

export function useCreateMyClaimApplication(data: ApplyClaimRequest): Promise<void> {
    return authApiRequest(`/claim-applications/me/create`).add(data).post();
}

export function useCancelMyClaimApplication(id: number|string, data: CancelClaimRequest): Promise<void> {
    return authApiRequest(`/claim-applications/me/${id}/cancel`).add(data).put();
}

export function useEditMyDraftClaimApplication(id: number|string, data: ApplyClaimRequest): Promise<MyClaimApplication> {
    return authApiRequest(`/claim-applications/me/${id}/edit`).add(data).put();
}

export function useRemoveMyDraftClaimApplication(id: number|string): Promise<void> {
    return authApiRequest(`/claim-applications/me/${id}/remove`).delete();
}

export function useSubmitMyDraftClaimApplication(id: number|string): Promise<void> {
    return authApiRequest(`/claim-applications/me/${id}/submit`).post();
}

export function useResubmitMyDraftClaimApplication(id: number|string): Promise<void> {
    return authApiRequest(`/claim-applications/me/${id}/resubmit`).post();
}

export function useGetAllMyClaimApplication(params: URLSearchParams): SWRResponse<PaginationResponse<MyClaimApplication>> {
    return useConsoleSwr(`/claim-applications/me?${params}`, authFetcher);
}

export function useGetOneMyClaimApplication(id: number|string, config?: SWRConfiguration): SWRResponse<ClaimApplicationDetails> {
    return useConsoleSwr(`/claim-applications/me/${id}`, authFetcher, config);
}

export function useGetMyClaimApplicationOverview(params?: URLSearchParams) {
    return useConsoleSwr<MyClaimApplicationOverview>(`/claim-applications/me/overview?${params}`, authFetcher);
}

export function useGetRequiredMyActionClaimApplication(params?: URLSearchParams): SWRResponse<PendingMyActionClaim[]> {
    return useConsoleSwr(`/claim-applications/required-my-action`, authFetcher);
}