export type CreditStatus = {
    id: number,
    company_id: number,
    name: string,
    allow_invoice: boolean,
    allow_order: boolean,
    description: string | null,
    status: string,
}
