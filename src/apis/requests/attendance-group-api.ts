import {
    AttendanceGroup, AttendanceGroupFixedConfig, AttendanceGroupFixedDetail,
    AttendanceGroupFlexibleDetail,
    AttendanceGroupLocation,
    AttendanceGroupOrganizationConflict,
    AttendanceGroupOrganizationStaffConflict,
    AttendanceGroupShiftArrangement,
    AttendanceGroupStaff,
    AttendanceGroupWifi,
    AttendanceGroupWithConfig,
    ShiftScheduleDetail,
    ShiftScheduleInfo
} from "@/apis/models/attendance-group";
import {authApiRequest, authApiRequestTempUrl, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import {SWRConfiguration} from "swr";
import {User} from "@/apis/models/user";
import {Department} from "@/apis/models/department";
import {Staff} from "@/apis/models/staff";
import {PaginationResponse} from "../pagination";
import qs from "qs";
import {URLResponse} from "../models/common";

export type AttendanceGroupRequestBase =  Omit<AttendanceGroup, "id"|"branch_id"|"type"> & {
    admins: number[],
    organization_participants: number[],
    staff_participants: number[],
    excluded_staff_participants: number[],
    wifi: Omit<AttendanceGroupWifi, "id"|"attendance_group_id">[],
    locations: Omit<AttendanceGroupLocation, "id"|"attendance_group_id">[],
};

export type AttendanceGroupFixedRequest = AttendanceGroupRequestBase & {
    has_auto_clock_out: boolean,
    auto_clock_out_minutes: number,
    setting: Omit<AttendanceGroupFixedDetail, "id"|"attendance_group_id"|"configs"> & {
        configs: Omit<AttendanceGroupFixedConfig, "id"|"schedule"|"attendance_group_fixed_id">[],
    },
}

export type AttendanceGroupFlexibleRequest = AttendanceGroupRequestBase & {
    setting: Omit<AttendanceGroupFlexibleDetail, "id"|"attendance_group_id">,
}

export type AttendanceGroupShiftRequest = AttendanceGroupRequestBase & {
    has_auto_clock_out: boolean,
    auto_clock_out_minutes: number,
    setting: Omit<AttendanceGroupFixedDetail, "id"|"attendance_group_id"|"configs">,
}

export type AttendanceGroupWithDetails = AttendanceGroupWithConfig & {
    admins: User[],
    organization_participants: Department[],
    staff_participants: Staff[],
    excluded_staff_participants: Staff[],
    wifi: AttendanceGroupWifi[],
    locations: AttendanceGroupLocation[],
}

export type AttendanceGroupLists = AttendanceGroup & {
    type: string,
}

export type AttendanceGroupConflict = {
    has_conflict: boolean,
    staffs: AttendanceGroupOrganizationConflict[],
    organization_staffs: AttendanceGroupOrganizationStaffConflict[],
    organizations: AttendanceGroupOrganizationConflict[]
}

export type AttendanceGroupShiftArrangementRequest = {
    staff_id: number,
    date: string,
    schedule_ids: number[]
};

export type AttendanceGroupShiftArrangementWithScheduleInfo = AttendanceGroupShiftArrangement & {
    schedule_infos: ShiftScheduleInfo[]
}

export type AttendanceGroupShiftArrangementWithScheduleDetails = AttendanceGroupShiftArrangement & {
    schedule_infos: ShiftScheduleDetail[]
}

export type WeeklyRosterExportFilter = {
    start_date: string,
    end_date: string,
}

export function getManyAttendanceGroup(params: URLSearchParams) {
    return useConsoleSwr<PaginationResponse<AttendanceGroupLists>>(`/attendance-groups?${params}`, authFetcher);
}

export function getOneAttendanceGroup(id: number|string, config?: SWRConfiguration) {
    return useConsoleSwr<AttendanceGroupWithDetails>(`/attendance-groups/${id}`, authFetcher, config);
}

export function createAttendanceGroupFixed(data: AttendanceGroupFixedRequest): Promise<AttendanceGroup> {
    return authApiRequest("/attendance-groups/fixed").add(data).post();
}

export function editAttendanceGroupFixed(id: number|string, data: AttendanceGroupFixedRequest): Promise<AttendanceGroup> {
    return authApiRequest(`/attendance-groups/${id}/fixed`).add(data).put();
}

export function createAttendanceGroupShift(data: AttendanceGroupShiftRequest): Promise<AttendanceGroup> {
    return authApiRequest("/attendance-groups/shift").add(data).post();
}

export function editAttendanceGroupShift(id: number|string, data: AttendanceGroupShiftRequest): Promise<AttendanceGroup> {
    return authApiRequest(`/attendance-groups/${id}/shift`).add(data).put();
}

export function createAttendanceGroupFlexible(data: AttendanceGroupFlexibleRequest): Promise<AttendanceGroup> {
    return authApiRequest("/attendance-groups/flexible").add(data).post();
}

export function editAttendanceGroupFlexible(id: number|string, data: AttendanceGroupFlexibleRequest): Promise<AttendanceGroup> {
    return authApiRequest(`/attendance-groups/${id}/flexible`).add(data).put();
}

export function checkAttendenceGroupConflict(params: URLSearchParams) {
    return useConsoleSwr<AttendanceGroupConflict>(`/attendance-groups/check-conflict?${params}`, authFetcher);
}

export function useGetAttendanceGroupParticipants(id: number|string, config?: SWRConfiguration) {
    return useConsoleSwr<AttendanceGroupStaff[]>(`/attendance-groups/${id}/staffs`, authFetcher, config);
}

export function useGetAttendanceGroupShiftArrangement(id: number|string, params: URLSearchParams) {
    return useConsoleSwr<AttendanceGroupShiftArrangementWithScheduleDetails[]>(`/attendance-groups/${id}/shift/arrangement?${params}`, authFetcher);
}

export function updateAttendanceGroupShiftArrangement(id: number|string, data: AttendanceGroupShiftArrangementRequest): Promise<AttendanceGroupShiftArrangement> {
    return authApiRequest(`/attendance-groups/${id}/shift/arrange`).add(data).post();
}

export function deleteAttendanceGroup(id: number|string): Promise<[]> {
    return authApiRequest(`/attendance-groups/${id}`).delete();
}

export async function exportWeeklyRoster(id: string|number, filter: WeeklyRosterExportFilter) {
    const res = await authApiRequestTempUrl<URLResponse>(`/attendance-groups/${id}/roster/generate-link?${qs.stringify(filter)}`);
    window.open(`${res.url}`, "_blank");
}