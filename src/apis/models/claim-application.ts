import {DynamicFieldDetails} from "../requests/claim-category-api";
import {Attachment} from "./attachment";
import {AutomationWorkflow} from "./automation-workflow"
import {DynamicField} from "./claim-type"
import {Avatar} from "./user"

export type ValidatedField = DynamicField & {
    uid: string,
    value: string
};

export type ClaimApplication = {
    id: number,
    reference_no: string,
    workflow_id: number,
    staff_id: number,
    claim_id: number,
    claim_name: string,
    claim_per_req_quota: number,
    claim_monthly_quota: number,
    claim_yearly_quota: number,
    monthly_consumption_snapshot: string,
    yearly_consumption_snapshot:string,
    monthly_quota_consumed: string,
    yearly_quota_consumed: string,
    claim_category_id: number,
    claim_category: string,
    claim_sub_category: string,
    title: string,
    receipt_no: string,
    receipt_date: string,
    receipt_amount: string,
    reimbursement_amount: string,
    reimbursable_amount: string,
    remarks: string,
    dyn_form_uid: string,
    validated_fields: ValidatedField[],
    sub_dyn_form_batch_uid: string,
    sub_dyn_form_uid: string,
    sub_validated_fields: ValidatedField[],
    status: string,
    created_at: string,
    updated_at: string,
    staff: ClaimApplicationStaffInfo,
}

type StepPic = {
    id: number,
    name: string,
}

export type ClaimAttachment = Attachment & {
    id: number,
    claim_application_id: number,
}

export type ClaimActions = 'submit'|'edit'|'remove'|'cancel'|'reject'|'approve'|'return'|'resubmit';
export type ClaimApplicationDetails = ClaimApplication & {
    designation_pics: StepPic[],
    department_pics: StepPic[],
    department_supervisor_pics: StepPic[],
    staff_pics: StepPic[],
    actions: ClaimActions[],
    staff: ClaimApplicationStaffInfo,
    attachments: ClaimAttachment[],
    workflow: ClaimApplicationWorkflowInfo,
    dyn_form: {
        id: number,
        claim_id: number,
        uid: string,
        fields: DynamicFieldDetails[]
    }
}

export type ClaimApplicationWorkflowInfo = {
    id: number,
    type: "claim",
    oa_snapshot_id: number,
    oa_step_id: number,
    propagation_step: string|null,
    resume_oa_step_id: number|null,
    resume_propagation_step: string|null,
    action_histories: {
        id: number,
        workflow_id: number,
        staff_id: number,
        oa_step_id: number|null,
        propagation_step: string|null,
        comment: string|null,
        action: string,
        created_at: string,
        staff_name: string,
    }[],
    oa_snapshot: Omit<AutomationWorkflow, 'steps'> & {
        uid: string
    },
}

export type ClaimApplicationStaffInfo = {
    id: number,
    name: string,
    gender: string,
    contact_no: string,
    emergency_contact: string,
    emergency_contact_relationship: string,
    emergency_contact_number: string,
    employee_id: string,
    company_email: string,
    branch_id: number,
    current_employment_date: string,
    avatar: Avatar|null,
}

export type ClaimApplicationScheduleInfo = {
    id: number,
    leave_application_id: number,
    schedule_id: number,
    schedule_snapshot_uid: string,
    name: string,
    clock_in_time: string,
    clock_out_time: string,
    is_next_day: boolean,
    cover_type: string,
    assoc_staff_id: number,
    schedule_local_date: string,
    schedule_start_at: string,
    schedule_end_at: string,
    start_at: string,
    end_at: string,
    breaks: ClaimApplicationScheduleBreakInfo[],
}

export type ClaimApplicationScheduleBreakInfo = {
    id: number,
    leave_application_schedule_id: number,
    type: string,
    timezone: string,
    schedule_date: string,
    start_time: string|null,
    end_time: string|null,
    start_at: string|null,
    end_at: string|null,
    is_capped: boolean,
    duration: number
}