import {Badge} from "react-bootstrap";
import {TaxGroup} from "@/apis/models/tax-group";
import {deleteTaxGroup, useGetAllTaxGroup} from "@/apis/requests/tax-group-api";
import SettingsListPage from "@/views/Settings/shared/SettingsListPage";
import {StatusBadge} from "@/views/Settings/shared/StatusBadge";
import {useSmartTranslation} from "@/hooks/use-translation";

export const TAX_GROUPS_PATH = "/settings/taxes/tax-groups";

export default function TaxGroups() {
    const {t} = useSmartTranslation();

    return (
        <SettingsListPage<TaxGroup>
            useFetcher={useGetAllTaxGroup}
            editPath={(row) => `${TAX_GROUPS_PATH}/${row.id}`}
            onDelete={(row) => deleteTaxGroup(row.id)}
            deleteText={(row) => t('recordDeactivateNamed', {name: row.name})}
            columns={[
                {
                    accessor: "name",
                    title: t('name'),
                    render: (row) => <span className="fw-semibold text-dark">{row.name}</span>,
                },
                {
                    accessor: "tax_types",
                    title: t('taxes'),
                    render: (row) => {
                        const taxTypes = [...(row.tax_types ?? [])].sort((a, b) => (a.pivot?.sequence ?? 0) - (b.pivot?.sequence ?? 0));
                        if (!taxTypes.length) {
                            return "-";
                        }

                        return (
                            <div className="d-flex flex-wrap gap-1">
                                {taxTypes.map(tt => (
                                    <Badge key={tt.id} bg="light" className="badge-soft-secondary" title={tt.name}>{tt.code}</Badge>
                                ))}
                            </div>
                        );
                    },
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
