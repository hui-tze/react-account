import {Badge} from "react-bootstrap";
import {ItemTaxCategory} from "@/apis/models/item-tax-category";
import {deleteItemTaxCategory, useGetAllItemTaxCategory} from "@/apis/requests/item-tax-category-api";
import SettingsListPage from "@/views/Settings/shared/SettingsListPage";
import {StatusBadge, YesNoBadge} from "@/views/Settings/shared/StatusBadge";
import {useSmartTranslation} from "@/hooks/use-translation";

export const ITEM_TAX_TYPES_PATH = "/settings/taxes/item-tax-types";

export default function ItemTaxTypes() {
    const {t} = useSmartTranslation();

    return (
        <SettingsListPage<ItemTaxCategory>
            useFetcher={useGetAllItemTaxCategory}
            editPath={(row) => `${ITEM_TAX_TYPES_PATH}/${row.id}`}
            onDelete={(row) => deleteItemTaxCategory(row.id)}
            deleteText={(row) => t('recordDeactivateNamed', {name: row.name})}
            columns={[
                {
                    accessor: "name",
                    title: t('name'),
                    render: (row) => <span className="fw-semibold text-dark">{row.name}</span>,
                },
                {
                    accessor: "tax_exempt",
                    title: t('fullyTaxExempt'),
                    render: (row) => <YesNoBadge value={!!row.tax_exempt} />,
                },
                {
                    accessor: "exempt_tax_types",
                    title: t('exemptFrom'),
                    render: (row) => {
                        if (row.tax_exempt) {
                            return <span className="text-muted">{t('allTaxes')}</span>;
                        }
                        const exempt = row.exempt_tax_types ?? [];
                        if (!exempt.length) {
                            return "-";
                        }

                        return (
                            <div className="d-flex flex-wrap gap-1">
                                {exempt.map(tt => (
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
