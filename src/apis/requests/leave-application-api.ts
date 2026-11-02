import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {Attachment} from "../models/attachment";
import {LeaveApplication, LeaveApplicationScheduleBreakInfo, LeaveApplicationScheduleInfo, LeaveApplicationStaffInfo, LeaveApplicationWorkflowInfo} from "../models/leave-application";
import {PaginationResponse} from "../pagination";

export type LeaveActions = 'adjust-comsumption' | 'reject' | 'approve' | 'cancel' | 'revert' | string;
export type CachedLeaveQuotation = {
   leave_conf_id: number,
   conf_hash: string,
   quote: {
        hours_to_day_conversion: number,
        consume_hours: number,
        start_at: string,
        end_at: string,
        schedule_infos: Omit<LeaveApplicationScheduleInfo, 'id'|'leave_application_id'|'schedule_id'> & {
            assoc_schedule_id: number,
            schedule_local_date: string,
            breaks: Omit<LeaveApplicationScheduleBreakInfo, 'id'|'leave_application_schedule_id'>[],
        }
   }
};
export type LeaveQuotationInfo = {
    uid: string,
    info: CachedLeaveQuotation
};
export type ApplyLeaveRequest = {
    uid: string,
    remarks: string,
    attachments: Omit<Attachment, 'temp_url'>[],
    temp: File[],
};
export type ApproveLeaveRequest = {
    is_approved: boolean,
    comment?: string,
}
export type CancelLeaveRequest = {
    reason?: string,
}
export type MyLeaveApplication = LeaveApplication & {
    schedules: LeaveApplicationScheduleInfo[],
}
export type AllLeaveApplication = LeaveApplication & {
    staff: LeaveApplicationStaffInfo,
}
type StepPic = {
    id: number,
    name: string,
}
export type LeaveApplicationDetails = LeaveApplication & {
    designation_pics: StepPic[],
    department_pics: StepPic[],
    department_supervisor_pics: StepPic[],
    staff_pics: StepPic[],
    actions: LeaveActions[],
    staff: LeaveApplicationStaffInfo,
    workflow: LeaveApplicationWorkflowInfo,
    attachments: Attachment[],
    schedules: LeaveApplicationScheduleInfo[],
}
export type PendingMyActionLeave = LeaveApplication & {
    workflow: LeaveApplicationWorkflowInfo,
    staff: LeaveApplicationStaffInfo,
} 

export function useGetMyCachedLeaveQuote(uid: string, config?: SWRConfiguration): SWRResponse<CachedLeaveQuotation> {
    return useConsoleSwr(`/leave-application/me/quotation/${uid}`, authFetcher, config);
}

export function useCreateMyLeaveApplication(uid: string, data: ApplyLeaveRequest): Promise<void> {
    return authApiRequest(`/leave-application/me/quotation/${uid}/apply`).add(data).post();
}

export function useCancelMyLeaveApplication(id: number|string, data: CancelLeaveRequest): Promise<void> {
    return authApiRequest(`/leave-application/me/${id}/cancel`).add(data).post();
}

export function useGetMyAllLeaveApplication(params: URLSearchParams): SWRResponse<PaginationResponse<MyLeaveApplication>> {
    return useConsoleSwr(`/leave-application/me?${params}`, authFetcher);
}

export function useGetMyOneLeaveApplication(id: number|string, config?: SWRConfiguration): SWRResponse<LeaveApplicationDetails> {
    return useConsoleSwr(`/leave-application/me/${id}`, authFetcher, config);
}

export function useGetAllLeaveApplication(params: URLSearchParams): SWRResponse<PaginationResponse<AllLeaveApplication>> {
    return useConsoleSwr(`/leave-application?${params}`, authFetcher);
}

export function useGetOneLeaveApplication(id: number|string, config?: SWRConfiguration): SWRResponse<LeaveApplicationDetails> {
    return useConsoleSwr(`/leave-application/${id}`, authFetcher, config);
}

export function useGetRequiredMyActionLeaveApplication(params?: URLSearchParams): SWRResponse<PendingMyActionLeave[]> {
    return useConsoleSwr(`/leave-application/required-my-action?${params}`, authFetcher);
}

export function useGetMyLeaveQuote(params: URLSearchParams, config?: SWRConfiguration): SWRResponse<LeaveQuotationInfo> {
    return useConsoleSwr(`/leave-application/me/quote?${params}`, authFetcher, config);
}; 

export function useApproveLeaveApplication(id: string, data: ApproveLeaveRequest): Promise<void> {
    return authApiRequest(`/leave-application/${id}/approval`).add(data).post();
}

export function useRevertLeaveApplication(id: string, data: CancelLeaveRequest): Promise<void> {
    return authApiRequest(`/leave-application/${id}/revert`).add(data).post();
}