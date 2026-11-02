import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {DepartmentStaffInfo, Staff, StaffEducationInfo, StaffJourneyInfo, SupervisingStaff,
    StaffBankInfo, StaffDetailInfo, StaffPayrollInfo, StaffStatutoryInfo} from "../models/staff";
import {PaginationResponse} from "../pagination";
import {Designation} from "@/apis/models/designation";
import {Branch} from "../models/branch";
import {DeviceBind, UploadAvatarRequest, User} from "../models/user";
import {SelectOptionProps} from "../models/common";
import {Role} from "../models/role";
import {UserRequest} from "./user-api";

export type StaffRequest = Omit<Staff, 'id'|'user_id'|'working_branch_id'|'status'|'current_employment_date'|'active_contract_id'|'main_organization_id'|'main_organization_name'|'designation_id'|'designation_name'|'avatar'> & {
    departments: number[],
    supervising_departments: number[],
    role_ids: number[],
    avatar: UploadAvatarRequest|null,
};
export type StaffWithRoleAndBranch = Staff & {
    employment_type: string,
    employment_status: string,
    contract_employment_date: string,
    device_meta: string|null,
    roles: Role,
    branch: Branch,
}
export type StaffDetail = Staff & {
    journeys: StaffJourneyInfo[],
    educations: StaffEducationInfo[],
    designation: Designation,
    supervising_departments: DepartmentStaffInfo[],
    branch: Branch,
    user: User,
    roles: Role[],
    device_binding: DeviceBind,
    detail: StaffDetailInfo,
    payroll: StaffPayrollInfo,
    satutory: StaffStatutoryInfo,
    banks: StaffBankInfo,
}
export type SupervisingStaffWithRole = SupervisingStaff & {
    roles: Role,
}
export type StaffEducationRequest = Omit<StaffEducationInfo, 'id'|'staff_id'>[];
export type StaffJourneyRequest = Omit<StaffJourneyInfo, 'id'|'staff_id'>[];

export function useGetAllStaff(params: URLSearchParams): SWRResponse<PaginationResponse<StaffWithRoleAndBranch>> {
    return useConsoleSwr(`/staffs?${params}`, authFetcher);}

export function useGetOneStaff(id: number|string, config?: SWRConfiguration): SWRResponse<StaffDetail> {
    return useConsoleSwr(`/staffs/${id}`, authFetcher, config);
}

export function useGetStaffOptions(config?: SWRConfiguration): SWRResponse<SelectOptionProps[]> {
    return useConsoleSwr(`/staffs/options`, authFetcher, config);
}

export function updateStaff(id: number|string, data: UserRequest): Promise<StaffDetail> {
    return authApiRequest(`/staffs/${id}`).add(data).put();
}

export function addUpdateStaffEducation(id: number|string, data: StaffEducationRequest): Promise<void> {
    return authApiRequest(`/staffs/${id}/educations`).add(data).post();
}

export function addUpdateStaffJourney(id: number|string, data: StaffJourneyRequest): Promise<void> {
    return authApiRequest(`/staffs/${id}/journeys`).add(data).post();
}

export function clearBindDevice(id: number|string): Promise<void> {
    return authApiRequest(`/staffs/${id}/device-binding/clear`).post();
}

export function uploadStaffAvatar(id: number|string, data: UploadAvatarRequest): Promise<void> {
    return authApiRequest(`/staffs/${id}/upload-avatar`).add(data).post();
}

export function useGetAllSupervisingStaff(params: URLSearchParams): SWRResponse<PaginationResponse<SupervisingStaffWithRole>> {
    return useConsoleSwr(`/staffs/supervising?${params}`, authFetcher);
}

export function useGetOneSupervisingStaff(id: number|string, config?: SWRConfiguration): SWRResponse<SupervisingStaff> {
    return useConsoleSwr(`/staffs/supervising/${id}`, authFetcher, config);
}