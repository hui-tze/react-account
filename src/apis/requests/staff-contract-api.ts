import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {Contract} from "../models/payroll-contract";
import {PaginationResponse} from "../pagination";
import {PayFrequencyType} from "@/constants/ContractPayFrequency";

export type ContractRequest = Omit<Contract, "id"|"staff_id"|"status"|"end_at"|"wage_type"|"pay_frequency"|"job_position_name"|"organization_name"|"designation_name"|"work_mode"|"employment_type"|"employment_status"> & {
    status: 'draft'|'pending-approval'|'active'|'expired'|'terminated',
    wage_type: 'hourly'|'daily'|'weekly'|'monthly',
    pay_frequency: PayFrequencyType,
    work_mode: 'on-site'|'work-from-home'|'remote'|'hybrid',
    employment_type: 'permanent'|'contract'|'part-time',
    employment_status: 'probation'|'employed'|'resigned'|'retired'|'internship'|'terminated',
}

export type PayrollContract = Contract & {
    staff: {
        id: number,
        name: string,
        branch_id: number,
        gender: string,
        company_email: string,
        contact_no: string,
        current_employment_date: string,
    }
}

export function useGetAllSingleStaffContract(id: number|string, config?: SWRConfiguration): SWRResponse<Contract[]> {
    return useConsoleSwr(`/staffs/${id}/contracts`, authFetcher);
}

export function createStaffContract(id: number|string, data: ContractRequest): Promise<void> {
    return authApiRequest(`/staffs/${id}/contracts`).add(data).post();
}

export function useGetActiveStaffContract(id: number|string, config?: SWRConfiguration): SWRResponse<Contract> {
    return useConsoleSwr(`/staffs/${id}/contracts/active`, authFetcher);
}

export function useGetAllStaffContract(params: URLSearchParams): SWRResponse<PaginationResponse<PayrollContract>> {
    return useConsoleSwr(`/staff-contracts?${params}`, authFetcher);
}

export function useGetOneStaffContract(id: number|string, config?: SWRConfiguration) {
    return useConsoleSwr<Contract>(`/staff-contracts/${id}`, authFetcher, config);
}

export function updateStaffContract(id: number|string, data: ContractRequest): Promise<Contract> {
    return authApiRequest(`/staff-contracts/${id}`).add(data).put();
}
