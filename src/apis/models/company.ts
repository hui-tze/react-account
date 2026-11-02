import {ContactCategory} from "@/apis/models/contact-category";

export type Company = {
    id: number,
    code?: string,
    name: string,
    status: string,
    tin?: string | null,
    tax_no?: string | null,
    registration_no?: string | null,
}

export type CompanyAddress = {
    id: number,
    type: string | null,
    address1: string,
    address2: string | null,
    address3: string | null,
    postcode: string | null,
    city: string | null,
    state: string | null,
    country: string | null,
    is_primary: boolean,
    status: string,
}

export type ContactPerson = {
    id: number,
    first_name: string,
    last_name: string | null,
    phone: string | null,
    phone2: string | null,
    fax: string | null,
    email: string | null,
    language: string | null,
    remark: string | null,
    status: string,
}

// `contacts` row linking the company to a person
export type CompanyContact = {
    id: number,
    person_id: number,
    category_id: number | null,
    status: string,
    person: ContactPerson | null,
    category: ContactCategory | null,
}

export type CompanyEinvoiceSetting = {
    id: number,
    msic_code: string | null,
    business_activity_description: string | null,
    einvoice_start_date: string | null,
    is_einvoice_enabled: boolean,
}

/** GET /company/{id} — company with its relations loaded. */
export type CompanyDetail = Company & {
    addresses: CompanyAddress[],
    contacts: CompanyContact[],
    einvoice_setting: CompanyEinvoiceSetting | null,
}
