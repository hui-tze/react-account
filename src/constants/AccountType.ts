import {SelectOptionProps} from "@/apis/models/common";

// `accounts.account_type` is a free-text column on the backend (laravel-account),
// so custom values beyond this list are still valid — this is the suggested set.
export type AccountType =
    | 'normal'
    | 'bank'
    | 'cash'
    | 'receivable'
    | 'payable'
    | 'tax';

export const AccountTypeLabel: Record<AccountType, string> = {
    normal: 'accountType_normal',
    bank: 'accountType_bank',
    cash: 'accountType_cash',
    receivable: 'accountType_receivable',
    payable: 'accountType_payable',
    tax: 'accountType_tax',
};

export const getAccountTypeLabel = (value: string): string => {
    return AccountTypeLabel[value as AccountType] ?? value;
};

export const AccountTypeOptions: SelectOptionProps[] = Object.entries(AccountTypeLabel).map(
    ([value, label]) => ({value, label})
);
