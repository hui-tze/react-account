import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {UpdatePasswordRequest, UploadAvatarRequest, User, UserOption} from "../models/user";
import {Staff, StaffBankInfo, StaffDetailInfo, StaffPayrollInfo, StaffStatutoryInfo} from "@/apis/models/staff";

export type UserRequest = Omit<Staff, 'id'|'user_id'|'branch_id'|'working_branch_id'|'avatar'> & {
    avatar: UploadAvatarRequest|null,
    username: string,
    password: string,
    departments: number[],
    supervising_departments: number[],
    role_ids: number[],
    detail: Omit<StaffDetailInfo, 'id'|'staff_id'>,
    payroll: Omit<StaffPayrollInfo, 'id'|'staff_id'>,
    statutory: Omit<StaffStatutoryInfo, 'id'|'staff_id'>,
    banks: Omit<StaffBankInfo, 'id'|'staff_id'>[],
};
export type ChangeUserStatusRequest = {
    status: string
}
export type UserCreateSuccessResponse = {
    id: number,
    username: string,
    is_owner: boolean,
    is_first_time_login: boolean,
    status: string,
    staff: Staff,
}

export function useGetAllUser(params: URLSearchParams): SWRResponse<User> {
    return useConsoleSwr(`/users?${params}`, authFetcher);
}

export function useGetUserOptions(config?: SWRConfiguration): SWRResponse<UserOption[]> {
    return useConsoleSwr(`/users/options`, authFetcher, config);
}

export function addUser(data: UserRequest): Promise<UserCreateSuccessResponse> {
    return authApiRequest("/users").add(data).post();
}

export function changeUserPassword(id: number|string, data: UpdatePasswordRequest): Promise<User> {
    return authApiRequest(`/users/${id}/change-password`).add(data).patch();
}

export function changeUserStatus(id: number|string, data: ChangeUserStatusRequest): Promise<User> {
    return authApiRequest(`/users/${id}/change-status`).add(data).patch();
}