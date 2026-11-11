import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import type {DimensionTag} from "@/apis/models/dimension";
import type {SalesLineRequest} from "@/apis/requests/sales-order-api";
import type {PaginationResponse} from "@/apis/pagination";
import type {
    ConsolidationBatch, ConsolidationOverview, ConsolidationPreview, ConsolidationSource, PosDocument, PosPaymentMethod,
} from "@/apis/models/pos";

// the shared sales line grid's shape: item, description, qty, price, discount
export type PosReceiptLineRequest = SalesLineRequest;

export type PosReceiptRequest = {
    pos_setting_id: number | null,
    reference_no: string,
    trans_date: string,
    // the buyer: a customer, or a walk-in with optional details
    customer_id: number | null,
    branch_id: number | null,
    payor_name: string | null,
    identity_no: string | null,
    contact_no: string | null,
    customer_ref: string | null,
    // price list (blank: the POS's)
    sales_type_id: number | null,
    sales_person_id?: number | null,
    payment_method: PosPaymentMethod,
    tendered_amount: number | null,
    remarks: string | null,
    // the buyer wants their own e-invoice (above RM10,000 always)
    einvoice_individual: boolean,
    einvoice_submission_mode: "S" | "I" | "H" | null,
    dimensions: DimensionTag[],
    lines: PosReceiptLineRequest[],
};

export type PosCreditNoteRequest = {
    // the receipt being refunded
    source_trans_id: number,
    // the counter paying out (default: the receipt's)
    pos_setting_id: number | null,
    reference_no: string,
    trans_date: string,
    credit_type: "return" | "write_off" | null,
    payment_method: PosPaymentMethod | null,
    customer_ref: string | null,
    remarks: string | null,
    einvoice_submission_mode: "S" | "I" | "H" | null,
    dimensions: DimensionTag[],
    // receipt lines refunded
    lines: {src_id: number, quantity: number | null}[],
};

/** List / view / create / void of one POS document type (they are never edited). */
function makePosApi<R>(path: string) {
    return {
        // listing table — always sends `page`, so the backend paginates
        useGetAll(params: URLSearchParams): SWRResponse<PaginationResponse<PosDocument>> {
            return useConsoleSwr(`${path}?${params}`, authFetcher);
        },
        useGetOne(id: number | string | null | undefined, config?: SWRConfiguration): SWRResponse<PosDocument> {
            return useConsoleSwr(id ? `${path}/${id}` : null, authFetcher, config);
        },
        add(data: R): Promise<PosDocument> {
            return authApiRequest(path).add(data).post();
        },
        void(id: number | string, reason: string | null): Promise<void> {
            return authApiRequest(`${path}/${id}/void`).add({reason}).post();
        },
    };
}

export const posReceiptApi = makePosApi<PosReceiptRequest>("/pos-receipt");
export const posCreditNoteApi = makePosApi<PosCreditNoteRequest>("/pos-credit-note");

/** Monthly consolidated e-invoices of POS receipts / refunds. */
export const consolidationApi = {
    useOverview(year: number): SWRResponse<ConsolidationOverview> {
        return useConsoleSwr(`/einvoice/consolidation?year=${year}`, authFetcher);
    },
    usePreview(period: string | null, source: ConsolidationSource | null): SWRResponse<ConsolidationPreview> {
        return useConsoleSwr(period && source ? `/einvoice/consolidation/preview?period=${period}&source_type=${source}` : null, authFetcher);
    },
    useBatch(id: number | null): SWRResponse<ConsolidationBatch> {
        return useConsoleSwr(id ? `/einvoice/consolidation/batches/${id}` : null, authFetcher);
    },
    /** Build the month's consolidated e-invoice and submit it to LHDN. */
    consolidate(period: string, source: ConsolidationSource): Promise<ConsolidationBatch> {
        return authApiRequest("/einvoice/consolidation").add({period, source_type: source}).post();
    },
    resubmit(id: number): Promise<ConsolidationBatch> {
        return authApiRequest(`/einvoice/consolidation/batches/${id}/resubmit`).post();
    },
    release(id: number): Promise<void> {
        return authApiRequest(`/einvoice/consolidation/batches/${id}/release`).post();
    },
};
