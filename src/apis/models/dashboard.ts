import {Announcement} from "./announcement";

export type StaffCountInfo = {
    total: number,
    employment_stat: {
        employment_type: {
            permanent: number,
            contract: number,
            "part-time": number,
        },
        employment_status: {
            probation: number,
            employed: number,
            resigned: number,
            retired: number,
            internship: number,
            terminated: number,
        },
    }
}

export type AdminDashboardInfo = {
    departments: number,
    staff: StaffCountInfo,
    contract: {
        total: number,
        stat: {
            active: number,
            expiring_soon: number,
        };
    },
    reminder: {
        pending_leave_applications: number,
        without_contract_staffs: number,
        expired_contract_staffs: number,
        without_supervisor_departments: number,
        without_attendance_group_staffs: number,
    }
};  

export type ManagerDashboardTodo = {
    todo: {
        pending_leave: number,
        expiring_soon_contract: number,
        long_no_record_staffs: number
    }
}

export type ManagerDashboardLeaveCalendar = {
    leave_calendar : {
        available_event_types: string[],
        events: {
            type: string,
            id: string,
            title: string,
            start: string,
            end: string,
            extendedProps: {}
        }[],
    }
}

export type ManagerDashboardDepartmentInfo = {
    upcoming_on_leave: number,
    pending_leave: number,
}

export type ManagerDashboardTeamOverview = {
    team_overview: {
        staff: StaffCountInfo,
        attendance_summary: {
            expected: number,
            actual: number,
            on_leave: number,
            on_partial_leave: number,
        }
    }
}

export type LeaveSummaryItem = {
    id: number,
    name: string,
    minimum_leave_unit: "day"|"half-day",
    hours_to_day_conversion: number,
    remaining_balance: number,
    expected_accrual_balance: number,
}
  
export type AttendanceInfo = {
    first_clock_in: string|null,
    last_clock_out: string|null,
    working_minutes: number,
    expected_working_minutes: number,
}
  
export type LeaveApplicationRecord = {
    id: number,
    start_at: string,
    end_at: string,
    conf_snapshot_code: string,
    conf_snapshot_name: string,
}

export type PendingRequest = {
    leave_application: {
        total: number,
        records: LeaveApplicationRecord[],
    },
    claim: {
        total: number,
        records: [],
    };
}

export type UpcomingBranchStaffOnLeave = LeaveApplicationRecord & {
    staff_id: number,
    staff_name: string,
    organization_id: number,
    organization_name: string,
    action_histories: [],
    workflow: null
}
  
export type PersonalDashboardInfo = {
    leave_summary: LeaveSummaryItem[],
    attendance_info: AttendanceInfo|null,
    upcoming_holiday: {
        id: number,
        branch_id: number,
        uid: string,
        title: string,
        category: 'holiday'|'peak',
        recurring_uid: string,
        type: 'all-day'|'time-range',
        start_date: string,
        start_time: string|null,
        start_at: string,
        end_date: string,
        end_time: string|null,
        end_at: string,
        multiplier: string,
    }[],
    branch_staffs_upcoming_leave: UpcomingBranchStaffOnLeave[],
    upcoming_leave: LeaveApplicationRecord[],
    pending_request: PendingRequest,
    announcements: Announcement[],
}

export type ChartDataInfo = {
    label: string[],
    data: number[],
}