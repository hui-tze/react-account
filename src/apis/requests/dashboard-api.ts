import {authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {AdminDashboardInfo, LeaveApplicationRecord, ManagerDashboardDepartmentInfo, ManagerDashboardLeaveCalendar, ManagerDashboardTeamOverview, ManagerDashboardTodo, PersonalDashboardInfo} from "../models/dashboard";
import {Department} from "../models/department";
import {Avatar} from "../models/user";
import {Contract} from "../models/payroll-contract";
import {StaffBasicInfo, StaffBasicInfoWithAvatar} from "../models/staff";

export type ExpiredContractStaffInfo = StaffBasicInfo & {
    last_expired_contract: {
        id: number,
        staff_id: number,
        status: string,
        title: string,
        start_date: string,
        end_date: string,
    }
}
export type WithoutSupervisingDepartmentRecord = Department & {
    branch_id: number,
    parent_id: number,
}
export type ManagerDashboardExpiringSoonContractInfo = StaffBasicInfoWithAvatar & {
    active_contract: Contract,
}
export type GetStartedInfo = {
    slug: string,
    is_done: boolean
}

export function useGetAdminDashboardData(config?: SWRConfiguration): SWRResponse<AdminDashboardInfo> {
    return useConsoleSwr(`/dashboard/admin`, authFetcher, config);
}

export function useGetManagerTodo() {
    return useConsoleSwr<ManagerDashboardTodo>(`/dashboard/manager/todo`, authFetcher);
}

export function useGetManagerLeaveCalendar(params?: URLSearchParams) {
    return useConsoleSwr<ManagerDashboardLeaveCalendar>(`/dashboard/manager/leave-calendar?${params}`, authFetcher);
}

export function useGetManagerOrganizationInfo(params?: URLSearchParams) {
    return useConsoleSwr<ManagerDashboardDepartmentInfo>(`/dashboard/manager/organization-info?${params}`, authFetcher);
}

export function useGetManagerTeamOverview(params?: URLSearchParams) {
    return useConsoleSwr<ManagerDashboardTeamOverview>(`/dashboard/manager/team-overview?${params}`, authFetcher);
}

export function useGetPersonalDashboardData(config?: SWRConfiguration): SWRResponse<PersonalDashboardInfo> {
    return useConsoleSwr(`/dashboard/me`, authFetcher, config);
}

export function useGetAdminDashboardLongPendingLeaveApplication(params?: URLSearchParams) {
    return useConsoleSwr<LeaveApplicationRecord[]>(`/dashboard/admin/pending-leaves?${params}`, authFetcher);
}

export function useGetAdminDashboardWithoutContractStaff(params?: URLSearchParams) {
    return useConsoleSwr<StaffBasicInfo[]>(`/dashboard/admin/without-contract-staffs?${params}`, authFetcher);
}

export function useGetAdminDashboardExpiredContractStaff(params?: URLSearchParams) {
    return useConsoleSwr<ExpiredContractStaffInfo[]>(`/dashboard/admin/expired-contract-staffs?${params}`, authFetcher);
}

export function useGetAdminDashboardWithoutSupervisingDepartment(params?: URLSearchParams) {
    return useConsoleSwr<WithoutSupervisingDepartmentRecord[]>(`/dashboard/admin/without-supervisor-departments?${params}`, authFetcher);
}

export function useGetAdminDashboardWithoutAttendanceGroupStaff(params?: URLSearchParams) {
    return useConsoleSwr<StaffBasicInfo[]>(`/dashboard/admin/without-attendance-group-staffs?${params}`, authFetcher);
}

export function useGetManagerDashboardExpiringSoonContract(params?: URLSearchParams) {
    return useConsoleSwr<ManagerDashboardExpiringSoonContractInfo[]>(`/dashboard/manager/todo/expiring-soon-contracts?${params}`, authFetcher);
}

export function useGetManagerDashboardLongNoRecordStaff(params?: URLSearchParams) {
    return useConsoleSwr<StaffBasicInfoWithAvatar[]>(`/dashboard/manager/todo/long-no-record-staffs?${params}`, authFetcher);
}

export function useGetPersonalDashboardLongPendingLeaveApplication(params?: URLSearchParams) {
    return useConsoleSwr<LeaveApplicationRecord[]>(`/dashboard/me/pending-leaves`, authFetcher);
}

export function useGetStarted() {
    return useConsoleSwr<GetStartedInfo[]>(`/dashboard/get-started`, authFetcher);
}