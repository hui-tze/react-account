import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {Task, TaskWaypoint} from "../models/task";
import {Attachment} from "../models/attachment";
import { StaffBasicInfoWithAvatar } from "../models/staff";

export type TaskWaypointRequest = Omit<TaskWaypoint, 'id'|'task_id'>;
export type TaskWaypointProgressRequest = {
    comment: string,
    lat: string,
    lng: string,
    attachments: Omit<Attachment, 'temp_url'>[],
    temp: File[],
}
export type TaskWaypointProgressAttachment = Attachment & {
    id: number,
    task_waypoint_prog_id: number,
};
export type TaskProgress = {
    id: number,
    task_waypoint_id: number,
    staff_id: number,
    comment: string|null,
    lat: string,
    lng: string,
    created_at: string,
    updated_at: string,
    attachments: TaskWaypointProgressAttachment[]
}
export type TaskProgressDetail = TaskProgress & {
    staff: StaffBasicInfoWithAvatar
}
export type TaskWaypointDetail = TaskWaypoint & {
    progresses: TaskProgressDetail[],
}

export function useGetOneTaskWaypoint(id: number|string, config?: SWRConfiguration): SWRResponse<TaskWaypointDetail> {
    return useConsoleSwr(`/task-waypoints/${id}`, authFetcher, config);
}

export function updateTaskWaypoint(id: number|string, data: TaskWaypointRequest): Promise<TaskWaypoint> {
    return authApiRequest(`/task-waypoints/${id}`).add(data).put();
}

export function deleteTaskWaypoint(id: number|string): Promise<[]> {
    return authApiRequest(`/task-waypoints/${id}`).delete();
}

export function addTaskWaypointProgress(id: number|string, data: TaskWaypointProgressRequest): Promise<TaskProgress> {
    return authApiRequest(`/task-waypoints/${id}/add-progress`).add(data).post();
}

export function useGetOneTaskWaypointProgress(id: number|string, config?: SWRConfiguration): SWRResponse<TaskProgressDetail> {
    return useConsoleSwr(`/task-waypoint-progress/${id}`, authFetcher, config);
}

export function updateTaskWaypointProgress(id: number|string, data: TaskWaypointProgressRequest): Promise<TaskProgress> {
    return authApiRequest(`/task-waypoint-progress/${id}`).add(data).put();
}

export function deleteTaskWaypointProgress(id: number|string): Promise<[]> {
    return authApiRequest(`/task-waypoint-progress/${id}`).delete();
}