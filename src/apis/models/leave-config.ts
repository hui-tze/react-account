import {SelectOptionProps} from "./common";

export type LeaveConfig = {
    id: number,
    branch_id: number,
    code: string,
    name: string,
    minimum_leave_unit: 'day'|'half-day'|'hour'|'minute',
    hours_to_day_conversion: number,
    grant_cycle: 'annually',
    grant_cycle_start_type: 'employment-date'|'specific-date'|'specific-date-monthly',
    grant_cycle_start_at: string|null,
    grant_frequency: 'cycle-start'|'monthly'|'daily',
    accrual_type: 'seniority'|'fixed',
    is_active: boolean,
    is_paid: boolean,
    is_allow_negative: boolean,
    is_reason_required: boolean,
    is_attachment_required: boolean,
    is_allow_emergency: boolean,
    is_required_document_enabled: boolean,
    required_document_days: number|null,
}

export type AccuralsInfo = {
    id: number,
    leave_conf_id: number,
    from_months: number,
    initial_balance: number,
    carry_over_balance: number,
    carry_over_validity: number,
};

export type AppliedScopesInfo = {
    id: number,
    leave_conf_id: number,
    type: 'designation'|'staff'|'gender'|'all',
    filter: 'include'|'exclude',
    value: string[],
}

export type ThresholdsInfo = {
    id: number,
    leave_conf_id: number,
    larger_than_days: number,
    in_advance_days: number,
}

export type LeaveAdjustmentStaffInfo = {
    leave_bal_id: number,
    staff_id: number,
    staff_name: string,
    balance: number,
    total_carried_balance: number,
    adjustable_balance: number
}

export function formatLeaveConfigOption(leaveConfig: LeaveConfig): SelectOptionProps {
    return { value: leaveConfig.id.toString(), label: leaveConfig.name};
}
export interface AdjustmentStaffSelectOption extends SelectOptionProps<string> {
    balance: number;
}
export function formatLeaveAdjustmentStaffOption(staff: LeaveAdjustmentStaffInfo): AdjustmentStaffSelectOption {
    return { value: staff.staff_id.toString(), label: staff.staff_name, balance: staff.balance };
}