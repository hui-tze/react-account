export type TaxType = {
    id: number,
    company_id: number,
    code: string,
    name: string,
    // decimal(8,4) — Laravel serializes it as a string, e.g. "6.0000"
    rate: string | number,
    // MyInvois tax type: 01 sales tax, 02 service tax, 06 not applicable, E exempt…
    einv_tax_type?: string | null,
    sales_tax_account_id: number,
    purchase_tax_account_id: number,
    for_sales: boolean,
    for_purchase: boolean,
    status: string,
}
