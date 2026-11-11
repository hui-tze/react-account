export type PosSetting = {
    id: number,
    company_id: number,
    name: string,
    account_id: number,
    location_id: number,
    // walk-in sales: taxes and price list
    tax_group_id: number | null,
    sales_type_id: number | null,
    allow_credit_sale_terms: boolean,
    allow_cash_sale_terms: boolean,
    status: string,
}
