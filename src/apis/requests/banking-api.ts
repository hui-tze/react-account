import type {SWRConfiguration, SWRResponse} from "swr";
import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {PaginationResponse} from "@/apis/pagination";
import type {
    BankDocument,
    BankDocumentDetail,
    BankingAccount,
    BankRegisterRow,
    BankRegisterSummary,
    ReconciliationState,
} from "@/apis/models/banking";
import type {DimensionTag} from "@/apis/models/dimension";

type Id = number | string;

export type BankLineRequest = {account_id: number | null, memo: string | null, amount: number | null, dimensions: DimensionTag[]};

/** Bank payment / bank deposit. */
export type BankMoneyRequest = {
    // blank: generated from Document No
    reference_no: string | null,
    trans_date: string,
    bank_account_id: number | null,
    party_type: "customer" | "supplier" | "other",
    party_id: number | null,
    payee_name: string | null,
    // blank: the latest rate of the bank's currency on or before the date
    exchange_rate: number | null,
    bank_charge: number | null,
    memo: string | null,
    lines: BankLineRequest[],
};

export type FundsTransferRequest = {
    reference_no: string | null,
    trans_date: string,
    bank_account_id: number | null,
    to_bank_account_id: number | null,
    amount: number | null,
    // only across currencies
    to_amount: number | null,
    bank_charge: number | null,
    exchange_rate: number | null,
    memo: string | null,
    dimensions: DimensionTag[],
};

export const bankingApi = {
    useAccounts(config?: SWRConfiguration): SWRResponse<BankingAccount[]> {
        return useConsoleSwr("/banking/accounts", authFetcher, config);
    },
    // listing table — always sends `page`; the response also carries the period summary
    useRegister(id: Id | null | undefined, params: URLSearchParams): SWRResponse<PaginationResponse<BankRegisterRow> & {summary: BankRegisterSummary}> {
        return useConsoleSwr(id ? `/banking/accounts/${id}/register?${params}` : null, authFetcher);
    },
    useDocuments(params: URLSearchParams): SWRResponse<PaginationResponse<BankDocument>> {
        return useConsoleSwr(`/banking/documents?${params}`, authFetcher);
    },
    useDocument(id: Id | null | undefined, config?: SWRConfiguration): SWRResponse<BankDocumentDetail> {
        return useConsoleSwr(id ? `/banking/documents/${id}` : null, authFetcher, config);
    },
    addPayment: (data: BankMoneyRequest): Promise<BankDocumentDetail> => authApiRequest("/banking/payments").add(data).post(),
    addDeposit: (data: BankMoneyRequest): Promise<BankDocumentDetail> => authApiRequest("/banking/deposits").add(data).post(),
    addTransfer: (data: FundsTransferRequest): Promise<BankDocumentDetail> => authApiRequest("/banking/transfers").add(data).post(),
    void: (id: Id, reason: string | null): Promise<void> => authApiRequest(`/banking/documents/${id}/void`).add({reason}).post(),

    useReconciliation(accountId: Id | null | undefined, statementDate: string | null, config?: SWRConfiguration): SWRResponse<ReconciliationState> {
        return useConsoleSwr(accountId && statementDate ? `/banking/accounts/${accountId}/reconciliation?statement_date=${statementDate}` : null,
            authFetcher, config);
    },
    mark: (accountId: Id, statementDate: string, ids: number[], reconciled: boolean): Promise<ReconciliationState> =>
        authApiRequest(`/banking/accounts/${accountId}/reconciliation/mark`).add({statement_date: statementDate, ids, reconciled}).post(),
    finish: (accountId: Id, statementDate: string, statementBalance: number): Promise<ReconciliationState> =>
        authApiRequest(`/banking/accounts/${accountId}/reconciliation/finish`).add({statement_date: statementDate, statement_balance: statementBalance}).post(),
};
