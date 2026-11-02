import {authApiRequest, authApiRequestTempUrl, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {PayrollCommitment, PayrollCommitmentDetails, PayrollPrintLinks} from "../models/payroll-commitment";
import {PaginationResponse} from "../pagination";
import {URLResponse} from "../models/common";
import qs from "qs";

export type RegeneratePayrollRequest = {
    uid: string
}
export type MonthlyExportFilter = {
    year_month: string,
    year: number,
    month: number,
}

export function useGetAllPayrollCommitment(params: URLSearchParams): SWRResponse<PaginationResponse<PayrollCommitment>> {
    return useConsoleSwr(`/payroll/commitments?${params}`, authFetcher);
}

export function useGetOnePayrollCommitment(id: number|string, config?: SWRConfiguration): SWRResponse<PayrollCommitmentDetails> {
    return useConsoleSwr(`/payroll/commitments/${id}`, authFetcher, config);
}

export function useRegeneratePayrollCommitment(id: string, data: RegeneratePayrollRequest): Promise<void> {
    return authApiRequest(`/payroll/commitments/${id}/regenerate`).add(data).post();
}

export function useCommitPayrollCommitment(id: number|string): Promise<[]> {
    return authApiRequest(`/payroll/commitments/${id}/commit`).post();
}

export function useUncommitPayrollCommitment(id: number|string): Promise<[]> {
    return authApiRequest(`/payroll/commitments/${id}/uncommit`).post();
}

export function useReleasePayrollCommitment(id: number|string): Promise<[]> {
    return authApiRequest(`/payroll/commitments/${id}/finalize`).post();
}

export function useDeletePayrollCommitment(id: number|string): Promise<[]> {
    return authApiRequest(`/payroll/commitments/${id}`).delete();
}

export async function useExportMonthlyEIS(filter: MonthlyExportFilter) {
    const res = await authApiRequestTempUrl<URLResponse>(`/payroll/commitments/monthly-eis-print?${qs.stringify(filter)}`);
    window.open(`${res.url}`, "_blank");
}

export function useExportMonthlyPayrollCommitmentReport(params: URLSearchParams): SWRResponse<PayrollPrintLinks> {
    return useConsoleSwr(
        `/payroll/commitments/monthly-print?${params.toString()}`,
        authFetcher
    );
}