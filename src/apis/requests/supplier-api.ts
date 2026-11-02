import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {Supplier} from "@/apis/models/supplier";
import {PaginationResponse} from "@/apis/pagination";
import {CompanyAddressRequest, CompanyContactRequest} from "@/apis/requests/company-api";

export type SupplierRequest = {
    code: string | null,
    name: string,
    short_name: string | null,
    tin: string | null,
    tax_no: string | null,
    registration_no: string | null,
    // which ID registration_no holds when sent to MyInvois
    einv_id_type?: "BRN" | "NRIC" | "PASSPORT" | "ARMY" | null,
    currency_id: number | null,
    payment_terms_id: number | null,
    tax_group_id: number | null,
    credit_limit: number,
    tax_included: boolean,
    payable_account_id: number | null,
    purchase_account_id: number | null,
    purchase_discount_account_id: number | null,
    notes: string | null,
    status: string,
    addresses: CompanyAddressRequest[],
    contacts: CompanyContactRequest[],
}

// listing table — always sends `page`, so the backend paginates
export function useGetAllSupplier(params: URLSearchParams): SWRResponse<PaginationResponse<Supplier>> {
    return useConsoleSwr(`/supplier?${params}`, authFetcher);
}

// dropdowns — no `page`, so the backend returns every row
export function useGetSupplierOptions(): SWRResponse<Supplier[]> {
    return useConsoleSwr("/supplier", authFetcher);
}

/** Supplier with addresses and contacts. */
export function useGetOneSupplier(id: number | string | null | undefined, config?: SWRConfiguration): SWRResponse<Supplier> {
    return useConsoleSwr(id ? `/supplier/${id}` : null, authFetcher, config);
}

export function addSupplier(data: SupplierRequest): Promise<Supplier> {
    return authApiRequest("/supplier").add(data).post();
}

export function updateSupplier(id: number | string, data: SupplierRequest): Promise<Supplier> {
    return authApiRequest(`/supplier/${id}`).add(data).put();
}

export function deleteSupplier(id: number | string): Promise<void> {
    return authApiRequest(`/supplier/${id}`).delete();
}
