import {Attachment} from "./attachment";

type MatchingInfo = {
    id: number,
    staff_attendance_id: number,
    by: string,
    info: string,
    matching_info: string,
}

export type MyDailyAttendance = {
    id: number,
    staff_id: number,
    assoc_schedule_id: number,
    attendance_group_type: string,
    for_schedule_type: string,
    type: string,
    mode: string,
    clocked_at: string,
    status: string,
    schedule_snapshot: {
        id: number,
        name: string,
        clock_in_time: string,
        clock_out_time: string,
    }
    threshold_snapshot: {
        id: number,
        late_clock_in_tolerance: number,
        absent_clock_in_tolerance: number,
        early_clock_out_tolerance: number,
        overtime_clock_out_tolerance: number,
    },
    matchings: MatchingInfo[],
    selfie: Attachment & {
        id: number,
        staff_attendance_id: number,
    }
}

export type MyMonthlyAttendance = {
    status: string,
    count: number,
    metas: {
        mode: string,
        date: string
    }[]
};
