// lines of an adjustment or transfer as the backend returns them
export type InventoryDocumentLine = {
    item_id: number,
    // decimals — serialized as strings
    quantity: string,
    unit_cost: string,
    item: {id: number, code: string, name: string, uom: string | null} | null,
}

type LocationSummary = {id: number, code: string, name: string}

export type InventoryDocument = {
    id: number,
    company_id: number,
    document_type: "inventory_adjustment" | "location_transfer",
    reference_no: string,
    trans_date: string,
    // adjustment: the adjusted location; transfer: the source
    inventory_location_id: number,
    // transfer destination; null for adjustments
    to_inventory_location_id: number | null,
    memo: string | null,
    status: string,
    inventory_location?: LocationSummary,
    to_inventory_location?: LocationSummary | null,
    // listing only
    line_count?: number,
    total_value?: string,
    // detail only
    lines?: InventoryDocumentLine[],
}
