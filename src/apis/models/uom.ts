export type Uom = {
    id: number,
    company_id: number,
    abbreviation: string,
    name: string,
    decimal_places: number,
    // MyInvois unit code (UN/ECE Rec 20), e.g. C62
    einv_unit_code?: string | null,
    status: string,
}
