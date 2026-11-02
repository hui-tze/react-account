import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
export type RolePermissionRequest = {
    id: number,
    permissions: string[],
};
export type AvailableRolePermission = {
    name: string;
    slug: string;
    permissions: string[];
    children: AvailableRolePermission[];
};

export function useGetOneOrganizationPermission(id: number|string, config?: SWRConfiguration): SWRResponse<string[]> {
    return useConsoleSwr(`/role-permission/organization/${id}`, authFetcher, config);
}

export function useGetOneRolePermission(id: number|string, config?: SWRConfiguration): SWRResponse<string[]> {
    return useConsoleSwr(`/role-permission/role/${id}`, authFetcher, config);
}

export function useSetOrganizationPermission(data: RolePermissionRequest): Promise<void> {
    return authApiRequest("/role-permission/organization/set").add(data).post();
}

export function useSetRolePermission(data: RolePermissionRequest): Promise<void> {
    return authApiRequest("/role-permission/role/set").add(data).post();
}

export function useGetAvailableRolePermissions(config?: SWRConfiguration): SWRResponse<AvailableRolePermission[]> {
    return useConsoleSwr(`/role-permission/available`, authFetcher, config);
}