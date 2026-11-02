import {formatTime} from "@/utils/DateTimeFormatter";
import {SelectOptionProps} from "./common";
import moment from "moment";
import {parse} from "date-fns";

export type AttendanceSchedule = {
    id: number,
    branch_id: number,
    name: string,
    clock_in_time: string,
    clock_out_time: string,
    status: string,
    breaks: AttendanceScheduleBreak[],
}

export type AttendanceScheduleBreak = {
    id: number,
    schedule_id: number,
    type: "fixed"|"duration"|string,
    value: string,
}

export function formatScheduleOption(schedule: AttendanceSchedule): SelectOptionProps {
    const startTime = formatTime(parse(schedule.clock_in_time, "HH:mm:ss", new Date()));
    const endTime = formatTime(parse(schedule.clock_out_time, "HH:mm:ss", new Date()));
    return { value: schedule.id.toString(), label: schedule.name + ' (' + startTime + ' - ' + endTime + ')' };
}
