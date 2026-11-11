import type {SWRConfiguration, SWRResponse} from "swr";
import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {PaginationResponse} from "@/apis/pagination";
import type {DimensionTag} from "@/apis/models/dimension";
import type {
    BalanceSheetReport,
    ChartOfAccountsReport,
    Journal,
    JournalDetail,
    LedgerEntry,
    LedgerSummary,
    ProfitLossReport,
    TaxDetailRow,
    TaxSummaryReport,
    TrialBalanceReport,
} from "@/apis/models/ledger";

type Id = number | string;

// reports: only fetch once the required dates are known
const query = (params: Record<string, string | number | boolean | null | undefined>) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== "" && v !== false) {
            q.set(k, String(v));
        }
    });
    return q.toString();
};

export type JournalLineRequest = {account_id: number | null, memo: string | null, debit: number | null, credit: number | null, dimensions: DimensionTag[]};
export type JournalRequest = {
    // blank: generated from Document No
    reference_no: string | null,
    journal_date: string,
    source_reference: string | null,
    remarks: string | null,
    lines: JournalLineRequest[],
};

export const ledgerApi = {
    // listing table — always sends `page`; with account_id the response also has `summary`
    useEntries(params: URLSearchParams): SWRResponse<PaginationResponse<LedgerEntry> & {summary: LedgerSummary | null}> {
        return useConsoleSwr(`/gl/entries?${params}`, authFetcher);
    },
    useTransTypes(): SWRResponse<{value: string, label: string}[]> {
        return useConsoleSwr("/gl/trans-types", authFetcher, {revalidateOnFocus: false});
    },
    useChart(asOf: string | null): SWRResponse<ChartOfAccountsReport> {
        return useConsoleSwr(`/gl/chart?${query({as_of: asOf})}`, authFetcher, {revalidateOnFocus: false});
    },
    useTrialBalance(from: string | null, to: string | null, showZero: boolean): SWRResponse<TrialBalanceReport> {
        return useConsoleSwr(to ? `/gl/trial-balance?${query({date_from: from, date_to: to, show_zero: showZero ? 1 : null})}` : null,
            authFetcher, {revalidateOnFocus: false});
    },
    useProfitLoss(from: string | null, to: string | null, showZero: boolean): SWRResponse<ProfitLossReport> {
        return useConsoleSwr(from && to ? `/gl/profit-loss?${query({date_from: from, date_to: to, show_zero: showZero ? 1 : null})}` : null,
            authFetcher, {revalidateOnFocus: false});
    },
    useBalanceSheet(asOf: string | null, showZero: boolean): SWRResponse<BalanceSheetReport> {
        return useConsoleSwr(asOf ? `/gl/balance-sheet?${query({as_of: asOf, show_zero: showZero ? 1 : null})}` : null,
            authFetcher, {revalidateOnFocus: false});
    },
    useTaxSummary(from: string | null, to: string | null): SWRResponse<TaxSummaryReport> {
        return useConsoleSwr(from && to ? `/gl/tax-summary?${query({date_from: from, date_to: to})}` : null, authFetcher, {revalidateOnFocus: false});
    },
    useTaxDetails(params: URLSearchParams): SWRResponse<PaginationResponse<TaxDetailRow>> {
        return useConsoleSwr(`/gl/tax-details?${params}`, authFetcher);
    },
};

export const journalApi = {
    useGetAll(params: URLSearchParams): SWRResponse<PaginationResponse<Journal>> {
        return useConsoleSwr(`/gl/journals?${params}`, authFetcher);
    },
    useGetOne(id: Id | null | undefined, config?: SWRConfiguration): SWRResponse<JournalDetail> {
        return useConsoleSwr(id ? `/gl/journals/${id}` : null, authFetcher, config);
    },
    add: (data: JournalRequest): Promise<JournalDetail> => authApiRequest("/gl/journals").add(data).post(),
    void: (id: Id, reason: string | null): Promise<void> => authApiRequest(`/gl/journals/${id}/void`).add({reason}).post(),
};
