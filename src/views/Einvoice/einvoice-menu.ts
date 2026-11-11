import {Clock, FileText, Layers, Settings} from "react-feather";
import type {ModuleSidebarConfig} from "@/layout/Module/ModuleSidebarMenu";
import {salesDocumentPath} from "@/views/Sales/sales-menu";
import {purchaseDocumentPath} from "@/views/Purchases/purchases-menu";

export const EINVOICE_PATH = "/einvoice";
export const EINVOICE_DOCUMENTS_PATH = `${EINVOICE_PATH}/documents`;
export const EINVOICE_OUTSTANDING_PATH = `${EINVOICE_PATH}/outstanding`;
export const EINVOICE_CONSOLIDATION_PATH = `${EINVOICE_PATH}/consolidation`;
export const EINVOICE_SETTINGS_PATH = "/settings/organization/einvoice";

/** Page of the sales / self-billed document an e-invoice was issued for. */
export function einvoiceSourcePath(transType: string, transId: number): string | null {
    // consolidated e-invoices: the month's POS receipts / refunds
    if (transType === "consolidated_invoice" || transType === "consolidated_credit_note") {
        return `${EINVOICE_CONSOLIDATION_PATH}?batch=${transId}`;
    }
    return salesDocumentPath(transType, transId) ?? purchaseDocumentPath(transType, transId);
}

/** Sidebar of the E-Invoice module. */
export const einvoiceModule: ModuleSidebarConfig = {
    menus: [
        {name: "Submitted Documents", path: EINVOICE_DOCUMENTS_PATH, icon: FileText},
        {name: "Not Yet Submitted", path: EINVOICE_OUTSTANDING_PATH, icon: Clock},
        {name: "Consolidated (POS)", path: EINVOICE_CONSOLIDATION_PATH, icon: Layers},
    ],
    sections: [
        {
            title: "Setup",
            menus: [
                {name: "MyInvois Settings", path: EINVOICE_SETTINGS_PATH, icon: Settings},
            ],
        },
    ],
};
