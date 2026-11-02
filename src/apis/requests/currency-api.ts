import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {Currency} from "@/apis/models/currency";
import {PaginationResponse} from "@/apis/pagination";

export type CurrencyRequest = Omit<Currency, "id" | "company_id">

export function useGetAllCurrency(params: URLSearchParams): SWRResponse<PaginationResponse<Currency>> {
    return useConsoleSwr(`/currency?${params}`, authFetcher);
}

export function useGetCurrencyOptions(): SWRResponse<Currency[]> {
    return useConsoleSwr("/currency/options", authFetcher);
}

export function useGetOneCurrency(id: number | string, config?: SWRConfiguration): SWRResponse<Currency> {
    return useConsoleSwr(`/currency/${id}`, authFetcher, config);
}

export function addCurrency(data: CurrencyRequest): Promise<Currency> {
    return authApiRequest("/currency").add(data).post();
}

export function updateCurrency(id: number | string, data: CurrencyRequest): Promise<Currency> {
    return authApiRequest(`/currency/${id}`).add(data).put();
}

export function deleteCurrency(id: number | string): Promise<void> {
    return authApiRequest(`/currency/${id}`).delete();
}
