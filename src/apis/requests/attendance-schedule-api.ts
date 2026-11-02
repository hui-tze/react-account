import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import {SWRConfiguration} from "swr";
import {AttendanceSchedule, AttendanceScheduleBreak} from "@/apis/models/attendance-schedule";
import {PaginationResponse} from "@/apis/pagination";

export type AttendanceGroupFixedScheduleRequest = Omit<AttendanceSchedule, "id"|"branch_id"|"breaks"> & {
    breaks: Omit<AttendanceScheduleBreak,"id"|"schedule_id">[],
};

export function getManyAttendanceGroupFixedSchedule(params: URLSearchParams) {
    return useConsoleSwr<PaginationResponse<AttendanceSchedule>>(`/attendance-schedules?${params}`, authFetcher);
}

export function getOneAttendanceGroupFixedSchedule(id: number|string, config?: SWRConfiguration) {
    return useConsoleSwr<AttendanceSchedule>(`/attendance-schedules/${id}`, authFetcher, config);
}

export function getAllAttendanceGroupFixedSchedules(config?: SWRConfiguration) {
    return useConsoleSwr<AttendanceSchedule[]>(`/attendance-schedules/all`, authFetcher, config);
}

export function createAttendanceGroupFixedSchedule(data: AttendanceGroupFixedScheduleRequest): Promise<AttendanceSchedule> {
    return authApiRequest("/attendance-schedules").add(data).post();
}

export function editAttendanceGroupFixedSchedule(id: number|string, data: AttendanceGroupFixedScheduleRequest) {
    return authApiRequest(`/attendance-schedules/${id}`).add(data).put();
}
