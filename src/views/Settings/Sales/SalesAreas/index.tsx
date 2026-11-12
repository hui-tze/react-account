import {SalesArea} from "@/apis/models/sales-area";
import {deleteSalesArea, useGetAllSalesArea} from "@/apis/requests/sales-area-api";
import SettingsListPage from "@/views/Settings/shared/SettingsListPage";
import {StatusBadge} from "@/views/Settings/shared/StatusBadge";
import {useSmartTranslation} from "@/hooks/use-translation";

export const SALES_AREAS_PATH = "/sales/setup/sales-areas";

export default function SalesAreas() {
    const {t} = useSmartTranslation();

    return (
        <SettingsListPage<SalesArea>
            useFetcher={useGetAllSalesArea}
            editPath={(row) => `${SALES_AREAS_PATH}/${row.id}`}
            onDelete={(row) => deleteSalesArea(row.id)}
            deleteText={(row) => t('recordDeactivateNamed', {name: row.name})}
            columns={[
                {
                    accessor: "name",
                    title: t('name'),
                    render: (row) => <span className="fw-semibold text-dark">{row.name}</span>,
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
