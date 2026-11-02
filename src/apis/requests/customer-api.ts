import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {Customer} from "@/apis/models/customer";
import {PaginationResponse} from "@/apis/pagination";
import {CompanyAddressRequest, CompanyContactRequest} from "@/apis/requests/company-api";
import {CustomerBranchDefaults} from "@/apis/requests/customer-branch-api";

export type CustomerRequest = {
    name: string,
    short_name: string | null,
    tin: string | null,
    tax_no: string | null,
    registration_no: string | null,
    // which ID registration_no holds when sent to MyInvois
    einv_id_type?: "BRN" | "NRIC" | "PASSPORT" | "ARMY" | null,
    currency_id: number | null,
    payment_terms_id: number | null,
    credit_status_id: number | null,
    credit_limit: number,
    default_discount: number,
    payment_discount: number,
    notes: string | null,
    status: string,
    addresses: CompanyAddressRequest[],
    contacts: CompanyContactRequest[],
    // new customers only: defaults for the first branch, created together with the customer
    branch?: Partial<CustomerBranchDefaults>,
}

// listing table — always sends `page`, so the backend paginates
export function useGetAllCustomer(params: URLSearchParams): SWRResponse<PaginationResponse<Customer>> {
    return useConsoleSwr(`/customer?${params}`, authFetcher);
}

// dropdowns — no `page`, so the backend returns every row
export function useGetCustomerOptions(): SWRResponse<Customer[]> {
    return useConsoleSwr("/customer", authFetcher);
}

/** Customer with branches, addresses and contacts. */
export function useGetOneCustomer(id: number | string | null | undefined, config?: SWRConfiguration): SWRResponse<Customer> {
    return useConsoleSwr(id ? `/customer/${id}` : null, authFetcher, config);
}

export function addCustomer(data: CustomerRequest): Promise<Customer> {
    return authApiRequest("/customer").add(data).post();
}

export function updateCustomer(id: number | string, data: CustomerRequest): Promise<Customer> {
    return authApiRequest(`/customer/${id}`).add(data).put();
}

export function deleteCustomer(id: number | string): Promise<void> {
    return authApiRequest(`/customer/${id}`).delete();
}
