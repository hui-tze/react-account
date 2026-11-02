import type {PaymentTerm} from "@/apis/models/payment-term";

const pad = (n: number) => String(n).padStart(2, "0");
const toIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/**
 * Due date of a document dated `date` (YYYY-MM-DD) under a payment term.
 * Mirror of SalesLookupService::dueDate — the backend recomputes it on save.
 */
export function dueDateOf(term: Pick<PaymentTerm, "type" | "days_before_due" | "day_in_following_month"> | null | undefined, date: string): string {
    const [y, m, d] = date.slice(0, 10).split("-").map(Number);
    if (!y || !m || !d) {
        return date;
    }

    switch (term?.type) {
        case "day":
            return toIso(new Date(y, m - 1, d + Math.max(0, Number(term.days_before_due) || 0)));
        case "month_end":
            return toIso(new Date(y, m, 0));
        case "following_month": {
            // day 31 in a 30-day month falls on the month's last day
            const daysInNext = new Date(y, m + 1, 0).getDate();
            const day = Math.min(Math.max(1, Number(term.day_in_following_month) || 1), daysInNext);
            return toIso(new Date(y, m, day));
        }
        default:
            return toIso(new Date(y, m - 1, d));
    }
}
