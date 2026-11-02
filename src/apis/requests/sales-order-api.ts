import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {DocumentDeliveryAddress, SalesOrderDocument} from "@/apis/models/sales-document";
import {PaginationResponse} from "@/apis/pagination";

export type SalesLineRequest = {
    // existing line (edit) — keeps its delivered / converted history
    id?: number,
    // order line converted from a quotation line
    source_line_id?: number | null,
    item_id: number | null,
    description: string,
    quantity: number | null,
    unit_price: number | null,
    discount_percent: number | null,
};

export type SalesOrderRequest = {
    // blank = next number from document numbering
    reference_no: string,
    customer_id: number | null,
    branch_id: number | null,
    order_date: string,
    valid_until: string | null,
    requested_delivery_date: string | null,
    sales_type_id: number | null,
    payment_term_id: number | null,
    sales_person_id: number | null,
    inventory_location_id: number | null,
    shipping_company_id: number | null,
    // null = rate on the document date
    exchange_rate: number | null,
    customer_ref: string | null,
    customer_po_no: string | null,
    deliver_to: string | null,
    contact_no: string | null,
    contact_email: string | null,
    remarks: string | null,
    internal_notes: string | null,
    delivery_address: DocumentDeliveryAddress,
    source_quotation_id?: number | null,
    lines: SalesLineRequest[],
};

/** Endpoints of one sales_orders document type (quotation or order). */
function makeSalesOrderApi(path: "/sales-quotation" | "/sales-order") {
    return {
        // listing table — always sends `page`, so the backend paginates
        useGetAll(params: URLSearchParams): SWRResponse<PaginationResponse<SalesOrderDocument>> {
            return useConsoleSwr(`${path}?${params}`, authFetcher);
        },
        useGetOne(id: number | string | null | undefined, config?: SWRConfiguration): SWRResponse<SalesOrderDocument> {
            return useConsoleSwr(id ? `${path}/${id}` : null, authFetcher, config);
        },
        add(data: SalesOrderRequest): Promise<SalesOrderDocument> {
            return authApiRequest(path).add(data).post();
        },
        update(id: number | string, data: SalesOrderRequest): Promise<SalesOrderDocument> {
            return authApiRequest(`${path}/${id}`).add(data).put();
        },
        cancel(id: number | string): Promise<void> {
            return authApiRequest(`${path}/${id}/cancel`).post();
        },
    };
}

export const quotationApi = makeSalesOrderApi("/sales-quotation");

export const orderApi = {
    ...makeSalesOrderApi("/sales-order"),
    // the undelivered balance will not be delivered
    close(id: number | string): Promise<void> {
        return authApiRequest(`/sales-order/${id}/close`).post();
    },
};
