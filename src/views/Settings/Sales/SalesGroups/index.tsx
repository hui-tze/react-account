import {SalesGroup} from "@/apis/models/sales-group";
import {deleteSalesGroup, useGetAllSalesGroup} from "@/apis/requests/sales-group-api";
import SettingsListPage from "@/views/Settings/shared/SettingsListPage";
import {StatusBadge} from "@/views/Settings/shared/StatusBadge";
import {useSmartTranslation} from "@/hooks/use-translation";

export const SALES_GROUPS_PATH = "/settings/sales/sales-groups";

export default function SalesGroups() {
    const {t} = useSmartTranslation();

    return (
        <SettingsListPage<SalesGroup>
            useFetcher={useGetAllSalesGroup}
            editPath={(row) => `${SALES_GROUPS_PATH}/${row.id}`}
            onDelete={(row) => deleteSalesGroup(row.id)}
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
