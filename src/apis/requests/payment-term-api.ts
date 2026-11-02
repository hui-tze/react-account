import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {PaymentTerm} from "@/apis/models/payment-term";
import {PaginationResponse} from "@/apis/pagination";

export type PaymentTermRequest = Omit<PaymentTerm, "id" | "company_id">

// listing table — always sends `page`, so the backend paginates
export function useGetAllPaymentTerm(params: URLSearchParams): SWRResponse<PaginationResponse<PaymentTerm>> {
    return useConsoleSwr(`/payment-term?${params}`, authFetcher);
}

// dropdowns — no `page`, so the backend returns every row
export function useGetPaymentTermOptions(): SWRResponse<PaymentTerm[]> {
    return useConsoleSwr("/payment-term", authFetcher);
}

export function useGetOnePaymentTerm(id: number | string, config?: SWRConfiguration): SWRResponse<PaymentTerm> {
    return useConsoleSwr(`/payment-term/${id}`, authFetcher, config);
}

export function addPaymentTerm(data: PaymentTermRequest): Promise<PaymentTerm> {
    return authApiRequest("/payment-term").add(data).post();
}

export function updatePaymentTerm(id: number | string, data: PaymentTermRequest): Promise<PaymentTerm> {
    return authApiRequest(`/payment-term/${id}`).add(data).put();
}

export function deletePaymentTerm(id: number | string): Promise<void> {
    return authApiRequest(`/payment-term/${id}`).delete();
}
