import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {PaginationResponse} from "../pagination";
import {AutomationWorkflow, ReturnTargetType, SubmitTargetType, Workflow, WorkflowStepPicInfo} from "../models/automation-workflow";

export type WorkflowStepPicRequest = Omit<WorkflowStepPicInfo, 'id'|'oa_snapshot_id'>;
export type WorkflowRequest = {
    name: string,
    resubmit_type: SubmitTargetType,
    return_type: ReturnTargetType,
    steps: {
        step_pics: WorkflowStepPicRequest[],
    }[],
};
export type WorkflowDetails = Workflow & {
    current_snapshot_uid: string,
    current_snapshot: AutomationWorkflow
}

export function useGetAllWorkflow(): SWRResponse<Workflow[]> {
    return useConsoleSwr(`/oa/wf/all`, authFetcher);
}

export function useGetManyWorkflow(params?: URLSearchParams): SWRResponse<PaginationResponse<Workflow>> {
    return useConsoleSwr(`/oa/wf?${params}`, authFetcher);
}

export function useGetOneWofkflow(id: number|string, config?: SWRConfiguration): SWRResponse<WorkflowDetails> {
    return useConsoleSwr(`/oa/wf/${id}`, authFetcher, config);
}

export function createWorkflow(data: WorkflowRequest): Promise<void> {
    return authApiRequest("/oa/wf").add(data).post();
}

export function updateWorkflow(id: number|string, data: WorkflowRequest): Promise<WorkflowDetails> {
    return authApiRequest(`/oa/wf/${id}`).add(data).put();
}

export function deleteWorkflow(id: number|string): Promise<[]> {
    return authApiRequest(`/oa/wf/${id}`).delete();
}
