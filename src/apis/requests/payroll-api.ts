import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {Payroll, PayrollRelatedStaff} from "../models/payroll";
import {PayFrequencyType} from "@/constants/ContractPayFrequency";

export type PreparePayrollRequest = {
    year_month: string,
    target_year: string,
    target_month: string,
    type: PayFrequencyType
    staff_ids: number[],
    quarter?: '1'|'2'|'3'|'4',
    half?: '1'|'2',
    date?: string,
    description: string|null,
}
export type CommitPayrollRequest = {
    uid: string,
    description: string|null,
    type: PayFrequencyType,
}

export function usePreparePayroll(params?: URLSearchParams) {
    return useConsoleSwr<Payroll>(
        params ? `/payroll/prepare?${params}` : null,
        authFetcher
    );
}

export async function preparePayroll(params: URLSearchParams) {
    return authApiRequest(`/payroll/prepare?${params.toString()}`).get();
}

export function useGetRelatedStaffs(params: URLSearchParams): SWRResponse<PayrollRelatedStaff[]> {
    return useConsoleSwr(`/payroll/related-staffs?${params}`, authFetcher);
}

export function useCommitPayroll(data: CommitPayrollRequest): Promise<void> {
    return authApiRequest(`/payroll/apply-commitment`).add(data).post();
}