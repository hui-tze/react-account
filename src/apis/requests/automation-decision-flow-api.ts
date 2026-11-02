import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {DecisionFlowConditionInfo, DecisionFlowStartPicInfo} from "../models/automation-workflow";
import {WorkflowDetails} from "./automation-workflow-api";

export type StartPicRequest = Omit<DecisionFlowStartPicInfo, 'id'|'branch_id'|'for_oa_type'>;
export type DecisionFlowDetails = {
    start_pics: DecisionFlowStartPicInfo[],
    assocs: {
        id: number,
        branch_id: number,
        oa_id: number,
        type: 'leave'|'claim',
        conditions: DecisionFlowConditionInfo[],
        oa: WorkflowDetails
    }[]
}
export type DecisionFlowAssocConditionRequest = Omit<DecisionFlowConditionInfo, 'id'|'oa_assoc_id'>;
export type DecisionFlowRequest = {
    start_pics: StartPicRequest[],
    assocs: {
        id: number,
        conditions: DecisionFlowAssocConditionRequest[],
    }[]
};

export function useGetApprovalDecisionFlow(workflowType: string, config?: SWRConfiguration) {
    return useConsoleSwr<DecisionFlowDetails>(`/oa/${workflowType}`, authFetcher, config);
}

export function updateApprovalDecisionFlow(workflowType: string, data: DecisionFlowRequest): Promise<[]> {
    return authApiRequest(`/oa/${workflowType}`).add(data).put();
}