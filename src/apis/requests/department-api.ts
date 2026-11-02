import {Department, DepartmentParentOption, DepartmentTypeOption, StaffInfo} from "@/apis/models/department";
import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {PaginationResponse} from "../pagination";

export type DepartmentRequest = Omit<Department, "id"|"status"> & {
    parent_id: number,
    supervisors: number[],
    permissions: string[],
}

export type DepartmentDetails = Department & {
    permissions: string[],
    supervisors: StaffInfo[],
    children: Department & {
        children: Department[]
    }[],
    staffs: StaffInfo[],
    parent: {
        id: number,
        name: string,
    }|null
}

export function useGetAllDepartment(params: URLSearchParams): SWRResponse<PaginationResponse<DepartmentDetails>> {
    return useConsoleSwr(`/departments?${params}`, authFetcher);
}

export function useGetOneDepartment(id: number|string, config?: SWRConfiguration): SWRResponse<DepartmentDetails> {
    return useConsoleSwr(`/departments/${id}`, authFetcher, config);
}

export function useGetDepartmentParentOptions(id: number|string, config?: SWRConfiguration): SWRResponse<DepartmentParentOption[]> {
    return useConsoleSwr(`/departments/parent-options?branch_id=${id}`, authFetcher, config);
}

export function useGetDepartmentTypeOptions(): SWRResponse<DepartmentTypeOption[]> {
    return useConsoleSwr(`/departments/type-options`, authFetcher);
}

export function addDepartment(data: DepartmentRequest): Promise<void> {
    return authApiRequest("/departments").add(data).post();
}

export function updateDepartment(id: number|string, data: DepartmentRequest): Promise<Department> {
    return authApiRequest(`/departments/${id}`).add(data).put();
}