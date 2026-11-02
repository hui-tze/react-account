import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {PaginationResponse} from "../pagination";
import {Announcement, AnnouncementType} from "../models/announcement";
import {TargetAudienceType} from "@/constants/TargetAudienceType";
import {StaffBasicInfoWithAvatar} from "../models/staff";

export type AnnouncementRequest = Omit<Announcement, "id"|"branch_id"|"content_preview"|"start_at"|"end_at"> & {
    assoc_type_ids: number[],
    content: string,
    scopes: {
        type: TargetAudienceType,
        value: number[],
    }[],
    uploads: {
        name: string,
        path: string,
    }[]
};
export type TagInfo = Omit<AnnouncementType, "branch_id"> & {
    branch_announcement_id: number,
    assoc_type_id: number,
};
export type UploadInfo = {
    id: number,
    branch_announcement_id: number,
    name: string,
    path: string,
    size: number,
    temp_url: string,
}
export type MyAnnouncementDetails = Announcement & {
    content: string,
    tags: TagInfo[],
    uploads: UploadInfo[],
}
export type AnnouncementDetails = MyAnnouncementDetails & {
    send_scopes: {
        id: number,
        branch_announcement_id: number,
        type: TargetAudienceType,
        value: number[],
    }[],
    receiving_staffs: StaffBasicInfoWithAvatar[],
}

export function useGetAllAnnouncement(params: URLSearchParams): SWRResponse<PaginationResponse<Announcement>> {
    return useConsoleSwr(`/announcements?${params}`, authFetcher);
}

export function useGetOneAnnouncement(id: number|string, config?: SWRConfiguration): SWRResponse<AnnouncementDetails> {
    return useConsoleSwr(`/announcements/${id}`, authFetcher, config);
}

export function createAnnouncement(data: AnnouncementRequest): Promise<void> {
    return authApiRequest("/announcements").add(data).post();
}

export function updateAnnouncement(id: number|string, data: AnnouncementRequest): Promise<Announcement> {
    return authApiRequest(`/announcements/${id}`).add(data).put();
}

export function deleteAnnouncement(id: number|string): Promise<[]> {
    return authApiRequest(`/announcements/${id}`).delete();
}

export function useGetAllMyAnnouncement(params: URLSearchParams): SWRResponse<PaginationResponse<Announcement>> {
    return useConsoleSwr(`/announcements/me?${params}`, authFetcher);
}

export function useGetOneMyAnnouncement(id: number|string, config?: SWRConfiguration): SWRResponse<MyAnnouncementDetails> {
    return useConsoleSwr(`/announcements/me/${id}`, authFetcher, config);
}
