import {AttendanceSchedule} from "./attendance-schedule";

export type FestiveWorkHour = {
    id: number,
    branch_id: number,
    name: string,
    for_date: string,
    offset_left: number,
    offset_right: number,
    remarks: string,
    schedules: AttendanceSchedule[],
}