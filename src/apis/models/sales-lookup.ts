export type SalesTaxType = {
    id: number,
    code: string,
    name: string,
    rate: number,
    // calculation order within the tax group
    sequence: number,
    // charged on the taxable amount plus the taxes before it
    is_compound: boolean,
}

export type ItemTaxCategoryRule = {
    // no tax at all
    exempt: boolean,
    // only these taxes are dropped
    exempt_tax_type_ids: number[],
}

/** What a branch is taxed with — input to calculateSalesTotals. */
export type SalesTaxContext = {
    tax_types: SalesTaxType[],
    // keyed by item_tax_category_id
    item_tax_categories: Record<string, ItemTaxCategoryRule>,
}
