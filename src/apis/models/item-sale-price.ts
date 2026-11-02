import {ItemSummary} from "@/apis/models/item";

export type ItemSalePrice = {
    id: number,
    item_id: number,
    sales_type_id: number,
    currency_id: number,
    // decimal(18,4) — serialized as a string
    price: string,
    status: string,
    // eager-loaded on the listing only
    item?: ItemSummary,
    sales_type?: {id: number, name: string},
    currency?: {id: number, code: string},
}
