export type AccountClass = {
    id: number,
    company_id: number,
    code: string,
    name: string,
    normal_balance: "debit" | "credit",
    financial_statement: "balance_sheet" | "profit_loss",
    sequence: number,
    status: string,
}
