import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {BankAccount} from "@/apis/models/bank-account";
import {PaginationResponse} from "@/apis/pagination";

export type BankAccountRequest = Omit<BankAccount, "id" | "company_id" | "last_reconciled_at">

// listing table — always sends `page`, so the backend paginates
export function useGetAllBankAccount(params: URLSearchParams): SWRResponse<PaginationResponse<BankAccount>> {
    return useConsoleSwr(`/bank-account?${params}`, authFetcher);
}

// dropdowns — no `page`, so the backend returns every row
export function useGetBankAccountOptions(): SWRResponse<BankAccount[]> {
    return useConsoleSwr("/bank-account", authFetcher);
}

export function useGetOneBankAccount(id: number | string, config?: SWRConfiguration): SWRResponse<BankAccount> {
    return useConsoleSwr(`/bank-account/${id}`, authFetcher, config);
}

export function addBankAccount(data: BankAccountRequest): Promise<BankAccount> {
    return authApiRequest("/bank-account").add(data).post();
}

export function updateBankAccount(id: number | string, data: BankAccountRequest): Promise<BankAccount> {
    return authApiRequest(`/bank-account/${id}`).add(data).put();
}

export function deleteBankAccount(id: number | string): Promise<void> {
    return authApiRequest(`/bank-account/${id}`).delete();
}
