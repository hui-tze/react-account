import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {CustomerOpenItems, CustomerTransDocument, DocumentDeliveryAddress} from "@/apis/models/sales-document";
import type {DimensionTag} from "@/apis/models/dimension";
import {PaginationResponse} from "@/apis/pagination";

// invoices, credit notes, payments and allocations

export type BilledLineRequest = {
    // invoice from a delivery note: the note line; credit note: the invoice line
    src_id?: number | null,
    // direct documents
    item_id?: number | null,
    description?: string,
    quantity: number | null,
    unit_price?: number | null,
    discount_percent?: number | null,
};

export type InvoiceRequest = {
    reference_no: string,
    // the delivery note being invoiced (null = direct invoice)
    source_trans_id: number | null,
    trans_date: string,
    // null = from the payment terms
    due_date: string | null,
    payment_term_id: number | null,
    shipping_company_id: number | null,
    customer_ref: string | null,
    deliver_to: string | null,
    contact_no: string | null,
    remarks: string | null,
    einvoice_submission_mode: "S" | "I" | "H" | null,
    // the user accepted going over the credit limit
    confirm_over_limit?: boolean,
    // direct invoices
    customer_id?: number | null,
    branch_id?: number | null,
    sales_type_id?: number | null,
    sales_person_id?: number | null,
    inventory_location_id?: number | null,
    exchange_rate?: number | null,
    delivery_address?: DocumentDeliveryAddress,
    dimensions: DimensionTag[],
    lines: BilledLineRequest[],
};

export type AllocationRequest = {target_id: number, amount: number};

export type CreditNoteRequest = {
    reference_no: string,
    // the invoice being credited (null = direct credit note)
    source_trans_id: number | null,
    trans_date: string,
    credit_type: "return" | "write_off" | null,
    inventory_location_id: number | null,
    customer_ref: string | null,
    remarks: string | null,
    einvoice_submission_mode: "S" | "I" | "H" | null,
    customer_id?: number | null,
    branch_id?: number | null,
    sales_type_id?: number | null,
    allocations?: AllocationRequest[],
    dimensions: DimensionTag[],
    lines: BilledLineRequest[],
};

export type PaymentRequest = {
    reference_no: string,
    customer_id: number | null,
    branch_id: number | null,
    bank_account_id: number | null,
    trans_date: string,
    // received, in the customer's currency
    amount: number | null,
    bank_charge: number | null,
    // prompt payment discount granted
    discount: number | null,
    exchange_rate: number | null,
    customer_ref: string | null,
    remarks: string | null,
    allocations: AllocationRequest[],
    dimensions: DimensionTag[],
};

/** CRUD + void endpoints of one customer_trans document type. */
function makeApi<R>(path: string) {
    return {
        // listing table — always sends `page`, so the backend paginates
        useGetAll(params: URLSearchParams): SWRResponse<PaginationResponse<CustomerTransDocument>> {
            return useConsoleSwr(`${path}?${params}`, authFetcher);
        },
        useGetOne(id: number | string | null | undefined, config?: SWRConfiguration): SWRResponse<CustomerTransDocument> {
            return useConsoleSwr(id ? `${path}/${id}` : null, authFetcher, config);
        },
        add(data: R): Promise<CustomerTransDocument> {
            return authApiRequest(path).add(data).post();
        },
        update(id: number | string, data: R): Promise<CustomerTransDocument> {
            return authApiRequest(`${path}/${id}`).add(data).put();
        },
        void(id: number | string, reason: string | null): Promise<void> {
            return authApiRequest(`${path}/${id}/void`).add({reason}).post();
        },
    };
}

export const invoiceApi = makeApi<InvoiceRequest>("/sales-invoice");
// credit notes are not edited — void and issue a new one
export const creditNoteApi = makeApi<CreditNoteRequest>("/customer-credit-note");
export const paymentApi = makeApi<PaymentRequest>("/customer-payment");

/** A customer's unpaid invoices and unapplied credits (no request until a customer is chosen). */
export function useGetCustomerOpenItems(customerId: number | null | undefined, config?: SWRConfiguration): SWRResponse<CustomerOpenItems> {
    return useConsoleSwr(customerId ? `/customer-allocation/open-items?customer_id=${customerId}` : null, authFetcher, config);
}

/** Re-applies a payment / credit note to invoices, replacing its allocations. */
export function allocateCredit(creditId: number | string, allocations: AllocationRequest[]): Promise<CustomerTransDocument> {
    return authApiRequest(`/customer-allocation/${creditId}`).add({allocations}).put();
}
