import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import {Branch, BranchSettings} from "../models/branch";

export function useGetCurrentBranchInfo() {
    return useConsoleSwr<Branch>(`/branches/current`, authFetcher, {
        revalidateOnFocus: false
    });
}

export function updateCurrentBranchInfo(data: BranchSettings) {
    return authApiRequest(`/branches/current`).add(data).put();
}