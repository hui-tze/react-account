/*
 * The permission list (mirrors laravel-account config/permissions.php). A permission is
 * "<module>.<action>"; a role holds a set of them, and the signed-in user's set comes from
 * GET /my-access (providers/access.tsx). Use these names in code instead of bare strings.
 */

export const PERMISSION_ACTIONS = ["view", "create", "edit", "delete"] as const;
export type PermissionAction = typeof PERMISSION_ACTIONS[number];

export const PERMISSION_MODULES = {
    // Sales
    sales_quotations: "sales_quotations",
    sales_orders: "sales_orders",
    deliveries: "deliveries",
    sales_invoices: "sales_invoices",
    customer_credit_notes: "customer_credit_notes",
    customer_payments: "customer_payments",
    pos_receipts: "pos_receipts",
    pos_credit_notes: "pos_credit_notes",
    customers: "customers",
    sales_reports: "sales_reports",
    // Purchases
    purchase_orders: "purchase_orders",
    goods_receipts: "goods_receipts",
    supplier_bills: "supplier_bills",
    supplier_credit_notes: "supplier_credit_notes",
    supplier_payments: "supplier_payments",
    suppliers: "suppliers",
    purchase_reports: "purchase_reports",
    // Inventory
    items: "items",
    inventory: "inventory",
    inventory_reports: "inventory_reports",
    // Finance
    banking: "banking",
    gl: "gl",
    einvoice: "einvoice",
    dimensions: "dimensions",
    budgets: "budgets",
    // Administration
    settings: "settings",
    users: "users",
} as const;
export type PermissionModule = keyof typeof PERMISSION_MODULES;

export type Permission = `${PermissionModule}.${PermissionAction}`;

/** "sales_invoices" + "delete" → "sales_invoices.delete". */
export const permission = (module: PermissionModule, action: PermissionAction): Permission => `${module}.${action}`;

/** Document type → the module whose "view" opening it needs (document preview, references). */
export const DOCUMENT_TYPE_MODULES: Record<string, PermissionModule> = {
    sales_quotation: "sales_quotations",
    sales_order: "sales_orders",
    delivery_note: "deliveries",
    sales_invoice: "sales_invoices",
    customer_credit_note: "customer_credit_notes",
    customer_payment: "customer_payments",
    pos_receipt: "pos_receipts",
    pos_credit_note: "pos_credit_notes",
    purchase_order: "purchase_orders",
    purchase_order_delivery: "goods_receipts",
    supplier_bill: "supplier_bills",
    self_billed_invoice: "supplier_bills",
    supplier_credit_note: "supplier_credit_notes",
    self_billed_credit_note: "supplier_credit_notes",
    supplier_payment: "supplier_payments",
    bank_payment: "banking",
    bank_deposit: "banking",
    funds_transfer: "banking",
    journal_entry: "gl",
};
