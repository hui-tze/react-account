import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {CompanyDetail} from "@/apis/models/company";

export type CompanyAddressRequest = {
    id?: number,
    type: string | null,
    address1: string,
    address2: string | null,
    address3: string | null,
    postcode: string | null,
    city: string | null,
    state: string | null,
    country: string | null,
    is_primary: boolean,
}

export type CompanyContactRequest = {
    // id of the `contacts` link row — keeps edits from duplicating the person
    id?: number,
    category_id: number | null,
    first_name: string,
    last_name: string | null,
    phone: string | null,
    phone2: string | null,
    fax: string | null,
    email: string | null,
    language: string | null,
    remark: string | null,
}

export type CompanyRequest = {
    name: string,
    registration_no: string | null,
    tin: string | null,
    tax_no: string | null,
    // e-invoice fields are edited on Settings > Organization > E-Invoice (MyInvois)
    msic_code?: string | null,
    business_activity_description?: string | null,
    is_einvoice_enabled?: boolean,
    einvoice_start_date?: string | null,
    addresses: CompanyAddressRequest[],
    contacts: CompanyContactRequest[],
}

export function useGetOneCompany(id: number | string | null | undefined, config?: SWRConfiguration): SWRResponse<CompanyDetail> {
    return useConsoleSwr(id ? `/company/${id}` : null, authFetcher, config);
}

export function updateCompany(id: number | string, data: CompanyRequest): Promise<CompanyDetail> {
    return authApiRequest(`/company/${id}`).add(data).put();
}
