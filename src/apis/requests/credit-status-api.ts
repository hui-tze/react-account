import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {CreditStatus} from "@/apis/models/credit-status";
import {PaginationResponse} from "@/apis/pagination";

export type CreditStatusRequest = Omit<CreditStatus, "id" | "company_id">

// listing table — always sends `page`, so the backend paginates
export function useGetAllCreditStatus(params: URLSearchParams): SWRResponse<PaginationResponse<CreditStatus>> {
    return useConsoleSwr(`/credit-status?${params}`, authFetcher);
}

// dropdowns — no `page`, so the backend returns every row
export function useGetCreditStatusOptions(): SWRResponse<CreditStatus[]> {
    return useConsoleSwr("/credit-status", authFetcher);
}

export function useGetOneCreditStatus(id: number | string, config?: SWRConfiguration): SWRResponse<CreditStatus> {
    return useConsoleSwr(`/credit-status/${id}`, authFetcher, config);
}

export function addCreditStatus(data: CreditStatusRequest): Promise<CreditStatus> {
    return authApiRequest("/credit-status").add(data).post();
}

export function updateCreditStatus(id: number | string, data: CreditStatusRequest): Promise<CreditStatus> {
    return authApiRequest(`/credit-status/${id}`).add(data).put();
}

export function deleteCreditStatus(id: number | string): Promise<void> {
    return authApiRequest(`/credit-status/${id}`).delete();
}
