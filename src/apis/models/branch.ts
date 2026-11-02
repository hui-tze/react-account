export type BranchSettings = {
    hour_format: "12hr"|"24hr",
    staff_leave_sharing_level: "all"|"same-department"|"none",
}

export type Branch = BranchSettings & {
    id: number,
    company_id: number,
    name: string,
    type: string,
    email: string,
    contact_no: string,
    country: string,
    state: string,
    city: string,
    postcode: string,
    address: string,
    timezone: string,
    status: string,
    is_subscription_active: boolean,
    is_attendance_schedule_enabled: boolean,
};

export type BranchWithSubscription = Branch & {
    subscription: {
        id: number,
        branch_id: number,
        sales_package_id: number,
        is_terminated: boolean,
        pax: number,
        start_at: string,
        expire_at: string,
        sales_package: {
            id: number,
            name: string,
            remarks: string,
            price_per_pax: string,
            is_active: boolean,
            storage_limit: number,
            is_attendance_enb: boolean,
            is_leave_enb: boolean,
            is_claim_enb: boolean,
        }
    }
}
