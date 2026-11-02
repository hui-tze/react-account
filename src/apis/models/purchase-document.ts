// purchase orders, goods receipts (GRN) and supplier documents (bills, self-billed invoices,
// credit notes, payments). Model decimals arrive as strings; computed values as numbers.
import type {DocumentDeliveryAddress, RelatedDocument, SalesTaxSummary} from "@/apis/models/sales-document";

export type PurchaseLineItem = {
    id: number,
    code: string,
    name: string,
    uom: string | null,
    item_type: string,
    item_tax_category_id?: number | null,
    allow_description_override?: boolean,
};

export type PurchaseOrderLine = {
    id: number,
    purchase_order_id: number,
    product_id: number,
    item_code: string,
    description: string,
    uom: string,
    quantity: string,
    received_qty: string,
    invoiced_qty: string,
    unit_price: string,
    tax_amount: string,
    line_total: string,
    product?: {id: number, code: string, name: string, uom_id: number | null, item_type: string, item_tax_category_id: number | null, allow_description_override: boolean, uom?: {abbreviation: string} | null} | null,
};

export type PurchaseOrderState = "outstanding" | "partially_received" | "received" | "completed" | "closed" | "cancelled";

export type PurchaseOrderDocument = {
    id: number,
    trans_type: string,
    trans_no: number,
    reference_no: string,
    supplier_id: number,
    order_date: string,
    expected_delivery: string | null,
    warehouse_id: number | null,
    // currency code
    currency: string,
    exchange_rate: string,
    subtotal: string,
    tax_total: string,
    discount_total: string,
    grand_total: string,
    tax_included: boolean,
    remarks: string | null,
    status: string,
    state: PurchaseOrderState,
    supplier?: {id: number, name: string, currency_id?: number | null, tax_group_id?: number | null, tax_included?: boolean} | null,
    warehouse?: {id: number, code: string, name: string} | null,
    details?: PurchaseOrderLine[],
    // detail only
    taxes?: SalesTaxSummary[],
    delivery_address?: DocumentDeliveryAddress | null,
    related?: RelatedDocument[],
};

export type GoodsReceiptLine = {
    id: number,
    purchase_order_item_id: number,
    item_id: number,
    item_code: string,
    description: string,
    quantity: number,
    // net of tax, order currency
    unit_cost: number,
    // as ordered
    unit_price: number,
    ordered: number,
    received_on_order: number,
    billed: number,
    returned: number,
    item: PurchaseLineItem | null,
};

export type GoodsReceiptState = "unbilled" | "partially_billed" | "billed" | "voided";

export type GoodsReceiptDocument = {
    id: number,
    purchase_order_id: number,
    supplier_id: number,
    reference_no: string,
    trans_no: number,
    receipt_date: string,
    warehouse_id: number,
    exchange_rate: string,
    remarks: string | null,
    status: string,
    state: GoodsReceiptState,
    // value received, order currency
    total: number,
    supplier?: {id: number, name: string, currency_id?: number | null} | null,
    warehouse?: {id: number, code: string, name: string} | null,
    purchase_order?: {id: number, reference_no: string, trans_type: string, currency: string, tax_included?: boolean, order_date?: string} | null,
    // detail only
    lines?: GoodsReceiptLine[],
    // received without a purchase order
    direct?: boolean,
    related?: RelatedDocument[],
};

/** Received goods not billed yet — what a bill is made from. */
export type OpenGoodsReceiptItem = {
    goods_receipt_item_id: number,
    goods_receipt_id: number,
    grn_reference_no: string,
    receipt_date: string,
    purchase_order_id: number,
    po_reference_no: string | null,
    item_id: number,
    item_code: string,
    description: string,
    received: number,
    billed: number,
    open: number,
    unit_cost: number,
    order_unit_price: number,
    order_tax_included: boolean,
    item: PurchaseLineItem | null,
};

export type SupplierTransLine = {
    id: number,
    goods_receipt_item_id: number | null,
    purchase_order_item_id?: number | null,
    // bills: a line the bill received itself (direct line)
    direct?: boolean,
    // credit notes: goods sent back
    returns_goods?: boolean,
    grn_reference_no: string | null,
    po_reference_no?: string | null,
    warehouse_id?: number | null,
    warehouse?: {id: number, code: string, name: string} | null,
    item_id: number,
    item_code: string,
    description: string,
    quantity: number,
    unit_price: number,
    tax_amount: number,
    line_total: number,
    // bills: of the received goods behind the line, across all bills / credit notes
    billed?: number,
    returned?: number,
    item: PurchaseLineItem | null,
};

/** A bill / self-billed invoice / credit note / payment a credit is applied to. */
export type SupplierAllocationRow = {
    target_id: number,
    type: string,
    id: number,
    reference_no: string,
    supplier_invoice_no?: string,
    date: string | null,
    due_date: string | null,
    grand_total: string,
    status: string,
    amount: string,
};

/** Bill, self-billed invoice, credit note or payment. */
export type SupplierTransDocument = {
    id: number,
    trans_type: string,
    trans_no: number,
    reference_no: string,
    supplier_id: number,
    // supplier's invoice / credit note no; payments: cheque or transfer reference
    supplier_invoice_no: string,
    trans_date: string,
    due_date: string,
    currency: string,
    exchange_rate: string,
    subtotal: string,
    tax_total: string,
    discount_total: string,
    grand_total: string,
    allocated_total: string,
    tax_included: boolean,
    remarks: string | null,
    status: string,
    state: string,
    // bills
    balance?: number,
    // payments / credit notes
    unallocated?: number,
    supplier?: {id: number, name: string, currency_id?: number | null, tax_group_id?: number | null, tax_included?: boolean, payment_terms_id?: number | null} | null,
    // detail only
    lines?: SupplierTransLine[],
    taxes?: SalesTaxSummary[],
    related?: RelatedDocument[],
    allocations?: SupplierAllocationRow[],
    // bills: location the direct lines came into
    warehouse_id?: number | null,
    // payments
    bank_account_id?: number | null,
    bank_account?: {id: number, account_name: string | null, account_number?: string | null} | null,
    bank_charge?: number,
};

/** A supplier's unpaid bill or unapplied credit. */
export type SupplierOpenItem = {
    id: number,
    trans_type: string,
    reference_no: string,
    supplier_invoice_no?: string,
    trans_date: string,
    due_date: string | null,
    grand_total: number,
    allocated_total: number,
    open: number,
};

export type SupplierOpenItems = {
    // bills (named like the customer side so the allocation table is shared)
    invoices: SupplierOpenItem[],
    credits: SupplierOpenItem[],
    balance: number,
    overdue: number,
    unallocated: number,
};
