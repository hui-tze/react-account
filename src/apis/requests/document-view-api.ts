import type {SWRResponse} from "swr";
import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {DimensionTag} from "@/apis/models/dimension";

type Fact = {key: string, value: string};

export type DocumentViewParty = {
    role: "customer" | "supplier" | "other" | string,
    name: string | null,
    branch?: string | null,
    tin: string | null,
    registration_no: string | null,
    address: string[],
};

export type DocumentViewLine = {
    no: number,
    item?: string | null,
    description?: string | null,
    quantity?: number,
    uom?: string | null,
    unit_price?: number,
    discount?: number | null,
    discount_percent?: number | null,
    tax?: number,
    amount?: number,
    account?: string,
    memo?: string | null,
    dimensions?: DimensionTag[],
    debit?: number,
    credit?: number,
};

export type DocumentViewEinvoice = {
    id: number,
    environment: string | null,
    revision_no: number,
    process_status: string | null,
    lhdn_status: string | null,
    uuid: string | null,
    long_id: string | null,
    validation_link: string | null,
    submission_uid: string | null,
    date_time_received: string | null,
    date_time_validated: string | null,
    cancel_deadline_at: string | null,
    cancelled_at: string | null,
    last_error_message: string | null,
    einv_type_code: string | null,
    doc_number?: string | null,
    // a POS document reported in the month's consolidated e-invoice
    consolidated?: boolean,
};

/** Read-only view of any document, as shown in the preview popup and printed to PDF. */
export type DocumentView = {
    type: string,
    type_label: string,
    id: number,
    reference_no: string | null,
    status: string | null,
    state: string | null,
    void_reason: string | null,
    currency: string | null,
    company: {name: string | null, registration_no: string | null, tin: string | null, tax_no: string | null, address: string[]},
    party: DocumentViewParty | null,
    ship_to: {name: string | null, attention: string | null, address: string[], contact: string | null} | null,
    dates: Fact[],
    facts: Fact[],
    line_columns: string[],
    lines: DocumentViewLine[],
    totals: {key: string, label?: string, amount: number, strong?: boolean, currency?: string | null}[],
    allocations: {type: string | null, id: number | null, reference_no: string | null, date: string | null, amount: number}[],
    // payments / credit notes applied to an invoice or bill
    payments: {
        type: string, type_label: string, id: number, reference_no: string | null, date: string | null, applied_on: string | null,
        payment_ref: string | null, bank_account: string | null, amount: number, voided: boolean,
    }[],
    notes: Fact[],
    dimensions: {dimension: string, code: string, name: string}[],
    einvoice: DocumentViewEinvoice | null,
};

/** Document types the preview can show. */
export const PREVIEWABLE_TYPES = [
    "sales_quotation", "sales_order", "delivery_note", "sales_invoice", "customer_credit_note", "customer_payment",
    "pos_receipt", "pos_credit_note", "purchase_order", "purchase_order_delivery", "supplier_bill", "self_billed_invoice", "supplier_credit_note",
    "self_billed_credit_note", "supplier_payment", "bank_payment", "bank_deposit", "funds_transfer", "journal_entry",
];

export const documentViewApi = {
    useView(type: string | null, id: number | null): SWRResponse<DocumentView> {
        return useConsoleSwr(type && id ? `/document-view/${type}/${id}` : null, authFetcher, {revalidateOnFocus: false});
    },
    // the PDF as a file (fetched with the session's token)
    pdf: (type: string, id: number): Promise<Blob> => authApiRequest(`/document-view/${type}/${id}/pdf`).sendQueryRequest("GET", true),
};
