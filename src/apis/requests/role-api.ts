import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {Role} from "../models/role";
import {PaginationResponse} from "../pagination";
import {SelectOptionProps} from "../models/common";

export type RoleRequest = {
    name: string,
    permissions: string[],
};

export function useGetAllRole(params: URLSearchParams): SWRResponse<PaginationResponse<Role>> {
    return useConsoleSwr(`/role?${params}`, authFetcher);
}

export function useGetOneRole(id: number|string, config?: SWRConfiguration): SWRResponse<Role> {
    return useConsoleSwr(`/role/${id}`, authFetcher, config);
}

export function useGetRoleOptions(config?: SWRConfiguration): SWRResponse<SelectOptionProps[]> {
    return useConsoleSwr(`/role/options`, authFetcher, config);
}

export function addRole(data: RoleRequest): Promise<void> {
    return authApiRequest("/role").add(data).post();
}

export function updateRole(id: number|string, data: RoleRequest): Promise<Role> {
    return authApiRequest(`/role/${id}`).add(data).put();
}