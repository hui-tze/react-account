import type {LedgerTreeClass} from "@/apis/models/ledger";

/** A dimension: a way to slice the ledger (e.g. Cost Centre, Project). */
export type Dimension = {
    id: number,
    code: string,
    name: string,
    // documents that post to the ledger must carry a value of it
    is_required: boolean,
    status: string,
    values?: DimensionValue[],
}

/** A value of a dimension, nested by parent_id; a group heads others and rolls them up in reports. */
export type DimensionValue = {
    id: number,
    dimension_id: number,
    parent_id: number | null,
    code: string,
    name: string,
    is_group: boolean,
    // can be picked on documents
    allow_transaction: boolean,
    sequence: number,
    status: string,
}

/** One dimension's value on a document / line / default. */
export type DimensionTag = {
    dimension_id: number,
    dimension_value_id: number | null,
}

export type DimensionAssignable = "customer" | "customer_branch" | "supplier" | "item" | "account";

export type Budget = {
    id: number,
    name: string,
    fiscal_year_id: number,
    fiscal_year_begin: string,
    fiscal_year_end: string,
    dimension_id: number | null,
    dimension_name: string | null,
    notes: string | null,
    status: string,
    total?: number,
    account_count?: number,
}

export type BudgetRow = {
    account_id: number | null,
    dimension_value_id: number | null,
    // one per month of the fiscal year
    amounts: (number | null)[],
}

export type BudgetDetail = Budget & {
    // "YYYY-MM", first to last month of the fiscal year
    months: string[],
    rows: BudgetRow[],
}

export type BudgetReportRow = {
    account_id: number,
    account_code: string,
    account_name: string,
    class_id: number | null,
    class_name: string | null,
    normal_balance: string | null,
    dimension_value_id: number | null,
    budget_month: number,
    actual_month: number,
    budget_ytd: number,
    actual_ytd: number,
    variance_ytd: number,
    used_pct: number | null,
    favourable: boolean,
    budget_year: number,
    remaining: number,
}

export type BudgetReport = {
    budget: Pick<Budget, "id" | "name" | "dimension_id" | "dimension_name" | "fiscal_year_begin" | "fiscal_year_end">,
    months: string[],
    month: string,
    rows: BudgetReportRow[],
    class_totals: (Pick<BudgetReportRow, "class_id" | "class_name" | "normal_balance" | "budget_month" | "actual_month" | "budget_ytd" | "actual_ytd" | "budget_year" | "remaining">)[],
}

export type ValueColumn = {
    key: string,
    id: number | null,
    code: string | null,
    name: string | null,
    is_group: boolean,
    has_children: boolean,
}

/** Profit & loss with a column per value of a dimension. */
export type DimensionProfitLoss = {
    dimension: {id: number, code: string, name: string},
    parent: DimensionValue | null,
    columns: ValueColumn[],
    classes: LedgerTreeClass<Record<string, number>>[],
    net_profit: Record<string, number>,
}
