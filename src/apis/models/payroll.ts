import {Avatar} from "./user"

export type Payroll = {
    uid: string,
    result: {
        version: string,
        target_start_date_local: string,
        target_end_date_local: string,
        branch_name: string,
        timezone: string,
        exclusions: [],
        slips: PayrollSlip[]
    }
}

export type PayrollSlip = {
    staff_id: number,
    staff_id_no: string,
    staff_name: string,
    employee_no: string,
    contract_wage_type: string,
    contract_title: string,
    contract_department_name: string,
    basic_salary: string,
    working_days: string,
    allowances: PayrollItem[],
    deductions: PayrollItem[],
    upls: PayrollItem[],
    employer_debts: PayrollItem[],
    overtimes: PayrollItem[],
    sum_allowance: string,
    sum_gross_pay: string,
    sum_deduction: string,
    sum_upl: string,
    sum_gross_dedt: string,
    net_pay: string
}

export type PayrollRelatedStaff = {
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
    avatar: Avatar|null,
}

export type PayrollItem = {
    name: string,
    value: string,
}