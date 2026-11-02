import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {CustomerBranch} from "@/apis/models/customer";
import {CompanyAddressRequest} from "@/apis/requests/company-api";

export type CustomerBranchDefaults = Pick<CustomerBranch,
    "sales_type_id" | "sales_area_id" | "sales_group_id" | "sales_person_id" | "location_id" | "shipping_id" | "tax_group_id"
    | "receivable_account_id" | "sales_account_id" | "sales_discount_account_id" | "payment_discount_account_id">

export type CustomerBranchRequest = CustomerBranchDefaults & {
    customer_id: number,
    name: string,
    short_name: string | null,
    notes: string | null,
    status: string,
    addresses: CompanyAddressRequest[],
}

/** A customer's branches, with addresses (no request until a customer is chosen). */
export function useGetCustomerBranches(customerId: number | null | undefined): SWRResponse<CustomerBranch[]> {
    return useConsoleSwr(customerId ? `/customer-branch?customer_id=${customerId}` : null, authFetcher);
}

export function useGetOneCustomerBranch(id: number | string, config?: SWRConfiguration): SWRResponse<CustomerBranch> {
    return useConsoleSwr(`/customer-branch/${id}`, authFetcher, config);
}

export function addCustomerBranch(data: CustomerBranchRequest): Promise<CustomerBranch> {
    return authApiRequest("/customer-branch").add(data).post();
}

export function updateCustomerBranch(id: number | string, data: CustomerBranchRequest): Promise<CustomerBranch> {
    return authApiRequest(`/customer-branch/${id}`).add(data).put();
}

export function deleteCustomerBranch(id: number | string): Promise<void> {
    return authApiRequest(`/customer-branch/${id}`).delete();
}
