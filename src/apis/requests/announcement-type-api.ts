import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {PaginationResponse} from "../pagination";
import {AnnouncementType} from "../models/announcement";

export type AnnouncementTypeRequest = Omit<AnnouncementType, "id"|"branch_id">;
export type AnnouncementTypeOption = {
    label: string,
    value: string,
    color: string,
}

export function useGetAllAnnouncementType(params: URLSearchParams): SWRResponse<PaginationResponse<AnnouncementType>> {
    return useConsoleSwr(`/announcement-types?${params}`, authFetcher);
}

export function useGetOneAnnouncementType(id: number|string, config?: SWRConfiguration): SWRResponse<AnnouncementType> {
    return useConsoleSwr(`/announcement-types/${id}`, authFetcher, config);
}

export function useGetAnnouncementTypeOptions(): SWRResponse<AnnouncementTypeOption[]> {
    return useConsoleSwr(`/announcement-types/options`, authFetcher);
}

export function createAnnouncementType(data: AnnouncementTypeRequest): Promise<void> {
    return authApiRequest("/announcement-types").add(data).post();
}

export function editAnnouncementType(id: number|string, data: AnnouncementTypeRequest): Promise<AnnouncementType> {
    return authApiRequest(`/announcement-types/${id}`).add(data).put();
}

export function deleteAnnouncementType(id: number|string): Promise<[]> {
    return authApiRequest(`/announcement-types/${id}`).delete();
}