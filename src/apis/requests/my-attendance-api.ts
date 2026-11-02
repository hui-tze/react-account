import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import {SWRConfiguration} from "swr";
import {AttendanceSchedule, AttendanceScheduleBreak} from "@/apis/models/attendance-schedule";
import {MyDailyAttendance, MyMonthlyAttendance} from "../models/my-attendance";

export function useGetMyDailyAttendance(params?: URLSearchParams) {
    return useConsoleSwr<MyDailyAttendance[]>(`/staff-attendance/me/attendances?${params}`, authFetcher);
}

export function useGetMyMonthlyAttendance(params?: URLSearchParams) {
    return useConsoleSwr<MyMonthlyAttendance[]>(`/staff-attendance/me/monthly-attendances?${params}`, authFetcher);
}
