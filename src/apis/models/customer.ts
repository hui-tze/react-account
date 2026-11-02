import {CompanyAddress, CompanyContact} from "@/apis/models/company";

export type CustomerBranch = {
    id: number,
    company_id: number,
    customer_id: number,
    short_name: string | null,
    name: string,
    sales_type_id: number | null,
    sales_area_id: number | null,
    sales_group_id: number | null,
    sales_person_id: number | null,
    // default "deliver from" location
    location_id: number | null,
    // default shipping company
    shipping_id: number | null,
    // decides which taxes the branch is charged
    tax_group_id: number | null,
    receivable_account_id: number | null,
    sales_account_id: number | null,
    sales_discount_account_id: number | null,
    payment_discount_account_id: number | null,
    notes: string | null,
    status: string,
    addresses?: CompanyAddress[],
}

export type Customer = {
    id: number,
    company_id: number,
    short_name: string | null,
    name: string,
    tin: string | null,
    tax_no: string | null,
    registration_no: string | null,
    // which ID registration_no holds when sent to MyInvois
    einv_id_type?: "BRN" | "NRIC" | "PASSPORT" | "ARMY" | null,
    currency_id: number,
    payment_terms_id: number,
    credit_status_id: number,
    // decimals — serialized as strings
    credit_limit: string,
    default_discount: string,
    payment_discount: string,
    notes: string | null,
    status: string,
    // listing only
    branches_count?: number,
    // detail only
    branches?: CustomerBranch[],
    addresses?: CompanyAddress[],
    contacts?: CompanyContact[],
}
