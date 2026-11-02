import {CompanyAddress, CompanyContact, CompanyDetail} from "@/apis/models/company";
import {CompanyAddressRequest, CompanyContactRequest, CompanyRequest} from "@/apis/requests/company-api";

export type ProfileFormValues = CompanyRequest;

export const EMPTY_ADDRESS: CompanyAddressRequest = {
    type: null,
    address1: "",
    address2: null,
    address3: null,
    postcode: null,
    city: null,
    state: null,
    country: "Malaysia",
    is_primary: false,
};

export const EMPTY_CONTACT: CompanyContactRequest = {
    category_id: null,
    first_name: "",
    last_name: null,
    phone: null,
    phone2: null,
    fax: null,
    email: null,
    language: null,
    remark: null,
};

export function blankToNull(value: string | null | undefined): string | null {
    const trimmed = (value ?? "").trim();
    return trimmed === "" ? null : trimmed;
}

export function toFormValues(company: CompanyDetail): ProfileFormValues {
    return {
        name: company.name ?? "",
        registration_no: company.registration_no ?? null,
        tin: company.tin ?? null,
        tax_no: company.tax_no ?? null,
        addresses: addressesToForm(company.addresses),
        contacts: contactsToForm(company.contacts),
    };
}

/** Builds the PUT /company/{id} body with only the fields EditCompanyRequest accepts. */
export function toPayload(values: ProfileFormValues): CompanyRequest {
    return {
        name: values.name.trim(),
        registration_no: blankToNull(values.registration_no),
        tin: blankToNull(values.tin),
        tax_no: blankToNull(values.tax_no),
        addresses: addressesToPayload(values.addresses),
        contacts: contactsToPayload(values.contacts),
    };
}

// address / contact rows are shared by the company profile and customer forms

export function addressesToForm(addresses: CompanyAddress[] | null | undefined): CompanyAddressRequest[] {
    return (addresses ?? []).map(a => ({
        id: a.id,
        type: a.type,
        address1: a.address1 ?? "",
        address2: a.address2,
        address3: a.address3,
        postcode: a.postcode,
        city: a.city,
        state: a.state,
        country: a.country,
        is_primary: !!a.is_primary,
    }));
}

export function contactsToForm(contacts: CompanyContact[] | null | undefined): CompanyContactRequest[] {
    return (contacts ?? []).map(c => ({
        id: c.id,
        category_id: c.category_id,
        first_name: c.person?.first_name ?? "",
        last_name: c.person?.last_name ?? null,
        phone: c.person?.phone ?? null,
        phone2: c.person?.phone2 ?? null,
        fax: c.person?.fax ?? null,
        email: c.person?.email ?? null,
        language: c.person?.language ?? null,
        remark: c.person?.remark ?? null,
    }));
}

export function addressesToPayload(addresses: CompanyAddressRequest[]): CompanyAddressRequest[] {
    return addresses.map(a => ({
        ...(a.id ? {id: a.id} : {}),
        type: blankToNull(a.type),
        address1: a.address1.trim(),
        address2: blankToNull(a.address2),
        address3: blankToNull(a.address3),
        postcode: blankToNull(a.postcode),
        city: blankToNull(a.city),
        state: blankToNull(a.state),
        country: blankToNull(a.country),
        is_primary: !!a.is_primary,
    }));
}

export function contactsToPayload(contacts: CompanyContactRequest[]): CompanyContactRequest[] {
    return contacts.map(c => ({
        ...(c.id ? {id: c.id} : {}),
        category_id: c.category_id ?? null,
        first_name: c.first_name.trim(),
        last_name: blankToNull(c.last_name),
        phone: blankToNull(c.phone),
        phone2: blankToNull(c.phone2),
        fax: blankToNull(c.fax),
        email: blankToNull(c.email),
        language: blankToNull(c.language),
        remark: blankToNull(c.remark),
    }));
}
