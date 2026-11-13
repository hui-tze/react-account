import type {SWRResponse} from "swr";
import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";

/*
 * Reports of every module (laravel-account App\Domain\Services\Reports). Every report comes back
 * in one shape — columns, sections of rows, totals — so a single screen can show any of them.
 */

export type ReportColumnType = "text" | "date" | "datetime" | "money" | "qty" | "number" | "percent";
export type ReportColumn = {key: string, label: string, type: ReportColumnType, sum: boolean};

export type ReportValue = string | number | null | undefined;
// a row is column key → value, plus the document it opens and how it is emphasised
export type ReportRow = Record<string, ReportValue> & {_doc?: {type: string, id: number} | null, _class?: "strong" | "muted" | null};
export type ReportTotals = Record<string, number | null | undefined> | null;

export type ReportSection = {title: string | null, subtitle: string | null, rows: ReportRow[], totals: ReportTotals};
export type ReportFigure = {label: string, value: number | string | null, type: ReportColumnType};

export type ReportResult = {
    key: string,
    title: string,
    section: string,
    company: string | null,
    criteria: {label: string, value: string, type: string}[],
    generated_at: string,
    columns: ReportColumn[],
    sections: ReportSection[],
    totals: ReportTotals,
    totals_label: string,
    summary: ReportFigure[],
    notes: string[],
    row_count: number,
};

export type ReportFilter = {
    key: string,
    label: string,
    type: "date" | "select" | "boolean",
    required: boolean,
    default: string | number | boolean | null,
    options: {value: string | number, label: string}[] | null,
};

export type ReportMeta = {key: string, section: string, section_title: string, title: string, description: string, filters: ReportFilter[]};
export type ReportCatalogSection = {key: string, title: string, reports: {key: string, title: string, description: string}[]};

export type ReportExportFormat = "csv" | "pdf";

export const reportApi = {
    // sections the user's role may view, each with its reports
    useCatalog(): SWRResponse<ReportCatalogSection[]> {
        return useConsoleSwr("/report", authFetcher, {revalidateOnFocus: false});
    },
    useMeta(key: string | null | undefined): SWRResponse<ReportMeta> {
        return useConsoleSwr(key ? `/report/${key}/meta` : null, authFetcher, {revalidateOnFocus: false});
    },
    // `query` is the filter values as a query string; null holds the request back
    useRun(key: string | null | undefined, query: string | null): SWRResponse<ReportResult> {
        return useConsoleSwr(key && query !== null ? `/report/${key}?${query}` : null, authFetcher, {revalidateOnFocus: false, keepPreviousData: true});
    },
    // the report as a file (fetched with the session's token)
    export: (key: string, query: string, format: ReportExportFormat): Promise<Blob> =>
        authApiRequest(`/report/${key}/export?${query}${query ? "&" : ""}format=${format}`).sendQueryRequest("GET", true),
};
