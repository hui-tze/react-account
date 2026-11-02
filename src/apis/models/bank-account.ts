// mirrors App\Domain\Constants\BankAccountType
export type BankAccountType = "savings" | "current" | "credit" | "cash";

export type BankAccount = {
    id: number,
    company_id: number,
    currency_id: number,
    type: BankAccountType,
    account_id: number,
    charge_account_id: number,
    account_name: string | null,
    account_number: string | null,
    is_default: boolean,
    last_reconciled_at: string | null,
    // cast as decimal:2, so the API returns it as a string
    ending_reconcile_balance: string | number,
    status: string,
}
