import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRResponse} from "swr";
import {Staff} from "@/apis/models/staff";
import {Department} from "@/apis/models/department";

export type TargetIncomeData = {
    id: number,
    name: string,
    target_amount: string,
    nodes: TargetIncomeDepartment[],
}

export type TargetIncomeDepartment = {
    type: "expense" | "income",
    organization_id: number,
    target_amount?: string,
    staffs: TargetIncomeStaff[],
}

export type TargetIncomeStaff = {
    staff_id: number,
    target_amount: string,
    items: TargetIncomeItem[],
}

export type TargetIncomeItem = {
    name: string,
    amount: string,
}

export type TargetIncomeDataResponse = {
    income_target: TargetIncomeData,
    staffs: (Pick<Staff, "name"|"id"> & {
        organization_id: number,
    })[],
    departments: Department[]
}

export function useGetIncomeTarget(): SWRResponse<TargetIncomeDataResponse> {
    return useConsoleSwr("/comp-income-target/current", authFetcher);
}

export function saveIncomeTarget(id: number|string, data: TargetIncomeData) {
    return authApiRequest(`/comp-income-target/${id}/save`).add(data).put();
}
