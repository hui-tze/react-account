import {authFetcher, useConsoleSwr} from "@/lib/request-client/client";

/** Figures are in home currency. A panel is null when the user's role may not view its module. */
export type DashboardSummary = {
    as_of: string,
    currency: string | null,
    period: {from: string, to: string, fiscal_year: boolean},
    receivables: Receivables | null,
    payables: Payables | null,
    banks: Banks | null,
    profit: Profit | null,
};

export type AgeingBucket = "current" | "1_30" | "31_60" | "61_90" | "over_90";

export type OpenDocument = {
    id: number,
    trans_type: string,
    reference_no: string,
    supplier_invoice_no: string | null,
    party_name: string | null,
    due_date: string | null,
    days_overdue: number,
    amount: number,
};

type OpenSummary = {
    total: number,
    count: number,
    overdue: number,
    overdue_count: number,
    ageing: Record<AgeingBucket, number>,
    most_overdue: OpenDocument[],
    unapplied_credits: number,
};

export type Receivables = OpenSummary & {
    top_customers: {id: number, name: string, amount: number}[],
};

export type Payables = OpenSummary & {
    due_7_days: number,
    due_7_days_count: number,
    upcoming: OpenDocument[],
};

export type Banks = {
    total: number,
    unconverted_currencies: string[],
    accounts: {
        id: number,
        account_name: string,
        account_number: string | null,
        type: string,
        currency_code: string | null,
        balance: number,
        unreconciled_count: number,
        last_reconciled_at: string | null,
    }[],
    cash_flow: {month: string, in: number, out: number}[],
};

export type ProfitFigures = {income: number, expenses: number, net: number};

export type Profit = {
    year_to_date: ProfitFigures,
    this_month: ProfitFigures,
    last_month: ProfitFigures,
    monthly: (ProfitFigures & {month: string})[],
};

export function useDashboard() {
    return useConsoleSwr<DashboardSummary>(`/dashboard`, authFetcher, {
        revalidateOnFocus: false,
        // keep the figures current while the dashboard stays open
        refreshInterval: 5 * 60 * 1000,
    });
}
