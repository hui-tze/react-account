// Banking module (laravel-account /panel/banking). Bank amounts are in each bank account's currency.

export type BankDocumentType = "bank_payment" | "bank_deposit" | "funds_transfer";

/** A bank account with its book and reconciled balances. */
export type BankingAccount = {
    id: number,
    account_name: string | null,
    account_number: string | null,
    type: string,
    currency_code: string | null,
    gl_account_id: number,
    gl_account: string | null,
    is_default: boolean,
    status: string,
    balance: number,
    reconciled_balance: number,
    unreconciled_count: number,
    last_trans_date: string | null,
    last_reconciled_at: string | null,
    // a statement with ticked lines that was never finished
    open_statement_date: string | null,
    ending_reconcile_balance: number,
};

/** One movement in a bank account's register. */
export type BankRegisterRow = {
    id: number,
    trans_type: string,
    trans_type_label: string,
    trans_id: number,
    reference_no: string,
    trans_date: string,
    party_name: string | null,
    money_in: number,
    money_out: number,
    reconciled_date: string | null,
    // "inactive" = voided
    status: string,
    balance?: number,
};

export type BankRegisterSummary = {
    bank_account_id: number,
    currency_code: string | null,
    opening: number,
    money_in: number,
    money_out: number,
    closing: number,
};

export type BankDocumentLine = {
    id: number,
    account_id: number,
    account_code: string | null,
    account_name: string | null,
    memo: string | null,
    amount: number,
};

export type BankDocument = {
    id: number,
    trans_type: BankDocumentType,
    trans_type_label: string,
    reference_no: string,
    trans_date: string,
    bank_account_id: number,
    bank_account_name: string | null,
    to_bank_account_id: number | null,
    to_bank_account_name: string | null,
    party_type: "customer" | "supplier" | "other" | "bank",
    party_id: number | null,
    party_name: string | null,
    payee_name: string | null,
    amount: number,
    bank_charge: number,
    exchange_rate: number,
    to_amount: number | null,
    memo: string | null,
    // active | voided
    status: string,
    created_at: string,
};

export type BankDocumentDetail = BankDocument & {
    lines: BankDocumentLine[],
    bank_currency: string | null,
    to_bank_currency: string | null,
    reconciled: boolean,
    void_reason: string | null,
};

export type ReconciliationItem = {
    id: number,
    trans_type: string,
    trans_type_label: string,
    trans_id: number,
    reference_no: string,
    trans_date: string,
    party_name: string | null,
    money_in: number,
    money_out: number,
    reconciled: boolean,
};

export type ReconciliationState = {
    bank_account: {
        id: number,
        account_name: string | null,
        account_number: string | null,
        currency_code: string | null,
        last_reconciled_at: string | null,
        ending_reconcile_balance: number,
    },
    statement_date: string,
    statements: string[],
    // everything reconciled on earlier statements
    opening_reconciled: number,
    // ticked on this statement
    cleared: number,
    reconciled_balance: number,
    book_balance: number,
    items: ReconciliationItem[],
};
