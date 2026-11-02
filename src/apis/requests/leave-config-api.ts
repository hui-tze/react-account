import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {PaginationResponse} from "../pagination";
import {AccuralsInfo, AppliedScopesInfo, LeaveAdjustmentStaffInfo, LeaveConfig, ThresholdsInfo} from "../models/leave-config";
import {Staff} from "../models/staff";
import {LeaveApplication, LeaveApplicationStaffInfo} from "../models/leave-application";
import {LeaveBalance} from "./my-leave-config-api";
import {SelectOptionProps} from "../models/common";

export type LeaveConfigRequest = Omit<LeaveConfig, 'id'|'branch_id'> & {
    thresholds: Omit<ThresholdsInfo, 'id'|'leave_conf_id'>[],
    applied_scopes: Omit<AppliedScopesInfo, 'id'|'leave_conf_id'>[],
    accruals : Omit<AccuralsInfo, 'id'|'leave_conf_id'>[],
};
export type LeaveConfigWithDetail = LeaveConfig & {
    accruals: AccuralsInfo[],
    date_exclusions: string[],
    applied_scopes: AppliedScopesInfo[],
    thresholds: ThresholdsInfo[],
};
export type LeaveConfigStaffAccrualInfo = {
    staff_id: number,
    staff_name: string,
    previous_balance: number,
    initial_balance: number,
    applied_leave_reduction: number,
    new_balance: number,
}
export type LeaveApplicationWithStaffInfo = LeaveApplication & {
    staff: LeaveApplicationStaffInfo
}
export type StaffWithLeaveBalanceInfo = Staff & {
    leave_bal: LeaveBalance,
    matching_accrual: {
        info: Omit<AccuralsInfo, 'id'|'leave_conf_id'>,
        expected_accrual_balance: number,
        start_at: string,
    }
}
export type LeaveConfigWithStaffAdjustmentInfo = {
    leave_config: LeaveConfig,
    infos: LeaveAdjustmentStaffInfo[],
}
export type LeaveAdjustmentRequest = {
    staff_ids: number[],
    adjustment_value: number,
    remarks: string
}

export function useGetAllLeaveConfig(params: URLSearchParams): SWRResponse<PaginationResponse<LeaveConfig>> {
    return useConsoleSwr(`/leave-configs?${params}`, authFetcher);
}

export function useGetOneLeaveConfig(id: number|string, config?: SWRConfiguration) {
    return useConsoleSwr<LeaveConfigWithDetail>(`/leave-configs/${id}`, authFetcher, config);
}

export function useGetActiveLeaveConfig(config?: SWRConfiguration) {
    return useConsoleSwr<LeaveConfig[]>(`/leave-configs/active`, authFetcher, config);
}

export function useGetActiveLeaveConfigOptions(config?: SWRConfiguration) {
    return useConsoleSwr<SelectOptionProps[]>(`/leave-configs/active/options`, authFetcher, config);
}

export function createLeaveConfig(data: LeaveConfigRequest): Promise<LeaveConfigWithDetail> {
    return authApiRequest("/leave-configs").add(data).post();
}

export function updateLeaveConfig(id: number|string, data: LeaveConfigRequest): Promise<LeaveConfigWithDetail> {
    return authApiRequest(`/leave-configs/${id}`).add(data).put();
}

export function computeTemporaryStaffLeaveConfigAccrual(id: number|string, config?: SWRConfiguration) {
    return useConsoleSwr<LeaveConfigStaffAccrualInfo[]>(`/leave-configs/${id}/recompute-accrual/dry`, authFetcher, config);
}

export function recomputeStaffLeaveConfigAccrual(id: number|string,): Promise<[]> {
    return authApiRequest(`/leave-configs/${id}/recompute-accrual`).post();
}

export function useGetAllLeaveConfigStaffBalance(id: number|string, params: URLSearchParams): SWRResponse<PaginationResponse<StaffWithLeaveBalanceInfo>> {
    return useConsoleSwr(`/leave-configs/${id}/staffs?${params}`, authFetcher);
}

export function useGetAllLeaveConfigApplication(id: number|string, params: URLSearchParams): SWRResponse<PaginationResponse<LeaveApplicationWithStaffInfo>> {
    return useConsoleSwr(`/leave-configs/${id}/applications?${params}`, authFetcher);
}

export function useGetLeaveAdjustmentStaff(id: number|string, config?: SWRConfiguration) {
    return useConsoleSwr<LeaveConfigWithStaffAdjustmentInfo>(`/leave-configs/${id}/adjustment/staffs`, authFetcher, config);
}

export function applyLeaveAdjustment(id: number|string, data: LeaveAdjustmentRequest): Promise<[]> {
    return authApiRequest(`/leave-configs/${id}/adjustment/apply`).add(data).put();
}