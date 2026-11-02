export type ItemType = "stock" | "service" | "manufactured";

export type ItemCategory = {
    id: number,
    company_id: number,
    name: string,
    item_tax_type_id: number,
    item_type: ItemType,
    sales_account_id: number,
    cogs_account_id: number,
    inventory_account_id: number,
    adjustment_account_id: number,
    assembly_cost_account_id: number,
    uom_id: number | null,
    exclude_from_sales: boolean,
    exclude_from_purchases: boolean,
    status: string,
}
