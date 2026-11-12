import {useMemo} from "react";
import {ItemCategory} from "@/apis/models/item-category";
import {deleteItemCategory, useGetAllItemCategory} from "@/apis/requests/item-category-api";
import {useGetItemTaxCategoryOptions} from "@/apis/requests/item-tax-category-api";
import SettingsListPage from "@/views/Settings/shared/SettingsListPage";
import {StatusBadge} from "@/views/Settings/shared/StatusBadge";
import {useAccountOptions} from "@/views/Settings/shared/options";
import {useSmartTranslation} from "@/hooks/use-translation";

export const ITEM_CATEGORIES_PATH = "/inventory/setup/item-categories";

export default function ItemCategories() {
    const {t} = useSmartTranslation();
    const accounts = useAccountOptions();
    const {data: taxCategories} = useGetItemTaxCategoryOptions();

    const taxNameOf = useMemo(() => {
        const byId = new Map((taxCategories ?? []).map(c => [c.id, c.name]));
        return (id: number) => byId.get(id) ?? "-";
    }, [taxCategories]);

    return (
        <SettingsListPage<ItemCategory>
            useFetcher={useGetAllItemCategory}
            editPath={(row) => `${ITEM_CATEGORIES_PATH}/${row.id}`}
            onDelete={(row) => deleteItemCategory(row.id)}
            deleteText={(row) => t('recordDeactivateNamed', {name: row.name})}
            tableKey={`${accounts.options.length}|${taxCategories?.length ?? 0}`}
            columns={[
                {
                    accessor: "name",
                    title: t('name'),
                    render: (row) => <span className="fw-semibold text-dark">{row.name}</span>,
                },
                {
                    accessor: "item_type",
                    title: t('itemType'),
                    render: (row) => t(ITEM_TYPE_LABEL_KEYS[row.item_type] ?? row.item_type),
                },
                {
                    accessor: "item_tax_type_id",
                    title: t('itemTaxType'),
                    render: (row) => taxNameOf(row.item_tax_type_id),
                },
                {
                    accessor: "sales_account_id",
                    title: t('salesAccount'),
                    render: (row) => accounts.labelOf(row.sales_account_id),
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

export const ITEM_TYPE_LABEL_KEYS: Record<string, string> = {
    stock: 'itemTypeStock',
    service: 'itemTypeService',
    manufactured: 'itemTypeManufactured',
};
