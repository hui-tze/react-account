import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {FiscalYear} from "@/apis/models/fiscal-year";
import {PaginationResponse} from "@/apis/pagination";

export type FiscalYearRequest = Omit<FiscalYear, "id" | "company_id">

export function useGetAllFiscalYear(params: URLSearchParams): SWRResponse<PaginationResponse<FiscalYear>> {
    return useConsoleSwr(`/fiscal-year?${params}`, authFetcher);
}

// dropdowns — no `page`, so the backend returns every row
export function useGetFiscalYearOptions(): SWRResponse<FiscalYear[]> {
    return useConsoleSwr("/fiscal-year", authFetcher);
}

export function useGetOneFiscalYear(id: number | string, config?: SWRConfiguration): SWRResponse<FiscalYear> {
    return useConsoleSwr(`/fiscal-year/${id}`, authFetcher, config);
}

export function addFiscalYear(data: FiscalYearRequest): Promise<FiscalYear> {
    return authApiRequest("/fiscal-year").add(data).post();
}

export function updateFiscalYear(id: number | string, data: FiscalYearRequest): Promise<FiscalYear> {
    return authApiRequest(`/fiscal-year/${id}`).add(data).put();
}

export function deleteFiscalYear(id: number | string): Promise<void> {
    return authApiRequest(`/fiscal-year/${id}`).delete();
}
