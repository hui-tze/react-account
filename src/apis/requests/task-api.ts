import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {Staff, StaffBasicInfoWithAvatar} from "../models/staff";
import {PaginationResponse} from "../pagination";
import {Task, TaskAttachment, TaskAudit, TaskWaypoint} from "../models/task";
import {Attachment} from "../models/attachment";
import {TaskWaypointDetail, TaskWaypointRequest} from "./task-waypoint-api";

export type TaskReminderRequest = {
    duration: number,
    conversion_unit: string,
}
export type TaskReminder = {
    id: number,
    task_id: number,
    conversion_unit: string,
    remind_before_minutes: number,
}
export type WaypointRequest = TaskWaypointRequest & {
    waypoint_id: number|null
}
export type TaskRequest = Omit<Task, 'id'|'branch_id'|'priority_no'|'staff_id'|'progress_remarks'|'status'> & {
    pic_ids: number[],
    staff_ids: number[],
    reminders: TaskReminderRequest[],
    attachments: Omit<Attachment, 'temp_url'>[],
    temp: File[],
    waypoints: WaypointRequest[]
};
export type TaskList = Task & {
    reminders_count: number,
    attachments_count: number,
    comments_count: number
    staffs: Staff[],
}
export type TaskComment = {
    id: number,
    task_id: number,
    staff_id: number,
    comment: string,
    created_at: string,
    staff: StaffBasicInfoWithAvatar
}
type TaskActions = 'revert-completed'|'set-completed'|'edit-task'|'update-task-progress'|
    'update-waypoint'|'delete-waypoint'|'add-waypoint'|'add-comment'|'add-waypoint-progress';
export type TaskDetail = Task & {
    actions: TaskActions,
    pics: Staff[],
    staffs: Staff[],
    attachments: TaskAttachment[],
    audits: TaskAudit[],
    reminders: TaskReminder[],
    waypoints: TaskWaypoint[],
    comments: TaskComment[]
}
export type TaskCommentRequest = {
    comment: string
}

export function useGetAllTask(params: URLSearchParams): SWRResponse<PaginationResponse<TaskList>> {
    return useConsoleSwr(`/tasks?${params}`, authFetcher);
}

export function useGetOneTask(id: number|string, config?: SWRConfiguration): SWRResponse<TaskDetail> {
    return useConsoleSwr(`/tasks/${id}`, authFetcher, config);
}

export function useGetMyTask(params: URLSearchParams): SWRResponse<PaginationResponse<Task>> {
    return useConsoleSwr(`/tasks/me?${params}`, authFetcher);
}

export function useGetTaskCreatedByMe(params: URLSearchParams): SWRResponse<PaginationResponse<Task>> {
    return useConsoleSwr(`/tasks/me/created?${params}`, authFetcher);
}

export function createTask(data: TaskRequest): Promise<TaskDetail> {
    return authApiRequest("/tasks").add(data).post();
}

export function updateTask(id: number|string, data: TaskRequest): Promise<TaskDetail> {
    return authApiRequest(`/tasks/${id}`).add(data).put();
}

export function useSetTaskCompleted(id: number|string): Promise<[]> {
    return authApiRequest(`/tasks/${id}/set-completed`).put();
}

export function useRevertTaskCompleted(id: number|string): Promise<[]> {
    return authApiRequest(`/tasks/${id}/revert-completed`).put();
}

export function addTaskComment(id: number|string, data: TaskCommentRequest): Promise<[]> {
    return authApiRequest(`/tasks/${id}/add-comment`).add(data).post();
}

export function addTaskWaypoint(id: number|string, data: TaskWaypointRequest): Promise<[]> {
    return authApiRequest(`/tasks/${id}/add-waypoint`).add(data).post();
}

export function useGetTaskAllWaypoint(id: number|string, config?: SWRConfiguration): SWRResponse<TaskWaypointDetail[]> {
    return useConsoleSwr(`/tasks/${id}/waypoints`, authFetcher, config);
}