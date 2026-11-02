import {Attachment} from "./attachment";
import {StaffBasicInfoWithAvatar} from "./staff";

export type TaskAttachment = Attachment & {
    id: number,
    task_id: number,
};

export type TaskAudit = {
    id: number,
    type: string,
    task_id: number,
    staff_id: number,
    description: string,
    created_at: string,
    staff: StaffBasicInfoWithAvatar,
}

export type Task = {
    id: number,
    branch_id: number,
    staff_id: number,
    priority: string,
    priority_no: number,
    name: string,
    description: string,
    start_time: string|null,
    end_time: string,
    progress_remarks: string,
    status: string,
}

export type TaskWaypoint = {
    id: number|null,
    task_id: number,
    name: string,
    start_at: string|null,
    end_at: string,
    lat: string,
    lng: string
}