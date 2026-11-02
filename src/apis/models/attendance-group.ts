import {AttendanceSchedule} from "@/apis/models/attendance-schedule";

export type AttendanceGroup = {
    id: number,
    branch_id: number,
    name: string,
    outstation_enabled: boolean,
    camera_enabled: boolean,
    is_offline_enabled: boolean,
    clock_interval: number,
    has_auto_clock_out: boolean,
    auto_clock_out_minutes: number|null,
    status: string,
};

export type AttendanceGroupWithConfig = AttendanceGroup & (AttendanceGroupFixed|AttendanceGroupShift|AttendanceGroupFlexible);

export type AttendanceGroupWifi = {
    id: number,
    attendance_group_id: number,
    ssid: string,
    name: string,
}

export type AttendanceGroupLocation = {
    id: number,
    attendance_group_id: number,
    name: string,
    address: string,
    lat: string,
    lng: string,
    radius: string,
}

export type AttendanceGroupFixed = {
    type: "fixed",
    fixed_detail: AttendanceGroupFixedDetail,
}

export type AttendanceGroupShift = {
    type: "shift",
    shift_detail: AttendanceGroupShiftDetail,
}

export type AttendanceGroupFlexible = {
    type: "flexible",
    flexible_detail: AttendanceGroupFlexibleDetail,
}

export type AttendanceGroupShiftDetail = {
    id: number,
    attendance_group_id: number,
    late_clock_in_tolerance: number,
    early_clock_out_tolerance: number,
    absent_clock_in_tolerance: number,
    overtime_clock_out_tolerance: number,
}

export type AttendanceGroupFixedDetail = AttendanceGroupShiftDetail & {
    configs: AttendanceGroupFixedConfig[],
}

export type AttendanceGroupFlexibleDetail = {
    id: number,
    attendance_group_id: number,
    expected_minutes_display_unit: string,
    expected_minutes: number,
    range: "daily"|"weekly"|"monthly"
}

export type AttendanceGroupFixedConfig = {
    id: number,
    attendance_group_fixed_id: number,
    day: number,
    schedule_id?: number|null, // when schedule_id is null or using null when create config, it is effectively interpreted as no work that day
    schedule?: AttendanceSchedule,
}

export type AttendanceGroupOrganizationConflict = {
    id: number,
    conflicted_group_id: number,
    conflicted_group_name: string,
    organization_id: number,
    organization_name: string,
}

export type AttendanceGroupOrganizationStaffConflict = AttendanceGroupOrganizationConflict & {
    staff_id: number,
    staff_name: string,
}

export type AttendanceGroupStaff = {
    id: number,
    name: string,
    main_department: string,
}

export type ShiftScheduleInfo = {
    id: number,
    attendance_group_shift_arrangement_id: number,
    assoc_schedule_id: number,
};

export type ShiftScheduleDetail = ShiftScheduleInfo & {
    schedule: AttendanceSchedule
};

export type AttendanceGroupShiftArrangement = {
    id: number,
    assoc_attendance_group_shift_id: number,
    staff_id: number,
    date: string,
};