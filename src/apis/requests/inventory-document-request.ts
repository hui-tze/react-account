type DocumentHeader = {
    // blank = next number from document numbering
    reference_no: string,
    trans_date: string,
    inventory_location_id: number,
    memo: string,
}

export type InventoryAdjustmentLine = {
    item_id: number | null,
    // positive adds stock, negative removes it
    quantity: number | null,
    unit_cost: number | null,
}

export type LocationTransferLine = {
    item_id: number | null,
    quantity: number | null,
}

export type InventoryAdjustmentRequest = DocumentHeader & {lines: InventoryAdjustmentLine[]}

export type LocationTransferRequest = DocumentHeader & {to_inventory_location_id: number, lines: LocationTransferLine[]}
