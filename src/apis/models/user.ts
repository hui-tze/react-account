import {Branch, BranchWithSubscription} from "./branch";
import {SelectOptionProps} from "./common";
import {StaffJourneyInfo, StaffEducationInfo} from "./staff";

export type UserInfo = {
    comp : {
        id: number,
        uid: string,
        code: string,
        name: string,
        status: string,
    },
    name: string,
    is_owner: boolean,
    has_supervising_department: boolean,
    has_supervising_attendance_group: boolean,
    identity_no: string,
    gender: string,
    company_email: string,
    contact_no: string,
    country: string,
    state: string,
    city: string,
    postcode: string,
    dob: string,
    pob: string,
    address: string,
    employee_id: string,
    work_mode: string|null,
    employment_type: string|null,
    employment_status: string|null,
    employment_date: string|null,
    contract_employment_date: string|null,
    salary: string|null,
    avatar: Avatar|null,
    marital_status: string,
    number_of_children: number,
    bank_name: string|null,
    bank_no: string|null,
    active_contract_id: number,
    main_organization_id: number,
    main_organization_name: string,
    main_designation_id: number,
    main_designation_name: string,
    email: string|null,
    emergency_contact: string|null,
    emergency_contact_relationship: string|null,
    emergency_contact_number: string|null,
    journeys: StaffJourneyInfo[],
    educations: StaffEducationInfo[],
    department: DepartmentInfo,
    preferred_lang: string,
    branch: BranchWithSubscription,
    subscription_info: SubscriptionInfo,
    permissions: string[],
};

export type DepartmentInfo = {
    id: number,
    staff_type: string,
    branch_id: number,
    parent_id: number,
    name: string,
    type: string,
    status: string,
}

export type SubscriptionInfo = {
    expire_at: string,
    storage_limit: number,
    is_attendance_enabled: boolean,
    is_leave_enabled: boolean,
    is_claim_enabled: boolean,
    is_comp_asset_enabled: boolean,
    is_task_enabled: boolean,
    is_payroll_enabled: boolean,
    is_terminated: boolean,
    is_expired: boolean,
}

export type User = {
    id: number,
    username: string,
    status: string,
};

export type UserOption = {
    id: number,
    staff: {
        name: string
    }
}

export type DeviceBind = {
    id: number,
    staff_id: number,
    meta: string,
    uid: string,
    created_at: string,
}

export type Avatar = {
    id: number,
    staff_id: number,
    type: string,
    name: string,
    temp_url: string,
}

export type UploadAvatarRequest = {
    name: string;
    path: string;
};

export type UpdatePasswordRequest = {
    password: string;
    password_confirmation: string;
};

export type SystemPrefRequest = {
    preferred_lang: string;
};

export function formatUserOption(user: UserOption): SelectOptionProps {
    return { value: user.id.toString(), label: user.staff?.name ?? '' };
}

