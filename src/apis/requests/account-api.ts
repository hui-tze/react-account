import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {Account} from "@/apis/models/account";

export type AccountRequest = Omit<Account, "id" | "company_id">

export function useGetAllAccount(): SWRResponse<Account[]> {
    return useConsoleSwr("/account", authFetcher);
}

export function useGetOneAccount(id: number | string, config?: SWRConfiguration): SWRResponse<Account> {
    return useConsoleSwr(`/account/${id}`, authFetcher, config);
}

export function addAccount(data: AccountRequest): Promise<Account> {
    return authApiRequest("/account").add(data).post();
}

export function updateAccount(id: number | string, data: AccountRequest): Promise<Account> {
    return authApiRequest(`/account/${id}`).add(data).put();
}

export function deleteAccount(id: number | string): Promise<void> {
    return authApiRequest(`/account/${id}`).delete();
}
