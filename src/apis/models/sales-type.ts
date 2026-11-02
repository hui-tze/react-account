export type SalesType = {
    id: number,
    company_id: number,
    name: string,
    // decimal(10,4) — serialized as a string by the backend's decimal cast
    calculation_factor: string,
    tax_included: boolean,
    description: string | null,
    status: string,
}
