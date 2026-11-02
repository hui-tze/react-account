import {TaxType} from "@/apis/models/tax-type";
import {deleteTaxType, useGetAllTaxType} from "@/apis/requests/tax-type-api";
import SettingsListPage from "@/views/Settings/shared/SettingsListPage";
import {StatusBadge, YesNoBadge} from "@/views/Settings/shared/StatusBadge";
import {useAccountOptions} from "@/views/Settings/shared/options";
import {useSmartTranslation} from "@/hooks/use-translation";
import {formatRate} from "../format";

export const TAX_TYPES_PATH = "/settings/taxes/taxes";

export default function TaxTypes() {
    const {t} = useSmartTranslation();
    const accounts = useAccountOptions();

    return (
        <SettingsListPage<TaxType>
            useFetcher={useGetAllTaxType}
            tableKey={accounts.isLoading ? "loading" : `accounts-${accounts.options.length}`}
            editPath={(row) => `${TAX_TYPES_PATH}/${row.id}`}
            onDelete={(row) => deleteTaxType(row.id)}
            deleteText={(row) => t('recordDeactivateNamed', {name: row.name})}
            columns={[
                {
                    accessor: "code",
                    title: t('code'),
                    render: (row) => <span className="fw-semibold text-dark">{row.code}</span>,
                },
                {
                    accessor: "name",
                    title: t('name'),
                },
                {
                    accessor: "rate",
                    title: t('rate'),
                    render: (row) => formatRate(row.rate),
                },
                {
                    accessor: "sales_tax_account_id",
                    title: t('salesTaxAccount'),
                    render: (row) => accounts.labelOf(row.sales_tax_account_id),
                },
                {
                    accessor: "purchase_tax_account_id",
                    title: t('purchaseTaxAccount'),
                    render: (row) => accounts.labelOf(row.purchase_tax_account_id),
                },
                {
                    accessor: "for_sales",
                    title: t('forSales'),
                    render: (row) => <YesNoBadge value={!!row.for_sales} />,
                },
                {
                    accessor: "for_purchase",
                    title: t('forPurchase'),
                    render: (row) => <YesNoBadge value={!!row.for_purchase} />,
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
