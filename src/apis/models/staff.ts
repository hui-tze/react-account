import {IdentityType} from "@/constants/IdentityType";
import {Branch} from "./branch";
import {Department} from "./department";
import {Avatar} from "./user";
import {TaxStatusType} from "@/constants/TaxStatus";
import {ReligionType} from "@/constants/Religion";
import {PaymentType} from "@/constants/PaymentType";
import {RaceType} from "@/constants/Race";

export type Staff = {
    id: number,
    user_id: number,
    branch_id: number,
    working_branch_id: number,
    preferred_lang: string,
    name: string,
    gender: string,
    company_email: string,
    contact_no: string,
    employee_id: string,
    number_of_children: number,
    bank_name: string|null,
    bank_no: string|null,
    email: string|null,
    emergency_contact: string|null,
    emergency_contact_relationship: string|null,
    emergency_contact_number: string|null,
    status: string,
    current_employment_date: string,
    is_citizen: boolean,
    is_permanent_resident: boolean,
    is_foreigner: boolean,
    has_active_contract: boolean,
    active_contract_id: number,
    main_organization_id: number,
    main_organization_name: string,
    designation_id: number,
    designation_name: string,
    job_position_id: number,
    job_position_name: string,
    work_mode: string|null,
    employment_type: string|null,
    employment_status: string|null,
    contract_employment_date: string|null,
    avatar: Avatar|null,
};

export type StaffDetailInfo = {
    id: number,
    staff_id: number,
    dob: string,
    pob: string,
    marital_status: string,
    country: string,
    state: string,
    city: string,
    postcode: string,
    address: string,
    id_type: IdentityType,
    id_no: string,
    id_expiry_date: string|null,
    race: RaceType|null,
    immigration_number: string|null,
    religion: ReligionType|null,
    spouse_name: string|null,
    spouse_id_type: IdentityType|null,
    spouse_id_no: string|null,
    spouse_tin_no: string|null,
    spouse_contact_no: string|null,
    spouse_address: string|null,
    is_spouse_working: boolean|null,
    tax_deductible_child: number
}

export type StaffPayrollInfo = {
    id: number,
    staff_id: number,
    payment_type: PaymentType|null,
    branch_payout_bank_id: number|null,
}

export type StaffStatutoryInfo = {
    id: number,
    staff_id: number,
    epf_no: string|null,
    epf_initial: string|null,
    epf_nk: string|null,
    epf_is_borne_by_employer: boolean|null,
    sosco_category: string|null,
    sosco_no: string|null,
    sosco_employment_status: string|null,
    sosco_is_borne_by_employer: boolean|null,
    sosco_is_claim_employee_tax_relief: boolean|null,
    eis_is_borne_by_employer: boolean|null,
    tax_status: TaxStatusType|null,
    tax_no: string|null,
    tax_branch: string|null,
    tax_borne_by_employer: string|null,
    foreign_worker_levy: string|null,
    zakat_no: string|null,
    zakat_amount: string|null,
    tabung_haji_no: string|null,
    tabung_haji_amount: string|null,
    asn_no: string|null,
    asn_amount: string|null
}

export type StaffBankInfo = {
    id: number,
    staff_id: number,
    bank_id: number,
    bank_acc_no: string,
    beneficiary_name: string,
    ic_no: string,
    state: string,
    salary_percentage: string
}

export type SupervisingStaff = {
    id: number,
    name: string,
    gender: string,
    contact_no: string,
    country: string,
    state: string,
    city: string,
    postcode: string,
    emergency_contact: string|null,
    emergency_contact_relationship: string|null,
    emergency_contact_number: string|null,
    employee_id: string,
    branch_id: number,
    company_email: string,
    current_employment_date: string,
    status: string,
    active_contract_id: number,
    main_organization_id: number,
    main_organization_name: string,
    designation_id: number,
    designation_name: string,
    job_position_id: number,
    job_position_name: string,
    work_mode: string,
    employment_type: string,
    employment_status: string,
    contract_employment_date: string,
    avatar: Avatar|null,
    branch: Branch,
};

export type DesignationInfo = {
    id: number,
    branch_id: number,
    name: string,
    status: string,
}

export type DepartmentStaffInfo = {
    department: Department & {
        branch_id: number,
        parent_id: number,
        branch: Branch
    }
}

export type StaffJourneyInfo = {
    id: number,
    staff_id: number,
    name: string,
    type: string,
    date: string,
};

export type StaffEducationInfo = {
    id: number,
    staff_id: number,
    name: string,
    level: string,
    graduated_at: string,
};

export type StaffBasicInfo = {
    id: number,
    name: string,
    gender: string,
    contact_no: string,
    emergency_contact: string|null,
    emergency_contact_relationship: string|null,
    emergency_contact_number: string|null,
    employee_id: string,
    company_email: string,
    branch_id: number,
}

export type StaffBasicInfoWithAvatar = StaffBasicInfo & {
    avatar: Avatar|null
}