import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {AccountGroup} from "@/apis/models/account-group";

export type AccountGroupRequest = Omit<AccountGroup, "id" | "company_id">

export function useGetAllAccountGroup(): SWRResponse<AccountGroup[]> {
    return useConsoleSwr("/account-group", authFetcher);
}

export function useGetOneAccountGroup(id: number | string, config?: SWRConfiguration): SWRResponse<AccountGroup> {
    return useConsoleSwr(`/account-group/${id}`, authFetcher, config);
}

export function addAccountGroup(data: AccountGroupRequest): Promise<AccountGroup> {
    return authApiRequest("/account-group").add(data).post();
}

export function updateAccountGroup(id: number | string, data: AccountGroupRequest): Promise<AccountGroup> {
    return authApiRequest(`/account-group/${id}`).add(data).put();
}

export function deleteAccountGroup(id: number | string): Promise<void> {
    return authApiRequest(`/account-group/${id}`).delete();
}
