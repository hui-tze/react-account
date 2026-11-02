import {useMemo} from "react";
import {BankAccount} from "@/apis/models/bank-account";
import {deleteBankAccount, useGetAllBankAccount} from "@/apis/requests/bank-account-api";
import {useGetCurrencyOptions} from "@/apis/requests/currency-api";
import SettingsListPage from "@/views/Settings/shared/SettingsListPage";
import {StatusBadge, YesNoBadge} from "@/views/Settings/shared/StatusBadge";
import {useAccountOptions} from "@/views/Settings/shared/options";
import {useSmartTranslation} from "@/hooks/use-translation";

export const BANK_ACCOUNTS_PATH = "/settings/banking/bank-accounts";

// mirrors App\Domain\Constants\BankAccountType
export const BANK_ACCOUNT_TYPE_LABEL_KEYS: Record<string, string> = {
    savings: 'bankAccountTypeSavings',
    current: 'bankAccountTypeCurrent',
    credit: 'bankAccountTypeCredit',
    cash: 'bankAccountTypeCash',
};

export default function BankAccounts() {
    const {t} = useSmartTranslation();
    const accounts = useAccountOptions();
    const {data: currencies} = useGetCurrencyOptions();

    const currencyCodeOf = useMemo(() => {
        const byId = new Map((currencies ?? []).map(c => [c.id, c.code]));
        return (id: number) => byId.get(id) ?? "-";
    }, [currencies]);

    return (
        <SettingsListPage<BankAccount>
            useFetcher={useGetAllBankAccount}
            editPath={(row) => `${BANK_ACCOUNTS_PATH}/${row.id}`}
            onDelete={(row) => deleteBankAccount(row.id)}
            deleteText={(row) => t('recordDeactivateNamed', {name: row.account_name || row.account_number || ""})}
            tableKey={`${accounts.options.length}|${currencies?.length ?? 0}`}
            columns={[
                {
                    accessor: "account_name",
                    title: t('bankAccountName'),
                    render: (row) => <span className="fw-semibold text-dark">{row.account_name || "-"}</span>,
                },
                {
                    accessor: "account_number",
                    title: t('bankAccountNumber'),
                    render: (row) => row.account_number || "-",
                },
                {
                    accessor: "type",
                    title: t('bankAccountType'),
                    render: (row) => t(BANK_ACCOUNT_TYPE_LABEL_KEYS[row.type] ?? row.type),
                },
                {
                    accessor: "currency_id",
                    title: t('currency'),
                    render: (row) => currencyCodeOf(row.currency_id),
                },
                {
                    accessor: "account_id",
                    title: t('glAccount'),
                    render: (row) => accounts.labelOf(row.account_id),
                },
                {
                    accessor: "is_default",
                    title: t('default'),
                    render: (row) => <YesNoBadge value={row.is_default} />,
                },
                {
                    accessor: "status",
                    title: t('status'),
                    render: (row) => <StatusBadge status={row.status} />,
                },
            ]}
        />
    );
}
