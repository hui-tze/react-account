import {SalesType} from "@/apis/models/sales-type";
import {deleteSalesType, useGetAllSalesType} from "@/apis/requests/sales-type-api";
import SettingsListPage from "@/views/Settings/shared/SettingsListPage";
import {StatusBadge, YesNoBadge} from "@/views/Settings/shared/StatusBadge";
import {useSmartTranslation} from "@/hooks/use-translation";

export const SALES_TYPES_PATH = "/settings/sales/sales-types";

export default function SalesTypes() {
    const {t} = useSmartTranslation();

    return (
        <SettingsListPage<SalesType>
            useFetcher={useGetAllSalesType}
            editPath={(row) => `${SALES_TYPES_PATH}/${row.id}`}
            onDelete={(row) => deleteSalesType(row.id)}
            deleteText={(row) => t('recordDeactivateNamed', {name: row.name})}
            columns={[
                {
                    accessor: "name",
                    title: t('name'),
                    render: (row) => <span className="fw-semibold text-dark">{row.name}</span>,
                },
                {
                    accessor: "calculation_factor",
                    title: t('calculationFactor'),
                    render: (row) => Number(row.calculation_factor).toString(),
                },
                {
                    accessor: "tax_included",
                    title: t('taxIncluded'),
                    render: (row) => <YesNoBadge value={row.tax_included} />,
                },
                {
                    accessor: "description",
                    title: t('description'),
                    render: (row) => row.description || "-",
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
