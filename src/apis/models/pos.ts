import type {CustomerTransDocument} from "@/apis/models/sales-document";

export type PosPaymentMethod = "cash" | "card" | "ewallet" | "qr" | "cheque" | "other";
export const POS_PAYMENT_METHODS: PosPaymentMethod[] = ["cash", "card", "ewallet", "qr", "cheque", "other"];

/** E-invoice of a consolidated POS document: the month's consolidated e-invoice it is (or will be) in. */
export type PosConsolidation = {
    period: string,
    // LHDN: 7 days after the month ends
    deadline: string,
    batch_id: number | null,
    document: {
        id: number,
        doc_number: string,
        process_status: string,
        lhdn_status: string | null,
        uuid: string | null,
        long_id: string | null,
        validation_link: string | null,
        date_time_validated: string | null,
    } | null,
};

/** A POS receipt or POS credit note (customer_trans). */
export type PosDocument = Omit<CustomerTransDocument, "trans_type" | "customer_id" | "branch_id" | "einvoice_submission_mode"> & {
    trans_type: "pos_receipt" | "pos_credit_note",
    customer_id: number | null,
    branch_id: number | null,
    pos_setting_id: number,
    pos_setting?: {id: number, name: string, account_id?: number, location_id?: number} | null,
    payor_name: string | null,
    identity_no: string | null,
    payment_method: PosPaymentMethod | null,
    tendered_amount: string | null,
    change_amount?: number,
    paid_amount: string,
    // C = in the monthly consolidated e-invoice; S / I / H = its own e-invoice
    einvoice_submission_mode: "C" | "S" | "I" | "H" | null,
    einvoice_treatment: "consolidated" | "individual",
    // walk-in name or the customer's
    buyer_name: string,
    state: "completed" | "voided",
    sales_type?: {id: number, name: string, tax_included: boolean} | null,
    consolidation?: PosConsolidation | null,
    // receipts: the POS credit notes refunding it
    credit_notes?: {id: number, type: string, reference_no: string, date: string | null, grand_total: string, status: string}[],
};

export type ConsolidationSource = "pos_receipt" | "pos_credit_note";

export type ConsolidationEinvoice = {
    id: number,
    doc_number: string,
    revision_no: number,
    process_status: string,
    lhdn_status: string | null,
    uuid: string | null,
    long_id: string | null,
    validation_link: string | null,
    date_time_validated: string | null,
    cancel_deadline_at: string | null,
    last_error_message: string | null,
    can_cancel: boolean,
};

/** A month's consolidated e-invoice (or a supplementary one for late documents). */
export type ConsolidationBatch = {
    id: number,
    period: string,
    source_type: ConsolidationSource,
    einvoice_type: "consolidated_invoice" | "consolidated_credit_note",
    doc_number: string,
    supplementary: boolean,
    // OPEN: built, not with LHDN; SUBMITTED: with LHDN; VOID: released
    status: "OPEN" | "SUBMITTED" | "VOID",
    count: number,
    line_count: number,
    total_excl_tax: number,
    total_tax: number,
    total: number,
    from: string | null,
    to: string | null,
    deadline: string | null,
    einvoice: ConsolidationEinvoice | null,
    // detail only
    documents?: ConsolidationDocument[],
};

export type ConsolidationDocument = {
    id: number,
    type: ConsolidationSource,
    reference_no: string,
    date: string,
    pos?: string | null,
    buyer?: string | null,
    line_group?: string | null,
    tax: number,
    total: number,
};

export type ConsolidationMonth = {
    period: string,
    deadline: string,
    has_activity: boolean,
    // something still waiting after the deadline
    overdue: boolean,
    kinds: Record<ConsolidationSource, {
        einvoice_type: string,
        pending_count: number,
        pending_total: number,
        batches: ConsolidationBatch[],
    }>,
};

export type ConsolidationOverview = {
    year: number,
    start_date: string | null,
    months: ConsolidationMonth[],
};

export type ConsolidationPreview = {
    period: string,
    source_type: ConsolidationSource,
    deadline: string,
    count: number,
    total_excl_tax: number,
    total_tax: number,
    total: number,
    documents: ConsolidationDocument[],
};

/** A consolidated POS document not yet in a consolidated e-invoice LHDN has. */
export type PendingConsolidationDocument = {
    id: number,
    trans_type: ConsolidationSource,
    reference_no: string,
    trans_date: string,
    buyer_name: string,
    pos: string | null,
    grand_total: number,
    tax_total: number,
    currency: string | null,
    period: string,
    deadline: string,
    overdue: boolean,
    // waiting: not in a batch yet; in_batch: in a batch whose e-invoice failed / was rejected / cancelled
    state: "waiting" | "in_batch",
    batch: {id: number, doc_number: string, process_status: string | null, last_error_message: string | null} | null,
};
