export type LeaveExclusionEvent = {
    id: number,
    leave_conf_id: number,
    uid: string,
    title: string,
    category: 'holiday'|'peak',
    recurring_uid: string,
    type: 'all-day'|'time-range',
    start_date: string,
    start_time: string|null,
    start_at: string,
    end_date: string,
    end_time: string|null,
    end_at: string,
    multiplier: string,
    recurring: {
        uid: string,
        type: 'none'|'yearly'|'monthly'|'weekly'|'daily',
        until_date: string,
    } | null,
}

export type PublicHoliday = {
    date: string,
    full_date: string,
    day_of_week: string,
    holiday_name: string,
    is_mandatory: boolean
}

export type SubscribedHoliday = {
    id: number,
    is_auto: boolean,
    branch_id: number,
    country: string,
    state: string
}