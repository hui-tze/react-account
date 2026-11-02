import {authApiRequestTempUrl, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import {MyDailyAttendance, MyMonthlyAttendance} from "../models/my-attendance";
import {PaginationResponse} from "../pagination";
import {WokingBranchAttendance, WorkingBranchDailySummaryAttendance, WorkingBranchMonthlySummaryAttendance} from "../models/working-branch-attendance";
import {TempUrlResponse} from "../models/common";
import qs from "qs";

export type DailyAttendanceExportFilter = {
    date: string|undefined,
    extra_columns: string[],
}
export type MonthlyAttendanceExportFilter = {
    year_month: string|undefined,
    extra_columns: string[],
}
type LateRankingItem = {
    name: string;
    count: number;
};
type AttendanceInfo = {
    expected: number,
    clocked_in: number,
    no_clocked_in: number,
    late: number,
    significant_late: number,
    no_record: number,
    on_leave: number,
    attendance_rate: number,
    local_date: string,
}
type AttendanceDepartmentComparison = AttendanceInfo & {
    name: string
}
type AttendanceScheduleInfo = AttendanceInfo & {
    name: string,
    start_at: string,
    end_at: string,
    is_next_day: boolean,
}
type MonthlyPerfectAttendanceItem = {
    year_month: string,
    year: number, 
    month: number,
    is_perfect: boolean
}
type MonthlyPerfectAttendance = {
    name: string,
    perfect_count: number,
    items: MonthlyPerfectAttendanceItem[],
}
export type AttendanceDashboard = {
    today_attendance: AttendanceInfo,
    overtime: {
        today_count: number,
        month_count: number,
        pending_approval: number,
    },
    attendance_insights: {
        late_ranking: LateRankingItem[],
        department_comparison: AttendanceDepartmentComparison[],
        monthly_perfect_attendance: MonthlyPerfectAttendance[],
    }
    attendance_schedule_coverage: AttendanceScheduleInfo[]
}
export type LiveAttendanceFeed = {
    staff_name: string,
    type: string,
    clocked_at: string,
    matchings: {
        by: string,
        info: string,
        matching_info: string
    }[]
}

export function useGetStaffDailyAttendance(id: number|string, params?: URLSearchParams) {
    return useConsoleSwr<MyDailyAttendance[]>(`/staff-attendance/staff/${id}/attendances?${params}`, authFetcher);
}

export function useGetStaffMonthlyAttendance(id: number|string, params?: URLSearchParams) {
    return useConsoleSwr<MyMonthlyAttendance[]>(`/staff-attendance/staff/${id}/monthly-attendances?${params}`, authFetcher);
}

export function useGetAttendanceDashboard(role: "admin" | "supervisor") {
    return useConsoleSwr<AttendanceDashboard>(`/staff-attendance/dashboard/${role}`, authFetcher);
}

export function useGetAttendanceDashboardLiveAttendance(role: "admin" | "supervisor") {
    return useConsoleSwr<LiveAttendanceFeed[]>(`/staff-attendance/dashboard/${role}/live-attendance`, authFetcher);
}

export function useGetManyWorkingBranchAttendance(params: URLSearchParams) {
    return useConsoleSwr<PaginationResponse<WokingBranchAttendance>>(`/staff-attendance/working-branch/listing?${params}`, authFetcher);
}

export function useGetWorkingBranchDailySummaryAttendance(params?: URLSearchParams) {
    return useConsoleSwr<WorkingBranchDailySummaryAttendance[]>(`/staff-attendance/working-branch/summary/daily?${params}`, authFetcher);
}

export function useGetWorkingBranchMonthlySummaryAttendance(params?: URLSearchParams) {
    return useConsoleSwr<WorkingBranchMonthlySummaryAttendance>(`/staff-attendance/working-branch/summary/monthly?${params}`, authFetcher);
}

export async function exportDailyAttendance(filter: DailyAttendanceExportFilter) {
    const res = await authApiRequestTempUrl<TempUrlResponse>(`/staff-attendance/working-branch/report/daily?${qs.stringify(filter)}`);
    window.open(`${res.temp_url}`, "_blank");
}

export async function exportMonthlyAttendance(filter: MonthlyAttendanceExportFilter) {
    const res = await authApiRequestTempUrl<TempUrlResponse>(`/staff-attendance/working-branch/report/monthly?${qs.stringify(filter)}`);
    window.open(`${res.temp_url}`, "_blank");
}