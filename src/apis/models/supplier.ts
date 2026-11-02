import {CompanyAddress, CompanyContact} from "@/apis/models/company";

export type Supplier = {
    id: number,
    company_id: number,
    code: string | null,
    short_name: string | null,
    name: string,
    tin: string | null,
    tax_no: string | null,
    registration_no: string | null,
    // which ID registration_no holds when sent to MyInvois
    einv_id_type?: "BRN" | "NRIC" | "PASSPORT" | "ARMY" | null,
    currency_id: number | null,
    payment_terms_id: number | null,
    // decides which purchase taxes the supplier charges
    tax_group_id: number | null,
    // decimals — serialized as strings
    credit_limit: string,
    // supplier prices include tax by default
    tax_included: boolean,
    payable_account_id: number | null,
    purchase_account_id: number | null,
    purchase_discount_account_id: number | null,
    notes: string | null,
    status: string,
    currency?: {id: number, code: string} | null,
    // detail only
    addresses?: CompanyAddress[],
    contacts?: CompanyContact[],
}
