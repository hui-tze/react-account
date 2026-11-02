import {AutomationWorkflow} from "./automation-workflow"
import {Avatar} from "./user"

export type LeaveApplication = {
    id: number,
    workflow_id: number,
    staff_id: number,
    request_value: string,
    orig_consume_balance: number,
    consume_balance: number,
    remarks: string,
    start_at: string,
    end_at: string,
    orig_start_at: string,
    orig_end_at: string,
    status: string,
    approved_at: string|null,
    cancelled_at: string|null,
    leave_conf_id: number,
    conf_snapshot_code: string,
    conf_snapshot_name: string,
    conf_snapshot_minimum_leave_unit: string,
    conf_snapshot_hours_to_day_conversion: number,
    created_at: string,
    updated_at: string,
}

export type LeaveApplicationWorkflowInfo = {
    id: number,
    type: "leave",
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

export type LeaveApplicationStaffInfo = {
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

export type LeaveApplicationScheduleInfo = {
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
    breaks: LeaveApplicationScheduleBreakInfo[],
}

export type LeaveApplicationScheduleBreakInfo = {
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