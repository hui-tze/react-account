import type {SelectOption} from "@/components/FormField/FormFields";

export type EinvoiceEnvironment = "SANDBOX" | "PROD";
export type EinvoiceIdType = "BRN" | "NRIC" | "PASSPORT" | "ARMY";
export type EinvoiceSubmissionMode = "IMMEDIATE" | "SCHEDULED" | "MANUAL";

// our processing state of a document (LHDN's own status is lhdn_status)
export type EinvoiceProcessStatus = "PENDING" | "SUBMITTING" | "SUBMITTED" | "VALID" | "INVALID" | "CANCELLED" | "FAILED" | "EXCLUDED";

// trans types that go to MyInvois
export type EinvoiceTransType = "sales_invoice" | "customer_credit_note" | "self_billed_invoice" | "self_billed_credit_note";

export type EinvoiceSetting = {
    is_einvoice_enabled: boolean,
    einvoice_start_date: string | null,
    environment: EinvoiceEnvironment,
    // overrides the environment's API host (rarely needed)
    api_base_url: string | null,
    client_id: string | null,
    // the secret itself is write-only
    has_client_secret: boolean,
    id_type: EinvoiceIdType,
    id_value: string | null,
    ttx_reg_no: string | null,
    msic_code: string | null,
    business_activity_description: string | null,
    default_classification_code: string,
    is_intermediary: boolean,
    on_behalf_of_tin: string | null,
    cron_enabled: boolean,
    // daily window (HH:mm, Malaysia time) for documents marked "Scheduled"
    scheduled_time: string,
    self_billed_submission_mode: EinvoiceSubmissionMode,
    certificate: {alias: string | null, serial_no: string | null, expiry_date: string | null} | null,
    company: {name: string, tin: string | null, registration_no: string | null, tax_no: string | null},
    endpoints: Record<EinvoiceEnvironment, string>,
};

export type EinvoiceCodes = {
    tax_types: SelectOption[],
    classifications: SelectOption[],
    units: SelectOption[],
    msic: SelectOption[],
    states: SelectOption[],
    id_types: SelectOption[],
};

export type EinvoiceDocument = {
    id: number,
    trans_type: EinvoiceTransType,
    trans_id: number,
    revision_no: number,
    einv_type_code: string,
    einv_type_version: string,
    doc_number: string,
    doc_date: string,
    currency_code: string,
    buyer_name: string | null,
    buyer_tin: string | null,
    total_excl_tax: string,
    total_tax_amount: string,
    total_payable: string,
    submission_mode: string,
    process_status: EinvoiceProcessStatus,
    lhdn_status: "Submitted" | "Valid" | "Invalid" | "Cancelled" | "Rejected" | null,
    uuid: string | null,
    long_id: string | null,
    validation_link: string | null,
    submission_uid: string | null,
    date_time_received: string | null,
    date_time_validated: string | null,
    cancel_deadline_at: string | null,
    cancelled_at: string | null,
    rejection_state: string,
    attempt_count: number,
    last_error_code: string | null,
    last_error_message: string | null,
    created_at: string,
    updated_at: string,
    can_cancel?: boolean,
    can_submit?: boolean,
};

export type EinvoiceValidationStep = {
    id: number,
    step_name: string,
    step_status: "Valid" | "Invalid" | "Submitted",
    error_code: string | null,
    error_message: string | null,
    error_target: string | null,
};

export type EinvoiceStatusLog = {
    id: number,
    event_type: string,
    from_status: string | null,
    to_status: string | null,
    source: string,
    actor: string | null,
    remarks: string | null,
    created_at: string,
};

export type EinvoiceDocumentDetail = EinvoiceDocument & {
    doc_hash: string | null,
    buyer_id_type: string | null,
    buyer_id_value: string | null,
    buyer_sst_no: string | null,
    buyer_email: string | null,
    supplier_tin: string,
    line_count: number,
    references: {id: number, ref_uuid: string | null, ref_doc_number: string | null, ref_trans_type: string | null, ref_trans_id: number | null}[],
    validations: EinvoiceValidationStep[],
    status_logs: EinvoiceStatusLog[],
    revisions: {id: number, revision_no: number, process_status: EinvoiceProcessStatus, lhdn_status: string | null, uuid: string | null, created_at: string}[],
};

/** E-invoice state of one sales / self-billed document, shown on its page. */
export type EinvoiceSourceStatus = {
    enabled: boolean,
    environment: EinvoiceEnvironment | null,
    supported: boolean,
    document: EinvoiceDocument | null,
};

/** A sales / self-billed document not yet accepted by LHDN. `id` is synthetic; `trans_id` is the document. */
export type EinvoiceOutstanding = {
    id: number,
    trans_id: number,
    trans_type: EinvoiceTransType,
    reference_no: string,
    trans_date: string,
    grand_total: string,
    party_name: string,
    einvoice_submission_mode: "S" | "I" | "H" | null,
    einvoice: {id: number, process_status: EinvoiceProcessStatus, lhdn_status: string | null, last_error_message: string | null} | null,
};

// where the user fixes a readiness problem
export type EinvoiceFix = {type: "settings" | "profile" | "taxes" | "customer" | "supplier" | "document", id?: number} | null;

/** Can a document go to MyInvois as entered (company setup, party, and — once saved — lines and tax). */
export type EinvoiceReadiness = {
    supported: boolean,
    enabled: boolean,
    environment: EinvoiceEnvironment | null,
    // a signing certificate is uploaded (document version 1.1)
    signed: boolean,
    start_date: string | null,
    // submission mode of documents without their own choice (and of self-billed ones)
    default_mode: EinvoiceSubmissionMode,
    scheduled_time: string,
    auto_submit: boolean,
    errors: {message: string, fix: EinvoiceFix}[],
    notices: {level: "warning" | "info", message: string, fix: EinvoiceFix}[],
    ready: boolean,
};

/** Last LHDN answer for a TIN + ID pair. */
export type EinvoiceTinStatus = {
    status: "valid" | "invalid" | "unknown",
    validated_at: string | null,
    // answered from the cache, without calling LHDN
    cached: boolean,
};
