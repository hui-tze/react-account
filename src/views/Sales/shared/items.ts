import {useMemo} from "react";
import {useGetItemOptions} from "@/apis/requests/item-api";
import {useGetUomOptions} from "@/apis/requests/uom-api";
import type {StockItem} from "@/views/Inventory/shared/document";

export type SellableItem = StockItem & {
    item_type: string,
    item_tax_category_id: number | null,
    allow_description_override: boolean,
};

/** Items that can be sold (any type, allow_sales), keyed by id, with unit and tax category. */
export function useSellableItems(): {items: SellableItem[], byId: Map<number, SellableItem>, isLoading: boolean} {
    const {data: items, isLoading} = useGetItemOptions();
    const {data: uoms} = useGetUomOptions();

    return useMemo(() => {
        const uomById = new Map((uoms ?? []).map(u => [u.id, u.abbreviation]));
        const list: SellableItem[] = (items ?? [])
            .filter(i => i.allow_sales)
            .map(i => ({
                id: i.id,
                code: i.code,
                name: i.name,
                status: i.status,
                uom: i.uom_id != null ? uomById.get(i.uom_id) ?? null : null,
                standardCost: Number(i.material_cost) + Number(i.labour_cost) + Number(i.overhead_cost),
                item_type: i.item_type,
                item_tax_category_id: i.item_tax_category_id,
                allow_description_override: !!i.allow_description_override,
            }));

        return {items: list, byId: new Map(list.map(i => [i.id, i])), isLoading};
    }, [items, uoms, isLoading]);
}
