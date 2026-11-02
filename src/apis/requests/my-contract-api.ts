import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {PaginationResponse} from "../pagination";
import {Contract} from "../models/payroll-contract";

export function useGetAllMyContract(config?: SWRConfiguration): SWRResponse<Contract[]> {
    return useConsoleSwr(`/me/contracts`, authFetcher);
}

export function useGetMyActiveContract(config?: SWRConfiguration) {
    return useConsoleSwr<Contract>(`/me/contracts/active`, authFetcher, config);
}
