import {ItemPurchasePrice} from "@/apis/models/item-purchase-price";
import {deleteItemPurchasePrice, useGetAllItemPurchasePrice} from "@/apis/requests/item-purchase-price-api";
import SettingsListPage from "@/views/Settings/shared/SettingsListPage";
import {StatusBadge} from "@/views/Settings/shared/StatusBadge";
import {useSmartTranslation} from "@/hooks/use-translation";
import {PURCHASING_PRICING_PATH} from "../inventory-menu";
import {dateOnly, formatDecimal, itemLabel} from "../shared/options";

export default function PurchasingPricing() {
    const {t} = useSmartTranslation();

    return (
        <SettingsListPage<ItemPurchasePrice>
            useFetcher={useGetAllItemPurchasePrice}
            editPath={(row) => `${PURCHASING_PRICING_PATH}/${row.id}`}
            onDelete={(row) => deleteItemPurchasePrice(row.id)}
            columns={[
                {
                    accessor: "item_id",
                    title: t('item'),
                    render: (row) => <span className="fw-semibold text-dark">{itemLabel(row.item)}</span>,
                },
                {
                    accessor: "supplier_id",
                    title: t('supplier'),
                    render: (row) => row.supplier?.name ?? "-",
                },
                {
                    accessor: "supplier_item_code",
                    title: t('supplierItemCode'),
                },
                {
                    accessor: "supplier_uom_id",
                    title: t('supplierUom'),
                    render: (row) => row.supplier_uom?.abbreviation ?? "-",
                },
                {
                    accessor: "price",
                    title: t('price'),
                    tdClasses: "text-end",
                    render: (row) => formatDecimal(row.price),
                },
                {
                    accessor: "valid_to",
                    title: t('validPeriod'),
                    render: (row) => row.valid_from || row.valid_to ? `${dateOnly(row.valid_from) ?? "…"} – ${dateOnly(row.valid_to) ?? "…"}` : "-",
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
