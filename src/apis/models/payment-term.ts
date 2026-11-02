export const PAYMENT_TERM_TYPES = ["day", "month_end", "following_month"] as const;

export type PaymentTermType = typeof PAYMENT_TERM_TYPES[number];

export type PaymentTerm = {
    id: number,
    company_id: number,
    name: string,
    type: PaymentTermType,
    // used when type is "day": due N days after the invoice date
    days_before_due: number,
    // used when type is "following_month": due on this day of the next month
    day_in_following_month: number,
    status: string,
}
