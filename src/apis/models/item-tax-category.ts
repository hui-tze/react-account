import {TaxType} from "@/apis/models/tax-type";

export type ItemTaxCategory = {
    id: number,
    company_id: number,
    name: string,
    // exempt from every tax; when false, only the `exempt_tax_types` are skipped
    tax_exempt: boolean,
    status: string,
    exempt_tax_types?: TaxType[],
}
