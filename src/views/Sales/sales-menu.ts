import {BarChart2, CornerUpLeft, CreditCard, FileText, Inbox, RotateCcw, ShoppingBag, ShoppingCart, Truck, Users} from "react-feather";
import type {ModuleSidebarConfig} from "@/layout/Module/ModuleSidebarMenu";
import {moduleSetupSection} from "@/views/Settings/settings-menu";

export const SALES_PATH = "/sales";
export const CUSTOMERS_PATH = `${SALES_PATH}/customers`;
export const QUOTATIONS_PATH = `${SALES_PATH}/quotations`;
export const ORDERS_PATH = `${SALES_PATH}/orders`;
export const DELIVERIES_PATH = `${SALES_PATH}/deliveries`;
export const INVOICES_PATH = `${SALES_PATH}/invoices`;
export const CREDIT_NOTES_PATH = `${SALES_PATH}/credit-notes`;
export const PAYMENTS_PATH = `${SALES_PATH}/payments`;
export const POS_RECEIPTS_PATH = `${SALES_PATH}/pos-receipts`;
export const POS_CREDIT_NOTES_PATH = `${SALES_PATH}/pos-credit-notes`;

/** Branch pages live under their customer. */
export const branchPath = (customerId: number | string, branchId?: number | string) =>
    `${CUSTOMERS_PATH}/${customerId}/branches/${branchId ?? "create"}`;

// where each sales document type opens (trans_type -> listing path)
const DOCUMENT_PATHS: Record<string, string> = {
    sales_quotation: QUOTATIONS_PATH,
    sales_order: ORDERS_PATH,
    delivery_note: DELIVERIES_PATH,
    sales_invoice: INVOICES_PATH,
    customer_credit_note: CREDIT_NOTES_PATH,
    customer_payment: PAYMENTS_PATH,
    pos_receipt: POS_RECEIPTS_PATH,
    pos_credit_note: POS_CREDIT_NOTES_PATH,
};

/** Page of a sales document, or null when its type has no screen yet. */
export function salesDocumentPath(type: string, id: number): string | null {
    const base = DOCUMENT_PATHS[type];
    return base ? `${base}/${id}` : null;
}

/** Sidebar of the Sales module. */
export const salesModule: ModuleSidebarConfig = {
    createMenu: [
        {name: "Quotation", path: `${QUOTATIONS_PATH}/create`},
        {name: "Sales Order", path: `${ORDERS_PATH}/create`},
        {name: "Delivery Note", path: `${DELIVERIES_PATH}/create`},
        {name: "Direct Invoice", path: `${INVOICES_PATH}/create`},
        {name: "Credit Note", path: `${CREDIT_NOTES_PATH}/create`},
        {name: "Customer Payment", path: `${PAYMENTS_PATH}/create`},
        {name: "POS Receipt", path: `${POS_RECEIPTS_PATH}/create`},
        {name: "Customer", path: `${CUSTOMERS_PATH}/create`},
    ],
    menus: [
        {name: "Quotations", path: QUOTATIONS_PATH, icon: FileText},
        {name: "Sales Orders", path: ORDERS_PATH, icon: ShoppingBag},
        {name: "Delivery Notes", path: DELIVERIES_PATH, icon: Truck},
        {name: "Invoices", path: INVOICES_PATH, icon: Inbox},
    ],
    sections: [
        {
            title: "Point of Sale",
            menus: [
                {name: "POS Receipts", path: POS_RECEIPTS_PATH, icon: ShoppingCart},
                {name: "POS Credit Notes", path: POS_CREDIT_NOTES_PATH, icon: RotateCcw},
            ],
        },
        {
            title: "Receivables",
            menus: [
                {name: "Customer Payments", path: PAYMENTS_PATH, icon: CreditCard},
                {name: "Credit Notes", path: CREDIT_NOTES_PATH, icon: CornerUpLeft},
                {name: "Customers", path: CUSTOMERS_PATH, icon: Users},
            ],
        },
        {
            title: "Reports",
            menus: [
                {name: "Sales Reports", path: `${SALES_PATH}/reports`, icon: BarChart2},
            ],
        },
        moduleSetupSection("settings_sales"),
    ],
};
