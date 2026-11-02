import {TaxType} from "@/apis/models/tax-type";

export type TaxGroupTaxTypePivot = {
    tax_group_id: number,
    tax_type_id: number,
    // pivot columns are not cast, so booleans may arrive as 0/1
    apply_to_shipping: boolean | number,
    sequence: number,
    is_compound: boolean | number,
}

export type TaxGroupTaxType = TaxType & {
    pivot: TaxGroupTaxTypePivot,
}

export type TaxGroup = {
    id: number,
    company_id: number,
    name: string,
    status: string,
    tax_types: TaxGroupTaxType[],
}
