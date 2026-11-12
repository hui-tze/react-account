import {CreditStatus} from "@/apis/models/credit-status";
import {deleteCreditStatus, useGetAllCreditStatus} from "@/apis/requests/credit-status-api";
import SettingsListPage from "@/views/Settings/shared/SettingsListPage";
import {StatusBadge, YesNoBadge} from "@/views/Settings/shared/StatusBadge";
import {useSmartTranslation} from "@/hooks/use-translation";

export const CREDIT_STATUSES_PATH = "/sales/setup/credit-statuses";

export default function CreditStatuses() {
    const {t} = useSmartTranslation();

    return (
        <SettingsListPage<CreditStatus>
            useFetcher={useGetAllCreditStatus}
            editPath={(row) => `${CREDIT_STATUSES_PATH}/${row.id}`}
            onDelete={(row) => deleteCreditStatus(row.id)}
            deleteText={(row) => t('recordDeactivateNamed', {name: row.name})}
            columns={[
                {
                    accessor: "name",
                    title: t('name'),
                    render: (row) => <span className="fw-semibold text-dark">{row.name}</span>,
                },
                {
                    accessor: "allow_invoice",
                    title: t('allowInvoice'),
                    render: (row) => <YesNoBadge value={row.allow_invoice} />,
                },
                {
                    accessor: "allow_order",
                    title: t('allowOrder'),
                    render: (row) => <YesNoBadge value={row.allow_order} />,
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
