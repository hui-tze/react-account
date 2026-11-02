import {OperationType} from "@/constants/DecisionFlowConditionOperationType";
import {SelectOptionProps} from "./common"

export type SubmitTargetType = 'start-over'|'resume-from-last';
export type ReturnTargetType = 'origin'|'previous-step';

export type AutomationWorkflow = {
    id: number,
    staff_id: number,
    oa_id: number,
    resubmit_type: SubmitTargetType,
    return_type: ReturnTargetType,
    steps: WorkflowStepInfo[]
}

export type WorkflowStepInfo = {
    id: number,
    oa_snapshot_id: number,
    step: number,
    pics: WorkflowStepPicInfo[],
}

export type WorkflowStepPicInfo = {
    id: number,
    oa_snapshot_id: number,
    type: 'designation'|'organization'|'staff',
    value: number[],
}

export type DecisionFlowStartPicInfo = {
    id: number,
    branch_id: number,
    for_oa_type: "leave"|"claim",
    type: 'designation'|'organization'|'staff'|'all',
    value: number[],
    contract_scopes: ContractScope[],
}

export type DecisionFlowConditionInfo = {
    id: number,
    oa_assoc_id: number,
    type: string,
    operation: OperationType,
    value: string|null,
}

export type ContractScope = {
    type: 'employment-status',
    value: string[],
}

export type Workflow = {
    id: number,
    branch_id: number,
    name: string,
    current_snapshot_uid: string
}

export function formatWorkflowOption(flow: Workflow): SelectOptionProps {
    return { value: flow.id.toString(), label: flow.name };
}