import {BranchWithSubscription} from "./branch";
import {Avatar, DepartmentInfo, SubscriptionInfo} from "./user";

export type SuccessfulLoginResponse = {
    access_token: string,
    is_first_time_login: boolean,
    user: LoggedInUser,
    permissions: string[],
}

/** The user record of the accounting backend (GET /user). */
export type AccountUser = {
    id: number,
    name: string,
    email: string,
}

export type LoggedInUser = {
    id: number,
    is_owner: boolean,
    has_supervising_department: boolean,
    has_supervising_attendance_group: boolean,
    staff_id: number,
    name: string,
    avatar: Avatar|null,
    company_email: string,
    preferred_lang: string,
    department: DepartmentInfo,
    branch: BranchWithSubscription,
    subscription_info: SubscriptionInfo,
}
