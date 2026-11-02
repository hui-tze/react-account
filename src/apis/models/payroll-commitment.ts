import {PayFrequencyType} from "@/constants/ContractPayFrequency"
import {PayrollRelatedStaff, PayrollSlip} from "./payroll"

export type PayrollCommitment = {
    id: number,
    branch_id: number,
    description: string,
    snapshot_branch_name: string,
    type: PayFrequencyType,
    range_segment: number,
    exclusions: [],
    year: number,
    month: number,
    start_date: string,
    end_date: string,
    status: string,
    created_at: string,
    staff_count: number
}

export type PayrollCommitmentDetails = PayrollCommitment & {
    histories: PayrollCommitmentHistory[],
    related_payrolls: {
        id: number,
        payroll_commitment_id: number,
        staff_id: number,
        start_date: string,
        end_date: string,
        slip_type: string,
        slip_template: string,
        data: PayrollSlip
    }[],
    print_links: PayrollPrintLinks
}

export type PayrollCommitmentHistory = {
    id: number,
    payroll_commitment_id: number,
    staff_id: number,
    action: string,
    created_at: string,
    staff: PayrollRelatedStaff,
}

export type PayrollPrintLinks = {
    eis: {
        monthly_listing: string,
    },
    epf: {
        borang_a: string,
        monthly_listing: string,
    }
    sosco: {
        borang_8a: string,
        monthly_listing: string,
    }
}