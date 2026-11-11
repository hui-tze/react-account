import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import type {DocumentDeliveryAddress} from "@/apis/models/sales-document";
import type {SalesTaxContext} from "@/apis/models/sales-lookup";
import type {
    GoodsReceiptDocument, OpenGoodsReceiptItem, PurchaseOrderDocument, SupplierOpenItems, SupplierTransDocument,
} from "@/apis/models/purchase-document";
import {PaginationResponse} from "@/apis/pagination";
import type {AllocationRequest} from "@/apis/requests/sales-billing-api";
import type {DimensionTag} from "@/apis/models/dimension";

/** Item line of an order or a direct receipt / bill / credit (discount_percent is ignored: purchases have none). */
export type PurchaseLineRequest = {
    // existing order line (edit) — keeps its receipts
    id?: number,
    item_id: number | null,
    description: string,
    quantity: number | null,
    unit_price: number | null,
    discount_percent: number | null,
};

export type PurchaseOrderRequest = {
    // blank = next number from document numbering
    reference_no: string,
    supplier_id: number | null,
    order_date: string,
    expected_delivery: string | null,
    warehouse_id: number | null,
    // null = rate on the document date
    exchange_rate: number | null,
    // null = the supplier's default
    tax_included: boolean | null,
    remarks: string | null,
    delivery_address: DocumentDeliveryAddress,
    dimensions: DimensionTag[],
    lines: PurchaseLineRequest[],
};

export type GoodsReceiptRequest = {
    reference_no: string,
    // against an order: lines name order lines
    purchase_order_id: number | null,
    receipt_date: string,
    warehouse_id: number | null,
    exchange_rate: number | null,
    remarks: string | null,
    dimensions: DimensionTag[],
    // direct receipts only
    supplier_id?: number | null,
    tax_included?: boolean | null,
    lines: {purchase_order_item_id?: number | null, item_id?: number | null, description?: string, quantity: number | null, unit_price?: number | null}[],
};

/** A bill / credit note line: received goods (goods_receipt_item_id) or an item line (item_id). */
export type SupplierLineRequest = {
    goods_receipt_item_id?: number | null,
    item_id?: number | null,
    description?: string,
    quantity: number | null,
    unit_price: number | null,
};

export type BillRequest = {
    reference_no: string,
    supplier_id: number | null,
    supplier_invoice_no: string | null,
    trans_date: string,
    due_date: string | null,
    exchange_rate: number | null,
    tax_included: boolean | null,
    // where direct stock lines come in
    warehouse_id: number | null,
    remarks: string | null,
    dimensions: DimensionTag[],
    lines: SupplierLineRequest[],
};

export type SupplierCreditNoteRequest = {
    reference_no: string,
    supplier_id: number | null,
    // the bill being credited — applied to it straight away
    source_bill_id: number | null,
    supplier_invoice_no: string | null,
    trans_date: string,
    exchange_rate: number | null,
    tax_included: boolean | null,
    remarks: string | null,
    dimensions: DimensionTag[],
    lines: SupplierLineRequest[],
};

export type SupplierPaymentRequest = {
    reference_no: string,
    supplier_id: number | null,
    trans_date: string,
    bank_account_id: number | null,
    amount: number | null,
    bank_charge: number | null,
    discount: number | null,
    exchange_rate: number | null,
    payment_ref: string | null,
    remarks: string | null,
    dimensions: DimensionTag[],
    allocations: AllocationRequest[],
};

type Id = number | string;

export const purchaseOrderApi = {
    // listing table — always sends `page`, so the backend paginates
    useGetAll(params: URLSearchParams): SWRResponse<PaginationResponse<PurchaseOrderDocument>> {
        return useConsoleSwr(`/purchase-order?${params}`, authFetcher);
    },
    useGetOne(id: Id | null | undefined, config?: SWRConfiguration): SWRResponse<PurchaseOrderDocument> {
        return useConsoleSwr(id ? `/purchase-order/${id}` : null, authFetcher, config);
    },
    /** A supplier's orders with something still to receive (no request until a supplier is picked). */
    useOpen(supplierId: number | null | undefined): SWRResponse<PurchaseOrderDocument[]> {
        return useConsoleSwr(supplierId ? `/purchase-order?state=open&supplier_id=${supplierId}` : null, authFetcher);
    },
    add: (data: PurchaseOrderRequest): Promise<PurchaseOrderDocument> => authApiRequest("/purchase-order").add(data).post(),
    update: (id: Id, data: PurchaseOrderRequest): Promise<PurchaseOrderDocument> => authApiRequest(`/purchase-order/${id}`).add(data).put(),
    cancel: (id: Id): Promise<void> => authApiRequest(`/purchase-order/${id}/cancel`).post(),
    close: (id: Id): Promise<void> => authApiRequest(`/purchase-order/${id}/close`).post(),
    reopen: (id: Id): Promise<void> => authApiRequest(`/purchase-order/${id}/reopen`).post(),
};

