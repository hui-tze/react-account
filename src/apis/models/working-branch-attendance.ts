type WorkingBranchStatusSummary = {
    name: string,
    ordering: number,
    count: number,
}

type ClockInAndOutInfo = {
    schedule_id?: string,
    schedule_name?: string,
    attendance_id: number,
    time: string,
    status: string,
}

export type WokingBranchAttendance = {
    staff_id: number,
    staff_name: string,
    employee_id: string,
    designation: string,
    main_department: string,
    first_clock_in: ClockInAndOutInfo,
    last_clock_out: ClockInAndOutInfo,
}

export type WorkingBranchDailySummaryAttendance = {
    organization_id: number,
    organization_name: string,
    staff_count: number,
    has_valid_status_summaries: boolean,
    status_summaries: WorkingBranchStatusSummary[],
}

type StaffInfo = {
    type: "staff"|"organization";
    value: string;
};

export type CompliedAttendance = {
    type: string;
    staff_attendance_id: number;
    status: string;
}

export type SkippedAttendance = {
    assoc_schedule_id: number,
    reason: string,
}

type AttendanceInfo = {
    type: "compiled_attendance"|"skipped_attendance";
    value: CompliedAttendance|SkippedAttendance;
};

type StaffMonthlyData = {
    id: number;
    staff_id: number;
    value: (StaffInfo[] | AttendanceInfo[])[];
};

export type WorkingBranchMonthlySummaryAttendance = {
    headers: string[],
    rows: StaffMonthlyData[]
}
