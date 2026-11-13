import {BarChart2, CornerUpLeft, CreditCard, FileMinus, FilePlus, FileText, Link2, Package, ShoppingCart, Users} from "react-feather";
import type {ModuleSidebarConfig} from "@/layout/Module/ModuleSidebarMenu";

export const PURCHASES_PATH = "/purchases";
export const SUPPLIERS_PATH = `${PURCHASES_PATH}/suppliers`;
export const PURCHASE_ORDERS_PATH = `${PURCHASES_PATH}/orders`;
export const RECEIPTS_PATH = `${PURCHASES_PATH}/receipts`;
export const BILLS_PATH = `${PURCHASES_PATH}/bills`;
export const SELF_BILLED_PATH = `${PURCHASES_PATH}/self-billed-invoices`;
export const SUPPLIER_PAYMENTS_PATH = `${PURCHASES_PATH}/payments`;
export const SUPPLIER_CREDIT_NOTES_PATH = `${PURCHASES_PATH}/credit-notes`;
export const SELF_BILLED_CREDIT_NOTES_PATH = `${PURCHASES_PATH}/self-billed-credit-notes`;
export const SUPPLIER_ALLOCATION_PATH = `${PURCHASES_PATH}/allocation`;

// where each purchase document type opens (trans_type -> listing path)
const DOCUMENT_PATHS: Record<string, string> = {
    purchase_order: PURCHASE_ORDERS_PATH,
    purchase_order_delivery: RECEIPTS_PATH,
    supplier_bill: BILLS_PATH,
    self_billed_invoice: SELF_BILLED_PATH,
    supplier_payment: SUPPLIER_PAYMENTS_PATH,
    supplier_credit_note: SUPPLIER_CREDIT_NOTES_PATH,
    self_billed_credit_note: SELF_BILLED_CREDIT_NOTES_PATH,
};

/** Page of a purchase document, or null when its type has no screen. */
export function purchaseDocumentPath(type: string, id: number): string | null {
    const base = DOCUMENT_PATHS[type];
    return base ? `${base}/${id}` : null;
}

/** Sidebar of the Purchases module. */
export const purchasesModule: ModuleSidebarConfig = {
    createMenu: [
        {name: "Purchase Order", path: `${PURCHASE_ORDERS_PATH}/create`},
        {name: "Goods Receipt (GRN)", path: `${RECEIPTS_PATH}/create`},
        {name: "Bill", path: `${BILLS_PATH}/create`},
        {name: "Direct Bill", path: `${BILLS_PATH}/create?direct=1`},
        {name: "Self-billed Invoice", path: `${SELF_BILLED_PATH}/create`},
        {name: "Supplier Payment", path: `${SUPPLIER_PAYMENTS_PATH}/create`},
        {name: "Supplier Credit Note", path: `${SUPPLIER_CREDIT_NOTES_PATH}/create`},
        {name: "Supplier", path: `${SUPPLIERS_PATH}/create`},
    ],
    menus: [
        {name: "Purchase Orders", path: PURCHASE_ORDERS_PATH, icon: ShoppingCart},
        {name: "Goods Receipts", path: RECEIPTS_PATH, icon: Package},
        {name: "Bills", path: BILLS_PATH, icon: FileText},
    ],
    sections: [
        {
            title: "Payables",
            menus: [
                {name: "Supplier Payments", path: SUPPLIER_PAYMENTS_PATH, icon: CreditCard},
                {name: "Credit Notes", path: SUPPLIER_CREDIT_NOTES_PATH, icon: CornerUpLeft},
                {name: "Supplier Allocation", path: SUPPLIER_ALLOCATION_PATH, icon: Link2},
                {name: "Suppliers", path: SUPPLIERS_PATH, icon: Users},
            ],
        },
        {
            title: "Self-billing",
            menus: [
                {name: "Self-billed Invoices", path: SELF_BILLED_PATH, icon: FilePlus},
                {name: "Self-billed Credit Notes", path: SELF_BILLED_CREDIT_NOTES_PATH, icon: FileMinus},
            ],
        },
        {
            title: "Reports",
            menus: [
                {name: "Purchase Reports", path: `${PURCHASES_PATH}/reports`, icon: BarChart2},
            ],
        },
    ],
};
