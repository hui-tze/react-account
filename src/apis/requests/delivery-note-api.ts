import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {CustomerTransDocument, DocumentDeliveryAddress} from "@/apis/models/sales-document";
import type {DimensionTag} from "@/apis/models/dimension";
import {PaginationResponse} from "@/apis/pagination";
import {SalesLineRequest} from "@/apis/requests/sales-order-api";

export type DeliveryLineRequest = {
    sales_order_detail_id: number,
    // 0 / null = not shipping this line now (dropped before sending)
    quantity: number | null,
};

export type DeliveryNoteRequest = {
    // blank = next number from document numbering
    reference_no: string,
    sales_order_id: number,
    trans_date: string,
    inventory_location_id: number | null,
    shipping_company_id: number | null,
    customer_ref: string | null,
    deliver_to: string | null,
    contact_no: string | null,
    remarks: string | null,
    // the rest of the order will not be delivered
    close_order_balance: boolean,
    delivery_address: DocumentDeliveryAddress,
    dimensions: DimensionTag[],
    lines: DeliveryLineRequest[],
};

/** A delivery without a sales order: the note names the customer, prices and items itself. */
export type DirectDeliveryRequest = {
    reference_no: string,
    sales_order_id: null,
    customer_id: number | null,
    branch_id: number | null,
    sales_type_id: number | null,
    payment_term_id: number | null,
    sales_person_id: number | null,
    exchange_rate: number | null,
    trans_date: string,
    inventory_location_id: number | null,
    shipping_company_id: number | null,
    customer_ref: string | null,
    deliver_to: string | null,
    contact_no: string | null,
    remarks: string | null,
    delivery_address: DocumentDeliveryAddress,
    dimensions: DimensionTag[],
    lines: SalesLineRequest[],
};

// listing table — always sends `page`, so the backend paginates
export function useGetAllDeliveryNote(params: URLSearchParams): SWRResponse<PaginationResponse<CustomerTransDocument>> {
    return useConsoleSwr(`/delivery-note?${params}`, authFetcher);
}

export function useGetOneDeliveryNote(id: number | string | null | undefined, config?: SWRConfiguration): SWRResponse<CustomerTransDocument> {
    return useConsoleSwr(id ? `/delivery-note/${id}` : null, authFetcher, config);
}

export function addDeliveryNote(data: DeliveryNoteRequest | DirectDeliveryRequest): Promise<CustomerTransDocument> {
    return authApiRequest("/delivery-note").add(data).post();
}

export function updateDeliveryNote(id: number | string, data: DeliveryNoteRequest | DirectDeliveryRequest): Promise<CustomerTransDocument> {
    return authApiRequest(`/delivery-note/${id}`).add(data).put();
}

/** Stock comes back and the order reopens for the quantity. */
export function voidDeliveryNote(id: number | string, reason: string | null): Promise<void> {
    return authApiRequest(`/delivery-note/${id}/void`).add({reason}).post();
}
