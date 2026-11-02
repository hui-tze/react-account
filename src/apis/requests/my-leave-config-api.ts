import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {PaginationResponse} from "../pagination";
import {AccuralsInfo, AppliedScopesInfo, LeaveConfig, ThresholdsInfo} from "../models/leave-config";
import {Staff} from "../models/staff";
import { LeaveApplication } from "../models/leave-application";

export type LeaveBalance = {
    id: number,
    staff_id: number,
    leave_conf_id: number,
    balance: number,
    accrued_balance: number,
    consumed_balance: number,
    balance_on_hold: number,
    available_balance: number,
    remaining_carry_over_balance: number,
}
export type MyLeaveConfig = LeaveConfig & {
    leave_bal: LeaveBalance,
    matching_accrual: {
        info: Omit<AccuralsInfo, 'id'|'leave_conf_id'>,
        expected_accrual_balance: number,
        start_at: string,
    }
    accruals: AccuralsInfo[],
}
export type MyLeaveConfigDetail = LeaveConfig & {
    leave_bal: LeaveBalance & {
        balance_on_hold: number,
        histories: {
            id: number,
            leave_bal_id: number,
            changes: number,
            type: string,
            calc_type: string,
            reason: string|null,
        }[],
    }
}

export function useGetMyLeaveConfig(params?: URLSearchParams): SWRResponse<MyLeaveConfig[]> {
    return useConsoleSwr(`/leave-configs/me?${params}`, authFetcher);
}

export function useGetMyLeaveConfigDetail(id: number|string, config?: SWRConfiguration) {
    return useConsoleSwr<MyLeaveConfigDetail>(`/leave-configs/me/${id}`, authFetcher, config);
}

export function useGetMyAllLeaveConfigApplication(id: number|string, params?: URLSearchParams): SWRResponse<PaginationResponse<LeaveApplication>> {
    return useConsoleSwr(`/leave-configs/me/${id}/applications?${params}`, authFetcher);
}

