import type {PurchaseOrderDocument} from "@/apis/models/purchase-document";
import type {PurchaseLineRequest, PurchaseOrderRequest} from "@/apis/requests/purchase-api";
import {blankToNull} from "@/views/Settings/Organization/Profile/profile-form";
import {today} from "@/views/Inventory/shared/document";
import {EMPTY_DELIVERY_ADDRESS} from "@/views/Sales/shared/sales-form";

export const EMPTY_PURCHASE_LINE: PurchaseLineRequest = {item_id: null, description: "", quantity: 1, unit_price: null, discount_percent: 0};

export function blankOrderValues(): PurchaseOrderRequest {
    return {
        reference_no: "",
        supplier_id: null,
        order_date: today(),
        expected_delivery: null,
        warehouse_id: null,
        exchange_rate: null,
        tax_included: null,
        remarks: "",
        delivery_address: {...EMPTY_DELIVERY_ADDRESS},
        dimensions: [],
        lines: [{...EMPTY_PURCHASE_LINE}],
    };
}

/** Form values of a saved purchase order. */
export function orderToValues(record: PurchaseOrderDocument): PurchaseOrderRequest {
    return {
        reference_no: record.reference_no,
        supplier_id: record.supplier_id,
        order_date: record.order_date.slice(0, 10),
        expected_delivery: record.expected_delivery?.slice(0, 10) ?? null,
        warehouse_id: record.warehouse_id,
        exchange_rate: Number(record.exchange_rate) !== 1 ? Number(record.exchange_rate) : null,
        tax_included: record.tax_included,
        remarks: record.remarks ?? "",
        delivery_address: record.delivery_address ? {...EMPTY_DELIVERY_ADDRESS, ...record.delivery_address} : {...EMPTY_DELIVERY_ADDRESS},
        dimensions: record.dimensions ?? [],
        lines: (record.details ?? []).map(line => ({
            id: line.id,
            item_id: line.product_id,
            description: line.description,
            quantity: Number(line.quantity),
            unit_price: Number(line.unit_price),
            discount_percent: 0,
        })),
    };
}

/** Item lines as the API reads them. */
export function linesToPayload(lines: PurchaseLineRequest[]): PurchaseLineRequest[] {
    return lines.map(line => ({
        ...(line.id ? {id: line.id} : {}),
        item_id: line.item_id,
        description: (line.description ?? "").trim(),
        quantity: line.quantity,
        unit_price: line.unit_price,
        discount_percent: 0,
    }));
}

/** Trimmed request body — blank strings become null. */
export function toOrderPayload(values: PurchaseOrderRequest): PurchaseOrderRequest {
    const address = values.delivery_address;
    return {
        ...values,
        reference_no: values.reference_no.trim(),
        remarks: blankToNull(values.remarks),
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
        lines: linesToPayload(values.lines),
    };
}

/** Date part of a Laravel date cast ("2026-10-13T00:00:00.000000Z"). */
export const day = (value: string | null | undefined) => value ? value.slice(0, 10) : "";
