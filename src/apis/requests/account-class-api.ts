import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {AccountClass} from "@/apis/models/account-class";

export type AccountClassRequest = Omit<AccountClass, "id" | "company_id">

export function useGetAllAccountClass(): SWRResponse<AccountClass[]> {
    return useConsoleSwr("/account-class", authFetcher);
}

export function useGetOneAccountClass(id: number | string, config?: SWRConfiguration): SWRResponse<AccountClass> {
    return useConsoleSwr(`/account-class/${id}`, authFetcher, config);
}

export function addAccountClass(data: AccountClassRequest): Promise<AccountClass> {
    return authApiRequest("/account-class").add(data).post();
}

export function updateAccountClass(id: number | string, data: AccountClassRequest): Promise<AccountClass> {
    return authApiRequest(`/account-class/${id}`).add(data).put();
}

export function deleteAccountClass(id: number | string): Promise<void> {
    return authApiRequest(`/account-class/${id}`).delete();
}
