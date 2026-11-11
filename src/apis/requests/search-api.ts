import type {SWRResponse} from "swr";
import {authFetcher, useConsoleSwr} from "@/lib/request-client/client";

/** Which part of a document matched the search (null: the reference number itself). */
export type SearchMatchField =
    | "line" | "party" | "amount" | "customer_ref" | "supplier_ref" | "remarks" | "notes" | "memo"
    | "deliver_to" | "payor" | "payee" | "source_reference" | "batch" | "contact_no";

export type SearchDocument = {
    type: string,
    id: number,
    reference_no: string,
    date: string | null,
    party: string | null,
    amount: number | null,
    currency: string | null,
    status: string,
    match: {field: SearchMatchField, text: string} | null,
};

export type SearchRecord = {id: number, name: string, code: string | null, tin?: string | null, item_type?: string, status: string};

export type SearchResults = {
    query: string,
    documents: SearchDocument[],
    records: Partial<Record<"customers" | "suppliers" | "items" | "accounts", SearchRecord[]>>,
};

export const searchApi = {
    /**
     * Search documents and records; `types` limits documents to those types, `from` / `to` to a
     * document date range (with a range and no text: every document of the period).
     */
    useSearch(query: string, limit = 8, types?: string[], from?: string | null, to?: string | null): SWRResponse<SearchResults> {
        const q = query.trim();
        const enabled = q.length >= 2 || /^\d$/.test(q) || (!q && (!!from || !!to));
        const params = new URLSearchParams({
            ...(q ? {q} : {}),
            limit: String(limit),
            ...(types?.length ? {types: types.join(",")} : {}),
            ...(from ? {date_from: from} : {}),
            ...(to ? {date_to: to} : {}),
        });
        return useConsoleSwr(enabled ? `/search?${params}` : null, authFetcher, {revalidateOnFocus: false, keepPreviousData: true, dedupingInterval: 10_000});
    },
};
