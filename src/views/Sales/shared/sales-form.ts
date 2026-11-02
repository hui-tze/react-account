import type {CompanyAddress} from "@/apis/models/company";
import type {DocumentDeliveryAddress, SalesOrderDocument} from "@/apis/models/sales-document";
import type {SalesLineRequest, SalesOrderRequest} from "@/apis/requests/sales-order-api";
import {blankToNull} from "@/views/Settings/Organization/Profile/profile-form";
import {today} from "@/views/Inventory/shared/document";

export const EMPTY_LINE: SalesLineRequest = {item_id: null, description: "", quantity: 1, unit_price: null, discount_percent: 0};

export const EMPTY_DELIVERY_ADDRESS: DocumentDeliveryAddress = {
    recipient_name: null, address1: "", address2: null, address3: null, postcode: null, city: null, state: null, country: null,
};

/** A branch's primary (else first) address as a document delivery address. */
export function toDeliveryAddress(address: CompanyAddress | undefined | null): DocumentDeliveryAddress {
    if (!address) {
        return {...EMPTY_DELIVERY_ADDRESS};
    }
    return {
        recipient_name: null,
        address1: address.address1 ?? "",
        address2: address.address2,
        address3: address.address3,
        postcode: address.postcode,
        city: address.city,
        state: address.state,
        country: address.country,
    };
}

export function addDays(date: string, days: number): string {
    const [y, m, d] = date.split("-").map(Number);
    const next = new Date(y, m - 1, d + days);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}`;
}

export function blankOrderValues(kind: "quotation" | "order"): SalesOrderRequest {
    const date = today();
    return {
        reference_no: "",
        customer_id: null,
        branch_id: null,
        order_date: date,
        // quotations are valid for a month unless changed
        valid_until: kind === "quotation" ? addDays(date, 30) : null,
        requested_delivery_date: null,
        sales_type_id: null,
        payment_term_id: null,
        sales_person_id: null,
        inventory_location_id: null,
        shipping_company_id: null,
        exchange_rate: null,
        customer_ref: "",
        customer_po_no: "",
        deliver_to: "",
        contact_no: "",
        contact_email: "",
        remarks: "",
        internal_notes: "",
        delivery_address: {...EMPTY_DELIVERY_ADDRESS},
        source_quotation_id: null,
        lines: [{...EMPTY_LINE}],
    };
}

/** Form values of a saved quotation / order. */
export function orderToValues(record: SalesOrderDocument): SalesOrderRequest {
    return {
        reference_no: record.reference_no,
        customer_id: record.customer_id,
        branch_id: record.branch_id,
        order_date: record.order_date,
        valid_until: record.valid_until,
        requested_delivery_date: record.requested_delivery_date,
        sales_type_id: record.sales_type_id,
        payment_term_id: record.payment_term_id,
        sales_person_id: record.sales_person_id,
        inventory_location_id: record.inventory_location_id,
        shipping_company_id: record.shipping_company_id,
        exchange_rate: Number(record.exchange_rate) || null,
        customer_ref: record.customer_ref ?? "",
        customer_po_no: record.customer_po_no ?? "",
        deliver_to: record.deliver_to ?? "",
        contact_no: record.contact_no ?? "",
        contact_email: record.contact_email ?? "",
        remarks: record.remarks ?? "",
        internal_notes: record.internal_notes ?? "",
        delivery_address: record.delivery_address ? {...EMPTY_DELIVERY_ADDRESS, ...record.delivery_address} : {...EMPTY_DELIVERY_ADDRESS},
        source_quotation_id: record.source_quotation_id,
        lines: (record.lines ?? []).map(line => ({
            id: line.id,
            source_line_id: line.source_line_id,
            item_id: line.item_id,
            description: line.description,
            quantity: Number(line.quantity),
            unit_price: Number(line.unit_price),
            discount_percent: Number(line.discount_percent),
        })),
    };
}

/**
 * A new order pre-filled from a quotation: same customer and terms, each line carrying
 * what is still unordered (fully ordered lines are left out).
 */
export function quotationToOrderValues(quotation: SalesOrderDocument): SalesOrderRequest {
    const values = orderToValues(quotation);
    const lines = (quotation.lines ?? [])
        .map(line => ({line, remaining: Number(line.quantity) - Number(line.quantity_converted)}))
        .filter(({remaining}) => remaining > 0)
        .map(({line, remaining}) => ({
            source_line_id: line.id,
            item_id: line.item_id,
            description: line.description,
            quantity: remaining,
            unit_price: Number(line.unit_price),
            discount_percent: Number(line.discount_percent),
        }));

    return {
        ...values,
        reference_no: "",
        order_date: today(),
        valid_until: null,
        source_quotation_id: quotation.id,
        // the order re-reads the rate for its own date
        exchange_rate: null,
        lines,
    };
}

/** Trimmed request body — blank strings become null, lines keep only what the API reads. */
export function toOrderPayload(values: SalesOrderRequest): SalesOrderRequest {
    const address = values.delivery_address;
    return {
        ...values,
        reference_no: values.reference_no.trim(),
        customer_ref: blankToNull(values.customer_ref),
        customer_po_no: blankToNull(values.customer_po_no),
        deliver_to: blankToNull(values.deliver_to),
        contact_no: blankToNull(values.contact_no),
        contact_email: blankToNull(values.contact_email),
        remarks: blankToNull(values.remarks),
        internal_notes: blankToNull(values.internal_notes),
        delivery_address: {
            recipient_name: blankToNull(address.recipient_name),
            address1: address.address1?.trim() ?? "",
            address2: blankToNull(address.address2),
            address3: blankToNull(address.address3),
            postcode: blankToNull(address.postcode),
            city: blankToNull(address.city),
            state: blankToNull(address.state),
            country: blankToNull(address.country),
        },
        lines: values.lines.map(line => ({
            ...(line.id ? {id: line.id} : {}),
            source_line_id: line.source_line_id ?? null,
            item_id: line.item_id,
            description: (line.description ?? "").trim(),
            quantity: line.quantity,
            unit_price: line.unit_price,
            discount_percent: line.discount_percent ?? 0,
        })),
    };
}
