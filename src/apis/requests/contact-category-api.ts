import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {ContactCategory} from "@/apis/models/contact-category";
import {PaginationResponse} from "@/apis/pagination";

export type ContactCategoryRequest = Omit<ContactCategory, "id" | "company_id" | "is_system">

// listing table — always sends `page`, so the backend paginates
export function useGetAllContactCategory(params: URLSearchParams): SWRResponse<PaginationResponse<ContactCategory>> {
    return useConsoleSwr(`/contact-category?${params}`, authFetcher);
}

// dropdowns — no `page`, so the backend returns every row
export function useGetContactCategoryOptions(): SWRResponse<ContactCategory[]> {
    return useConsoleSwr("/contact-category", authFetcher);
}

export function useGetOneContactCategory(id: number | string, config?: SWRConfiguration): SWRResponse<ContactCategory> {
    return useConsoleSwr(`/contact-category/${id}`, authFetcher, config);
}

export function addContactCategory(data: ContactCategoryRequest): Promise<ContactCategory> {
    return authApiRequest("/contact-category").add(data).post();
}

export function updateContactCategory(id: number | string, data: ContactCategoryRequest): Promise<ContactCategory> {
    return authApiRequest(`/contact-category/${id}`).add(data).put();
}

export function deleteContactCategory(id: number | string): Promise<void> {
    return authApiRequest(`/contact-category/${id}`).delete();
}
