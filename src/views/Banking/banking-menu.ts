import {Briefcase, CheckSquare, List, Settings} from "react-feather";
import type {ModuleSidebarConfig} from "@/layout/Module/ModuleSidebarMenu";

export const BANKING_PATH = "/banking";
export const BANK_ACCOUNTS_PATH = `${BANKING_PATH}/accounts`;
export const BANK_TRANSACTIONS_PATH = `${BANKING_PATH}/transactions`;
export const BANK_RECONCILIATION_PATH = `${BANKING_PATH}/reconciliation`;
export const BANK_PAYMENT_CREATE_PATH = `${BANKING_PATH}/payments/create`;
export const BANK_DEPOSIT_CREATE_PATH = `${BANKING_PATH}/deposits/create`;
export const BANK_TRANSFER_CREATE_PATH = `${BANKING_PATH}/transfers/create`;
// bank accounts themselves are maintained in settings
export const BANK_ACCOUNT_SETTINGS_PATH = "/settings/banking/bank-accounts";

const BANK_DOCUMENT_TYPES = ["bank_payment", "bank_deposit", "funds_transfer"];

/** Page of a bank payment / deposit / transfer, or null for other types. */
export function bankDocumentPath(type: string, id: number): string | null {
    return BANK_DOCUMENT_TYPES.includes(type) ? `${BANK_TRANSACTIONS_PATH}/${id}` : null;
}

export const bankRegisterPath = (accountId: number) => `${BANK_ACCOUNTS_PATH}/${accountId}`;
export const bankReconcilePath = (accountId: number) => `${BANK_RECONCILIATION_PATH}?account=${accountId}`;

/** Sidebar of the Banking module. */
export const bankingModule: ModuleSidebarConfig = {
    createMenu: [
        {name: "Payment", path: BANK_PAYMENT_CREATE_PATH},
        {name: "Deposit", path: BANK_DEPOSIT_CREATE_PATH},
        {name: "Bank Account Transfer", path: BANK_TRANSFER_CREATE_PATH},
    ],
    menus: [
        {name: "All Bank Accounts", path: BANK_ACCOUNTS_PATH, icon: Briefcase},
        {name: "Bank Transactions", path: BANK_TRANSACTIONS_PATH, icon: List},
        {name: "Reconciliation", path: BANK_RECONCILIATION_PATH, icon: CheckSquare},
    ],
    sections: [
        {
            title: "Setup",
            menus: [
                {name: "Manage Bank Accounts", path: BANK_ACCOUNT_SETTINGS_PATH, icon: Settings},
            ],
        },
    ],
};
