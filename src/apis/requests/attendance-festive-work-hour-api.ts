import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import {SWRConfiguration} from "swr";
import {FestiveWorkHour} from "../models/attendance-festive-work-hour";

export type FestiveWorkHourRequest = Omit<FestiveWorkHour, "id"|"branch_id"|"schedules"> & {
    schedule_ids: number[],
};
export type FestiveWorkHourConflict = {
    has_conflict: boolean,
    conflicts: {
        adjustment_id: number,
        adjustment_name: string,
        schedule_id: number,
        schedule_name: string
    }[],
}

export function useGetFestiveWorkHourCalendar(params: URLSearchParams, config?: SWRConfiguration) {
    return useConsoleSwr<FestiveWorkHour[]>(`/attendance-adjustment/calendar?${params}`, authFetcher, config);
}

export function getOneFestiveWorkHour(id: number|string, config?: SWRConfiguration) {
    return useConsoleSwr<FestiveWorkHour>(`/attendance-adjustment/${id}`, authFetcher, config);
}

export function createAttendanceFestiveWorkHour(data: FestiveWorkHourRequest): Promise<[]> {
    return authApiRequest("/attendance-adjustment").add(data).post();
}

export function editAttendanceFestiveWorkHour(id: number|string, data: FestiveWorkHourRequest) {
    return authApiRequest(`/attendance-adjustment/${id}`).add(data).put();
}

export function deleteAttendanceFestiveWorkHour(id: number|string): Promise<[]> {
    return authApiRequest(`/attendance-adjustment/${id}`).delete();
}

export function checkAttendanceFestiveWorkHourConflict(params: URLSearchParams) {
    return useConsoleSwr<FestiveWorkHourConflict>(`/attendance-adjustment/check-conflict?${params}`, authFetcher);
}
