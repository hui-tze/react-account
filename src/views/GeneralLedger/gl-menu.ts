import {BarChart2, BookOpen, Columns, FileText, Layers, List, Percent} from "react-feather";
import type {ModuleSidebarConfig} from "@/layout/Module/ModuleSidebarMenu";
import {salesDocumentPath} from "@/views/Sales/sales-menu";
import {purchaseDocumentPath} from "@/views/Purchases/purchases-menu";
import {bankDocumentPath} from "@/views/Banking/banking-menu";

export const GL_PATH = "/gl";
export const GL_ENTRIES_PATH = `${GL_PATH}/entries`;
export const GL_JOURNALS_PATH = `${GL_PATH}/journals`;
export const GL_TAXES_PATH = `${GL_PATH}/taxes`;
export const GL_CHART_PATH = `${GL_PATH}/chart-of-accounts`;
export const GL_PROFIT_LOSS_PATH = `${GL_PATH}/profit-loss`;
export const GL_BALANCE_SHEET_PATH = `${GL_PATH}/balance-sheet`;
export const GL_TRIAL_BALANCE_PATH = `${GL_PATH}/trial-balance`;
// where the chart itself is maintained
export const GL_CHART_SETTINGS_PATH = "/settings/gl/chart-of-accounts";

/** Page of the document behind a ledger posting, or null when it has no screen. */
export function ledgerDocumentPath(type: string, id: number): string | null {
    if (type === "journal_entry") {
        return `${GL_JOURNALS_PATH}/${id}`;
    }
    return salesDocumentPath(type, id) ?? purchaseDocumentPath(type, id) ?? bankDocumentPath(type, id);
}

/** An account's ledger: all its postings with a running balance. */
export const accountLedgerPath = (accountId: number) => `${GL_ENTRIES_PATH}?account_id=${accountId}`;

/** Sidebar of the General Ledger module. */
export const glModule: ModuleSidebarConfig = {
    createMenu: [
        {name: "Journal Entry", path: `${GL_JOURNALS_PATH}/create`},
    ],
    menus: [
        {name: "All General Ledger", path: GL_ENTRIES_PATH, icon: List},
        {name: "All Journals", path: GL_JOURNALS_PATH, icon: BookOpen},
        {name: "All Taxes", path: GL_TAXES_PATH, icon: Percent},
        {name: "Chart Of Account", path: GL_CHART_PATH, icon: Layers},
    ],
    sections: [
        {
            title: "Financial Reports",
            menus: [
                {name: "Profit & Loss", path: GL_PROFIT_LOSS_PATH, icon: BarChart2},
                {name: "Balance Sheet", path: GL_BALANCE_SHEET_PATH, icon: FileText},
                {name: "Trial Balance", path: GL_TRIAL_BALANCE_PATH, icon: Columns},
            ],
        },
    ],
};
