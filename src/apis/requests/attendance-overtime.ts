import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {PaginationResponse} from "../pagination";
import {StaffBasicInfoWithAvatar} from "../models/staff";

export type AttendanceOvertime = {
    id: number,
    staff_id: number,
    start_at: string,
    end_at: string,
    start_at_valid: string,
    end_at_valid: string,
    minutes_valid: number,
    status: string
}
export type ApplyOTRequest = {
    comment: string,
    start_at: string,
    end_at: string
}
export type AttendanceOvertimeAudit = {
    id: number,
    staff_attendnace_ot_id: number,
    staff_id: number,
    action: string,
    comment: string,
    created_at: string,
}
export type MyAttendanceOvertimeDetail = AttendanceOvertime & {
    audits: AttendanceOvertimeAudit[],
    staff: StaffBasicInfoWithAvatar
}
export type OvertimeAttendanceInfo = {
    id: number,
    by_staff_id: number,
    staff_id: number,
    assoc_schedule_id: number,
    schedule_snapshot_uid: string,
    schedule_date: string,
    attendance_group_snapshot_uid: string,
    attendance_group_type: string,
    for_schedule_type: string,
    type: string,
    mode: string,
    clocked_at: string,
    is_online: boolean,
    status: string,
}
export type AttendanceOvertimeDetail = {
    application: MyAttendanceOvertimeDetail,
    attendances: OvertimeAttendanceInfo[]
}
export type ApproveOTRequest = {
    comment?: string,
    start_at_valid: string,
    end_at_valid: string,
}
export type RejectOTRequest = {
    comment?: string,
}

export function useGetAllMyOvertime(params: URLSearchParams): SWRResponse<PaginationResponse<AttendanceOvertime>> {
    return useConsoleSwr(`/staff-attendance/me/ot/requests?${params}`, authFetcher);
}

export function useGetOneMyOvertime(id: number|string, config?: SWRConfiguration): SWRResponse<MyAttendanceOvertimeDetail> {
    return useConsoleSwr(`/staff-attendance/me/ot/requests/${id}`, authFetcher, config);
}

export function useApplyOT(data: ApplyOTRequest): Promise<void> {
    return authApiRequest("/staff-attendance/me/ot/requests/apply").add(data).post();
}

export function useGetAllOvertime(params: URLSearchParams): SWRResponse<PaginationResponse<AttendanceOvertime>> {
    return useConsoleSwr(`/staff-attendance/ot/requests?${params}`, authFetcher);
}

export function useGetOneOvertime(id: number|string, config?: SWRConfiguration): SWRResponse<AttendanceOvertimeDetail> {
    return useConsoleSwr(`/staff-attendance/ot/requests/${id}`, authFetcher, config);
}

export function useApproveOvertime(id: string, data: ApproveOTRequest): Promise<void> {
    return authApiRequest(`/staff-attendance/ot/requests/${id}/approve`).add(data).put();
}

export function useRejectOvertime(id: string, data: RejectOTRequest): Promise<void> {
    return authApiRequest(`/staff-attendance/ot/requests/${id}/reject`).add(data).put();
}