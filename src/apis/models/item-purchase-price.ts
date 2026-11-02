import {ItemSummary} from "@/apis/models/item";

export type ItemPurchasePrice = {
    id: number,
    item_id: number,
    supplier_id: number,
    supplier_uom_id: number,
    // decimals — serialized as strings
    conversion_factor: string,
    price: string,
    supplier_item_code: string,
    supplier_item_name: string,
    minimum_quantity: string,
    valid_from: string | null,
    valid_to: string | null,
    status: string,
    // eager-loaded on the listing only
    item?: ItemSummary,
    supplier?: {id: number, code: string, name: string},
    supplier_uom?: {id: number, abbreviation: string},
}
