import {ItemSummary} from "@/apis/models/item";

export type InventoryMovement = {
    id: number,
    company_id: number,
    reference_no: string,
    // source document type, e.g. inventory_adjustment, location_transfer
    trans_type: string,
    // source document id
    trans_id: number,
    inventory_location_id: number,
    item_id: number,
    trans_date: string,
    // decimals — serialized as strings
    quantity: string,
    unit_cost: string,
    unit_price: string,
    status: string,
    item?: ItemSummary,
    inventory_location?: {id: number, code: string, name: string},
    // on hand after this row — only when the listing is filtered by item
    balance?: number,
}

/** An item's stock over a period (voided movements excluded). */
export type StockCard = {
    opening: number,
    quantity_in: number,
    quantity_out: number,
    closing: number,
}
