export type ItemKind = "stock" | "service" | "manufactured" | "kit";

export type Item = {
    id: number,
    company_id: number,
    code: string,
    name: string,
    sales_description: string | null,
    purchase_description: string | null,
    item_category_id: number | null,
    item_tax_category_id: number | null,
    // MyInvois classification code; blank uses the company default
    einv_classification_code?: string | null,
    uom_id: number | null,
    item_type: ItemKind,
    sales_account_id: number | null,
    cogs_account_id: number | null,
    inventory_account_id: number | null,
    adjustment_account_id: number | null,
    wip_account_id: number | null,
    // decimal(18,4) — serialized as strings by the backend's decimal cast
    purchase_cost: string,
    material_cost: string,
    labour_cost: string,
    overhead_cost: string,
    allow_sales: boolean,
    allow_purchases: boolean,
    allow_description_override: boolean,
    status: string,
}

// the slim item the backend eager-loads onto prices and movements
export type ItemSummary = Pick<Item, "id" | "code" | "name">