export const goodsReceiptApi = {
    useGetAll(params: URLSearchParams): SWRResponse<PaginationResponse<GoodsReceiptDocument>> {
        return useConsoleSwr(`/goods-receipt?${params}`, authFetcher);
    },
    useGetOne(id: Id | null | undefined, config?: SWRConfiguration): SWRResponse<GoodsReceiptDocument> {
        return useConsoleSwr(id ? `/goods-receipt/${id}` : null, authFetcher, config);
    },
    /** A supplier's received goods not billed yet. */
    useOpenItems(supplierId: number | null | undefined, config?: SWRConfiguration): SWRResponse<OpenGoodsReceiptItem[]> {
        return useConsoleSwr(supplierId ? `/goods-receipt/open-items?supplier_id=${supplierId}` : null, authFetcher, config);
    },
    add: (data: GoodsReceiptRequest): Promise<GoodsReceiptDocument> => authApiRequest("/goods-receipt").add(data).post(),
    update: (id: Id, data: GoodsReceiptRequest): Promise<GoodsReceiptDocument> => authApiRequest(`/goods-receipt/${id}`).add(data).put(),
    void: (id: Id, reason: string | null): Promise<void> => authApiRequest(`/goods-receipt/${id}/void`).add({reason}).post(),
};

/** CRUD + void endpoints of one supplier_trans document type. */
function makeSupplierTransApi<R>(path: string) {
    return {
        useGetAll(params: URLSearchParams): SWRResponse<PaginationResponse<SupplierTransDocument>> {
            return useConsoleSwr(`${path}?${params}`, authFetcher);
        },
        useGetOne(id: Id | null | undefined, config?: SWRConfiguration): SWRResponse<SupplierTransDocument> {
            return useConsoleSwr(id ? `${path}/${id}` : null, authFetcher, config);
        },
        add: (data: R): Promise<SupplierTransDocument> => authApiRequest(path).add(data).post(),
        update: (id: Id, data: R): Promise<SupplierTransDocument> => authApiRequest(`${path}/${id}`).add(data).put(),
        void: (id: Id, reason: string | null): Promise<void> => authApiRequest(`${path}/${id}/void`).add({reason}).post(),
    };
}

export type BillKind = "bill" | "self_billed";

export const billApis: Record<BillKind, ReturnType<typeof makeSupplierTransApi<BillRequest>>> = {
    bill: makeSupplierTransApi<BillRequest>("/supplier-bill"),
    self_billed: makeSupplierTransApi<BillRequest>("/self-billed-invoice"),
};

// credit notes are not edited — void and issue a new one
export const supplierCreditNoteApis: Record<BillKind, ReturnType<typeof makeSupplierTransApi<SupplierCreditNoteRequest>>> = {
    bill: makeSupplierTransApi<SupplierCreditNoteRequest>("/supplier-credit-note"),
    self_billed: makeSupplierTransApi<SupplierCreditNoteRequest>("/self-billed-credit-note"),
};

export const supplierPaymentApi = makeSupplierTransApi<SupplierPaymentRequest>("/supplier-payment");

/** A supplier's unpaid bills and unapplied credits (no request until a supplier is chosen). */
export function useGetSupplierOpenItems(supplierId: number | null | undefined, config?: SWRConfiguration): SWRResponse<SupplierOpenItems> {
    return useConsoleSwr(supplierId ? `/supplier-allocation/open-items?supplier_id=${supplierId}` : null, authFetcher, config);
}

/** Payments and credit notes with something left to apply. */
export function useGetUnallocatedSupplierCredits(supplierId?: number | null): SWRResponse<SupplierTransDocument[]> {
    return useConsoleSwr(`/supplier-allocation/unallocated${supplierId ? `?supplier_id=${supplierId}` : ""}`, authFetcher);
}

/** Re-applies a payment / credit note to bills, replacing its allocations. */
export function allocateSupplierCredit(creditId: Id, allocations: AllocationRequest[]): Promise<SupplierTransDocument> {
    return authApiRequest(`/supplier-allocation/${creditId}`).add({allocations}).put();
}

/** Purchase taxes the supplier charges plus item tax category exemptions. */
export function useGetPurchaseTaxContext(supplierId: number | null | undefined): SWRResponse<SalesTaxContext> {
    return useConsoleSwr(supplierId ? `/purchases/lookups/tax-context?supplier_id=${supplierId}` : null, authFetcher);
}

/** The supplier's price per item id (per stock unit) valid on the date. */
export function useGetSupplierPrices(supplierId: number | null | undefined, date: string | null | undefined): SWRResponse<Record<string, number>> {
    return useConsoleSwr(supplierId && date ? `/purchases/lookups/supplier-prices?supplier_id=${supplierId}&date=${date}` : null, authFetcher);
}
