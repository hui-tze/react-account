import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {PaginationResponse} from "../pagination";
import {JobPosition} from "../models/job-position";

export type JobPositionRequest = Omit<JobPosition, 'id'|'status'>

export function useGetAllJobPosition(params: URLSearchParams): SWRResponse<PaginationResponse<JobPosition>> {
    return useConsoleSwr(`/job-positions?${params}`, authFetcher);
}

export function useGetOneJobPosition(id: number|string, config?: SWRConfiguration): SWRResponse<JobPosition> {
    return useConsoleSwr(`/job-positions/${id}`, authFetcher, config);
}

export function useGetJobPositionOptions(branchId: number|string): SWRResponse<JobPosition[]> {
    return useConsoleSwr(`/job-positions/options?branch_id=${branchId}`, authFetcher);
}

export function addJobPosition(data: JobPositionRequest): Promise<void> {
    return authApiRequest("/job-positions").add(data).post();
}

export function updateJobPosition(id: number|string, data: JobPositionRequest): Promise<JobPosition> {
    return authApiRequest(`/job-positions/${id}`).add(data).put();
}
