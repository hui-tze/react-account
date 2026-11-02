import {Item} from "@/apis/models/item";
import {useGetAllItem} from "@/apis/requests/item-api";
import SettingsListPage from "@/views/Settings/shared/SettingsListPage";
import {useSmartTranslation} from "@/hooks/use-translation";
import {STANDARD_COSTS_PATH} from "../inventory-menu";
import {formatDecimal} from "../shared/options";

/** Standard unit cost = material + labour + overhead. */
export function standardCostOf(costs: Pick<Item, "material_cost" | "labour_cost" | "overhead_cost">): number {
    return Number(costs.material_cost ?? 0) + Number(costs.labour_cost ?? 0) + Number(costs.overhead_cost ?? 0);
}

export default function StandardCosts() {
    const {t} = useSmartTranslation();

    const costColumn = (accessor: "purchase_cost" | "material_cost" | "labour_cost" | "overhead_cost", titleKey: string) => ({
        accessor,
        title: t(titleKey),
        tdClasses: "text-end",
        render: (row: Item) => formatDecimal(row[accessor]),
    });

    return (
        <SettingsListPage<Item>
            useFetcher={useGetAllItem}
            editPath={(row) => `${STANDARD_COSTS_PATH}/${row.id}`}
            columns={[
                {
                    accessor: "code",
                    title: t('code'),
                    render: (row) => <span className="fw-semibold text-dark">{row.code}</span>,
                },
                {accessor: "name", title: t('name')},
                costColumn("purchase_cost", 'lastPurchaseCost'),
                costColumn("material_cost", 'materialCost'),
                costColumn("labour_cost", 'labourCost'),
                costColumn("overhead_cost", 'overheadCost'),
                {
                    accessor: undefined,
                    title: t('standardCost'),
                    tdClasses: "text-end fw-semibold",
                    render: (row) => formatDecimal(standardCostOf(row)),
                },
            ]}
        />
    );
}
