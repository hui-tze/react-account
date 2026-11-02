export type DisplaySettings = {
    price_decimal_places: number,
    quantity_decimal_places: number,
    exchange_rate_decimal_places: number,
    percentage_decimal_places: number,
    records_per_page: number,
    date_separator: string,
    thousand_separator: string,
    decimal_separator: string,
    date_format: string,
}

export type SystemSetupSettings = {
    refno_setting: string,
    allow_negative_inventory: boolean,
    active_fiscal_year_id: number | null,
    default_sales_account_id: number | null,
    default_purchase_account_id: number | null,
    default_inventory_account_id: number | null,
    default_sales_discount_account_id: number | null,
    default_purchase_discount_account_id: number | null,
    default_prompt_payment_discount_account_id: number | null,
    default_bank_charges_account_id: number | null,
    default_receivable_account_id: number | null,
    default_cogs_account_id: number | null,
    default_payable_account_id: number | null,
    // goods received not billed yet: Cr on receipts, cleared by bills
    grn_clearing_account_id: number | null,
}

export type SystemSettingCategories = {
    display: DisplaySettings,
    system_setup: SystemSetupSettings,
}
