import type {DimensionTag} from "@/apis/models/dimension";

// shared by quotations, orders, delivery notes, invoices and credit notes

export type SalesTaxSummary = {
    tax_type_id: number,
    code: string,
    name: string,
    rate: number,
    taxable_amount: number,
    tax_amount: number,
};

export type DocumentDeliveryAddress = {
    recipient_name: string | null,
    address1: string,
    address2: string | null,
    address3: string | null,
    postcode: string | null,
    city: string | null,
    state: string | null,
    country: string | null,
};

/** A document created from (or feeding) this one, e.g. the orders of a quotation. */
export type RelatedDocument = {
    type: string,
    id: number,
    reference_no: string,
    date: string | null,
    status: string,
    // documents without a value (e.g. goods receipts) leave it out
    amount?: string | null,
};

export type SalesLineItem = {
    id: number,
    code: string,
    name: string,
    uom: string | null,
    item_tax_category_id: number | null,
    allow_description_override: boolean,
};

export type SalesOrderLine = {
    id: number,
    // order line -> the quotation line it came from
    source_line_id: number | null,
    item_id: number,
    item_code: string,
    description: string,
    // decimals — serialized as strings
    quantity: string,
    unit_price: string,
    discount_percent: string,
    discount_amount: string,
    tax_amount: string,
    line_total: string,
    quantity_delivered: string,
    quantity_invoiced: string,
    // quotations: quantity ordered from this line by live orders
    quantity_converted: number,
    item: SalesLineItem | null,
};

export type QuotationState = "open" | "partially_converted" | "converted" | "expired" | "cancelled";
export type SalesOrderState = "open" | "partially_delivered" | "delivered" | "completed" | "closed" | "cancelled";

/** A quotation or sales order. */
export type SalesOrderDocument = {
    id: number,
    trans_type: "sales_quotation" | "sales_order",
    trans_no: number,
    reference_no: string,
    source_quotation_id: number | null,
    customer_id: number,
    branch_id: number,
    sales_person_id: number | null,
    order_date: string,
    valid_until: string | null,
    requested_delivery_date: string | null,
    sales_type_id: number,
    payment_term_id: number,
    inventory_location_id: number | null,
    shipping_company_id: number | null,
    currency_id: number,
    exchange_rate: string,
    tax_included: boolean,
    customer_ref: string | null,
    customer_po_no: string | null,
    deliver_to: string | null,
    contact_no: string | null,
    contact_email: string | null,
    subtotal: string,
    discount_total: string,
    tax_total: string,
    grand_total: string,
    remarks: string | null,
    internal_notes: string | null,
    // active | cancelled | closed — what users see is `state`
    status: string,
    state: QuotationState | SalesOrderState,
    ordered_qty: number,
    // converted (quotation) or delivered (order) quantity
    progress_qty: number,
    invoiced_qty: number,
    customer?: {id: number, name: string},
    branch?: {id: number, name: string},
    currency?: {id: number, code: string, symbol?: string},
    sales_person?: {id: number, name: string} | null,
    source_quotation?: {id: number, reference_no: string} | null,
    // detail only
    lines?: SalesOrderLine[],
    taxes?: SalesTaxSummary[],
    delivery_address?: DocumentDeliveryAddress | null,
    related?: RelatedDocument[],
    dimensions?: DimensionTag[],
};

export type CustomerTransLine = {
    id: number,
    // delivery / invoice line -> the order line it fulfils
    sales_order_detail_id: number | null,
    // invoice line -> delivery line; credit note line -> invoice line
    src_id: number | null,
    item_id: number,
    item_code: string,
    description: string,
    // decimals — serialized as strings
    quantity: string,
    unit_price: string,
    discount_percent: string,
    discount_amount: string,
    tax_amount: string,
    line_total: string,
    standard_cost: string,
    // delivery notes: quantity invoiced; invoices: quantity credited
    quantity_done: string,
    item: (SalesLineItem & {item_type: string}) | null,
};

export type DeliveryNoteState = "uninvoiced" | "partially_invoiced" | "invoiced" | "voided";

/** A delivery note, invoice or credit note (customer_trans). */
export type CustomerTransDocument = {
    id: number,
    trans_type: "delivery_note" | "sales_invoice" | "customer_credit_note",
    trans_no: number,
    reference_no: string,
    customer_id: number,
    branch_id: number,
    sales_person_id: number | null,
    sales_order_id: number | null,
    source_trans_id: number | null,
    trans_date: string,
    due_date: string | null,
    sales_type_id: number | null,
    payment_term_id: number | null,
    inventory_location_id: number | null,
    shipping_company_id: number | null,
    customer_ref: string | null,
    deliver_to: string | null,
    contact_no: string | null,
    currency_id: number,
    exchange_rate: string,
    tax_included: boolean,
    subtotal: string,
    discount_total: string,
    tax_total: string,
    grand_total: string,
    allocated_total: string,
    remarks: string | null,
    // active | voided — what users see is `state`
    status: string,
    state: string,
    customer?: {id: number, name: string},
    branch?: {id: number, name: string},
    currency?: {id: number, code: string},
    sales_order?: {id: number, reference_no: string} | null,
    inventory_location?: {id: number, code: string, name: string} | null,
    // listing (delivery notes)
    delivered_qty?: number,
    invoiced_qty?: number,
    // detail only
    lines?: CustomerTransLine[],
    taxes?: SalesTaxSummary[],
    delivery_address?: DocumentDeliveryAddress | null,
    related?: RelatedDocument[],
    dimensions?: DimensionTag[],
    // invoices: still owed
    balance?: number,
    source_transaction?: {id: number, reference_no: string, trans_type?: string} | null,
    einvoice_submission_mode?: "S" | "I" | "H" | null,
    // credit notes
    credit_type?: "return" | "write_off" | null,
    // payments + credit notes: still to apply, and what they are applied to
    unallocated?: number,
    allocations?: CreditAllocation[],
    // payments
    bank_account_id?: number | null,
    bank_account?: {id: number, account_name: string | null} | null,
    bank_charge?: string,
};

/** An invoice a payment / credit note is applied to. */
export type CreditAllocation = {
    target_id: number,
    type: string,
    id: number,
    reference_no: string,
    date: string | null,
    due_date: string | null,
    grand_total: string,
    status: string,
    amount: string,
};

/** A customer's unpaid invoice or unapplied credit. */
export type OpenItem = {
    id: number,
    trans_type: string,
    reference_no: string,
    trans_date: string,
    due_date: string | null,
    grand_total: number,
    allocated_total: number,
    // still owed (invoice) or still to apply (credit)
    open: number,
};

export type CustomerOpenItems = {
    invoices: OpenItem[],
    credits: OpenItem[],
    // owed minus unapplied credit
    balance: number,
    overdue: number,
    unallocated: number,
};
