// General ledger module (laravel-account /panel/gl). gl_trans amounts are debit positive;
// report amounts are shown in each account class's normal direction.

import type {DimensionTag} from "@/apis/models/dimension";

export type NormalBalance = "debit" | "credit";
export type FinancialStatement = "balance_sheet" | "profit_loss";

/** One posting line of the general ledger. */
export type LedgerEntry = {
    id: number,
    trans_type: string,
    trans_type_label: string,
    trans_id: number,
    reference_no: string,
    trans_date: string,
    account_id: number,
    account_code: string,
    account_name: string,
    account_type: string,
    class_name: string,
    party_type: string,
    party_name: string | null,
    memo: string | null,
    debit: number,
    credit: number,
    // "inactive" = voided posting
    status: string,
    // running balance, only when filtered to one account
    balance?: number,
};

/** Opening / movement / closing of one account over the filtered period. */
export type LedgerSummary = {
    normal_balance: NormalBalance,
    opening: number,
    debit: number,
    credit: number,
    closing: number,
};

/** An account in a report tree; T carries the report's amounts. */
export type LedgerTreeAccount<T> = T & {
    id: number,
    code: string,
    name: string,
    account_type: string,
    allow_transaction: boolean,
    is_control_account: boolean,
    status: string,
};

export type LedgerTreeGroup<T> = {
    id: number,
    code: string,
    name: string,
    sequence: number,
    accounts: LedgerTreeAccount<T>[],
    groups: LedgerTreeGroup<T>[],
    totals: T,
};

export type LedgerTreeClass<T> = {
    id: number,
    code: string,
    name: string,
    normal_balance: NormalBalance,
    financial_statement: FinancialStatement,
    sequence: number,
    groups: LedgerTreeGroup<T>[],
    totals: T,
};

export type ChartAmounts = {balance: number, has_postings?: boolean};
export type ChartOfAccountsReport = {
    as_of: string | null,
    classes: LedgerTreeClass<ChartAmounts>[],
    counts: {classes: number, groups: number, accounts: number},
};

export type TrialBalanceAmounts = {
    opening_debit: number,
    opening_credit: number,
    debit: number,
    credit: number,
    closing_debit: number,
    closing_credit: number,
};
export type TrialBalanceReport = {
    date_from: string | null,
    date_to: string,
    classes: LedgerTreeClass<TrialBalanceAmounts>[],
    totals: TrialBalanceAmounts,
    balanced: boolean,
};

export type StatementAmounts = {amount: number};
export type ProfitLossReport = {
    date_from: string,
    date_to: string,
    classes: LedgerTreeClass<StatementAmounts>[],
    net_profit: number,
};
export type BalanceSheetReport = {
    as_of: string,
    fiscal_year: {begin: string, end: string} | null,
    classes: LedgerTreeClass<StatementAmounts>[],
    earnings: {retained: number, current: number, total: number},
    debit_side: number,
    credit_side: number,
    difference: number,
    balanced: boolean,
};

export type Journal = {
    id: number,
    reference_no: string,
    trans_no: number,
    journal_date: string,
    currency_code: string,
    total_amount: string,
    source: string | null,
    source_reference: string | null,
    remarks: string | null,
    // Posted | Voided
    status: string,
    created_at: string,
};

export type JournalLine = {
    id: number,
    account_id: number,
    account_code: string,
    account_name: string,
    account_type: string,
    memo: string | null,
    debit: number,
    credit: number,
    dimensions?: DimensionTag[],
};

export type JournalDetail = Journal & {lines: JournalLine[], void_reason: string | null};

export type TaxSummaryRow = {
    tax_type_id: number,
    code: string,
    name: string,
    einv_tax_type: string | null,
    output_taxable: number,
    output_tax: number,
    input_taxable: number,
    input_tax: number,
    net_payable: number,
    documents: number,
};
export type TaxSummaryReport = {
    date_from: string,
    date_to: string,
    taxes: TaxSummaryRow[],
    totals: Omit<TaxSummaryRow, "tax_type_id" | "code" | "name" | "einv_tax_type" | "documents">,
    // tax-type GL accounts over the same period; net_credit = liability built up
    accounts: {id: number, code: string, name: string, debit: number, credit: number, net_credit: number}[],
};
export type TaxDetailRow = {
    id: string,
    trans_type: string,
    trans_type_label: string,
    trans_id: number,
    reference_no: string,
    trans_date: string,
    party_name: string,
    direction: "output" | "input",
    tax_code: string,
    tax_name: string,
    rate: number,
    taxable: number,
    tax: number,
};
