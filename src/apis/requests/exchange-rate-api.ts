import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {ExchangeRate} from "@/apis/models/exchange-rate";
import {PaginationResponse} from "@/apis/pagination";

export type ExchangeRateRequest = Omit<ExchangeRate, "id" | "company_id" | "currency">

export function useGetAllExchangeRate(params: URLSearchParams): SWRResponse<PaginationResponse<ExchangeRate>> {
    return useConsoleSwr(`/exchange-rate?${params}`, authFetcher);
}

export function useGetOneExchangeRate(id: number | string, config?: SWRConfiguration): SWRResponse<ExchangeRate> {
    return useConsoleSwr(`/exchange-rate/${id}`, authFetcher, config);
}

export function addExchangeRate(data: ExchangeRateRequest): Promise<ExchangeRate> {
    return authApiRequest("/exchange-rate").add(data).post();
}

export function updateExchangeRate(id: number | string, data: ExchangeRateRequest): Promise<ExchangeRate> {
    return authApiRequest(`/exchange-rate/${id}`).add(data).put();
}

export function deleteExchangeRate(id: number | string): Promise<void> {
    return authApiRequest(`/exchange-rate/${id}`).delete();
}
