import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {PaginationResponse} from "../pagination";
import {ClaimCategory, DynamicField} from "../models/claim-type";
import {SelectOptionProps} from "../models/common";

export type ClaimSubCategoryRequest = {
    name: string;
    dyn_fields: DynamicField[];
}
export type ClaimCategoryRequest = {
    name: string,
    dyn_fields: DynamicField[],
    sub_categories: ClaimSubCategoryRequest[]
}
export type DynamicFieldDetails = DynamicField & {
    __version: number,
    uid: string,
    value: null,
}
export type ClaimCategoryDetails = ClaimCategory & {
    current_dyn_form: {
        id: number,
        claim_category_id: number,
        uid: string,
        fields: DynamicFieldDetails[]
    },
    sub_categories: {
        name: string,
        current_dyn_form_uid: string,
        current_dyn_form: {
            id: number,
            claim_category_id: number,
            batch_uid: string,
            name: string,
            uid: string,
            fields: DynamicFieldDetails[]
        },
    }[]
}

export function useGetAllClaimCategory(params: URLSearchParams): SWRResponse<PaginationResponse<ClaimCategory>> {
    return useConsoleSwr(`/claim-categories?${params}`, authFetcher);
}

export function useGetOneClaimCategory(id: number|string, config?: SWRConfiguration): SWRResponse<ClaimCategoryDetails> {
    return useConsoleSwr(`/claim-categories/${id}`, authFetcher, config);
}

export function useGetClaimCategoryOptions(): SWRResponse<SelectOptionProps[]> {
    return useConsoleSwr(`/claim-categories/options`, authFetcher);
}

export function createClaimCategory(data: ClaimCategoryRequest): Promise<void> {
    return authApiRequest("/claim-categories").add(data).post();
}

export function updateClaimCategory(id: number|string, data: ClaimCategoryRequest): Promise<ClaimCategory> {
    return authApiRequest(`/claim-categories/${id}`).add(data).put();
}

export function deleteClaimCategory(id: number|string): Promise<[]> {
    return authApiRequest(`/claim-categories/${id}`).delete();
}