import type {SWRConfiguration, SWRResponse} from "swr";
import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {
    Budget,
    BudgetDetail,
    BudgetReport,
    BudgetRow,
    Dimension,
    DimensionAssignable,
    DimensionProfitLoss,
    DimensionTag,
    DimensionValue,
} from "@/apis/models/dimension";

type Id = number | string;

export type DimensionRequest = Pick<Dimension, "code" | "name" | "is_required" | "status">;
export type DimensionValueRequest = Omit<DimensionValue, "id">;

export type BudgetRequest = {
    fiscal_year_id: number | null,
    name: string,
    dimension_id: number | null,
    notes: string | null,
    status?: string,
    rows: BudgetRow[],
};

export const dimensionApi = {
    // dimensions with their values (tree order), for pickers and the module
    useDimensions(config?: SWRConfiguration): SWRResponse<Dimension[]> {
        return useConsoleSwr("/dimension", authFetcher, {revalidateOnFocus: false, ...config});
    },
    addDimension: (data: DimensionRequest): Promise<Dimension> => authApiRequest("/dimension").add(data).post(),
    editDimension: (id: Id, data: DimensionRequest): Promise<Dimension> => authApiRequest(`/dimension/${id}`).add(data).put(),
    deactivateDimension: (id: Id): Promise<void> => authApiRequest(`/dimension/${id}`).delete(),

    addValue: (data: DimensionValueRequest): Promise<DimensionValue> => authApiRequest("/dimension-value").add(data).post(),
    editValue: (id: Id, data: DimensionValueRequest): Promise<DimensionValue> => authApiRequest(`/dimension-value/${id}`).add(data).put(),

    // defaults of a customer / branch / supplier / item / account
    useDefaults(type: DimensionAssignable, id: Id | null | undefined): SWRResponse<DimensionTag[]> {
        return useConsoleSwr(id ? `/dimension-default/${type}/${id}` : null, authFetcher, {revalidateOnFocus: false});
    },
    useAllDefaults(type: DimensionAssignable): SWRResponse<Record<string, DimensionTag[]>> {
        return useConsoleSwr(`/dimension-default/${type}`, authFetcher);
    },
    saveDefaults: (type: DimensionAssignable, id: Id, dimensions: DimensionTag[]): Promise<DimensionTag[]> =>
        authApiRequest(`/dimension-default/${type}/${id}`).add({dimensions}).put(),

    useProfitLoss(dimensionId: Id | null | undefined, from: string, to: string, parentId: Id | null): SWRResponse<DimensionProfitLoss> {
        return useConsoleSwr(dimensionId
            ? `/dimension-report/profit-loss?dimension_id=${dimensionId}&date_from=${from}&date_to=${to}${parentId ? `&parent_id=${parentId}` : ""}`
            : null, authFetcher);
    },

    useBudgets(fiscalYearId?: Id | null): SWRResponse<Budget[]> {
        return useConsoleSwr(`/budget${fiscalYearId ? `?fiscal_year_id=${fiscalYearId}` : ""}`, authFetcher);
    },
    useBudget(id: Id | null | undefined): SWRResponse<BudgetDetail> {
        return useConsoleSwr(id ? `/budget/${id}` : null, authFetcher, {revalidateOnFocus: false});
    },
    useBudgetMonths(fiscalYearId: Id | null | undefined): SWRResponse<string[]> {
        return useConsoleSwr(fiscalYearId ? `/budget/months?fiscal_year_id=${fiscalYearId}` : null, authFetcher, {revalidateOnFocus: false});
    },
    useBudgetReport(id: Id | null | undefined, month: string | null): SWRResponse<BudgetReport> {
        return useConsoleSwr(id ? `/budget/${id}/report${month ? `?month=${month}` : ""}` : null, authFetcher);
    },
    addBudget: (data: BudgetRequest): Promise<BudgetDetail> => authApiRequest("/budget").add(data).post(),
    editBudget: (id: Id, data: BudgetRequest): Promise<BudgetDetail> => authApiRequest(`/budget/${id}`).add(data).put(),
    deleteBudget: (id: Id): Promise<void> => authApiRequest(`/budget/${id}`).delete(),
};
