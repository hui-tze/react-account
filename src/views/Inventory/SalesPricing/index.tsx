import {ItemSalePrice} from "@/apis/models/item-sale-price";
import {deleteItemSalePrice, useGetAllItemSalePrice} from "@/apis/requests/item-sale-price-api";
import SettingsListPage from "@/views/Settings/shared/SettingsListPage";
import {StatusBadge} from "@/views/Settings/shared/StatusBadge";
import {useSmartTranslation} from "@/hooks/use-translation";
import {SALES_PRICING_PATH} from "../inventory-menu";
import {formatDecimal, itemLabel} from "../shared/options";

export default function SalesPricing() {
    const {t} = useSmartTranslation();

    return (
        <SettingsListPage<ItemSalePrice>
            useFetcher={useGetAllItemSalePrice}
            editPath={(row) => `${SALES_PRICING_PATH}/${row.id}`}
            onDelete={(row) => deleteItemSalePrice(row.id)}
            columns={[
                {
                    accessor: "item_id",
                    title: t('item'),
                    render: (row) => <span className="fw-semibold text-dark">{itemLabel(row.item)}</span>,
                },
                {
                    accessor: "sales_type_id",
                    title: t('salesType'),
                    render: (row) => row.sales_type?.name ?? "-",
                },
                {
                    accessor: "currency_id",
                    title: t('currency'),
                    render: (row) => row.currency?.code ?? "-",
                },
                {
                    accessor: "price",
                    title: t('price'),
                    tdClasses: "text-end",
                    render: (row) => formatDecimal(row.price),
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
