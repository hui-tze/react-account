import {useMemo} from "react";
import {Item} from "@/apis/models/item";
import {deleteItem, useGetAllItem} from "@/apis/requests/item-api";
import {useGetItemCategoryOptions} from "@/apis/requests/item-category-api";
import {useGetUomOptions} from "@/apis/requests/uom-api";
import SettingsListPage from "@/views/Settings/shared/SettingsListPage";
import {StatusBadge} from "@/views/Settings/shared/StatusBadge";
import {useSmartTranslation} from "@/hooks/use-translation";
import {ITEMS_PATH} from "../inventory-menu";

export const ITEM_KIND_LABEL_KEYS: Record<string, string> = {
    stock: 'itemTypeStock',
    service: 'itemTypeService',
    manufactured: 'itemTypeManufactured',
    kit: 'itemTypeKit',
};

export default function Items() {
    const {t} = useSmartTranslation();
    const {data: categories} = useGetItemCategoryOptions();
    const {data: uoms} = useGetUomOptions();

    const categoryNameOf = useMemo(() => {
        const byId = new Map((categories ?? []).map(c => [c.id, c.name]));
        return (id: number | null) => (id != null ? byId.get(id) : undefined) ?? "-";
    }, [categories]);
    const uomNameOf = useMemo(() => {
        const byId = new Map((uoms ?? []).map(u => [u.id, u.abbreviation]));
        return (id: number | null) => (id != null ? byId.get(id) : undefined) ?? "-";
    }, [uoms]);

    return (
        <SettingsListPage<Item>
            useFetcher={useGetAllItem}
            editPath={(row) => `${ITEMS_PATH}/${row.id}`}
            onDelete={(row) => deleteItem(row.id)}
            deleteText={(row) => t('recordDeactivateNamed', {name: row.name})}
            tableKey={`${categories?.length ?? 0}|${uoms?.length ?? 0}`}
            columns={[
                {
                    accessor: "code",
                    title: t('code'),
                    render: (row) => <span className="fw-semibold text-dark">{row.code}</span>,
                },
                {accessor: "name", title: t('name')},
                {
                    accessor: "item_type",
                    title: t('itemType'),
                    render: (row) => t(ITEM_KIND_LABEL_KEYS[row.item_type] ?? row.item_type),
                },
                {
                    accessor: "item_category_id",
                    title: t('itemCategory'),
                    render: (row) => categoryNameOf(row.item_category_id),
                },
                {
                    accessor: "uom_id",
                    title: t('unitOfMeasurement'),
                    render: (row) => uomNameOf(row.uom_id),
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
