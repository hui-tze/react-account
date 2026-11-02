import {useMemo} from "react";
import {Control, FieldValues, useWatch} from "react-hook-form";
import {Currency} from "@/apis/models/currency";
import {Supplier} from "@/apis/models/supplier";
import {useGetCurrencyOptions} from "@/apis/requests/currency-api";
import {useGetItemOptions} from "@/apis/requests/item-api";
import {useGetUomOptions} from "@/apis/requests/uom-api";
import {useGetSupplierOptions} from "@/apis/requests/supplier-api";
import {useGetPurchaseTaxContext, useGetSupplierPrices} from "@/apis/requests/purchase-api";
import {useGetExchangeRate} from "@/apis/requests/sales-lookup-api";
import type {SellableItem} from "@/views/Sales/shared/items";
import {calculateSalesTotals, SalesTotals} from "@/views/Sales/shared/tax";

/** An item that can be bought, in the shape the shared line table reads. */
export type PurchasableItem = SellableItem & {purchaseCost: number, purchaseDescription: string | null};

/** Items that can be purchased (allow_purchases), keyed by id, with unit, tax category and last cost. */
export function usePurchasableItems(): {items: PurchasableItem[], byId: Map<number, PurchasableItem>} {
    const {data: items} = useGetItemOptions();
    const {data: uoms} = useGetUomOptions();

    return useMemo(() => {
        const uomById = new Map((uoms ?? []).map(u => [u.id, u.abbreviation]));
        const list: PurchasableItem[] = (items ?? [])
            .filter(i => i.allow_purchases)
            .map(i => ({
                id: i.id,
                code: i.code,
                // a purchase description, when set, is what the supplier calls it
                name: i.purchase_description || i.name,
                status: i.status,
                uom: i.uom_id != null ? uomById.get(i.uom_id) ?? null : null,
                standardCost: Number(i.material_cost) + Number(i.labour_cost) + Number(i.overhead_cost),
                item_type: i.item_type,
                item_tax_category_id: i.item_tax_category_id,
                allow_description_override: !!i.allow_description_override,
                purchaseCost: Number(i.purchase_cost) || 0,
                purchaseDescription: i.purchase_description,
            }));

        return {items: list, byId: new Map(list.map(i => [i.id, i]))};
    }, [items, uoms]);
}

type PricedLine = {item_id?: number | null, quantity?: number | null, unit_price?: number | null};

export type PurchasePricing = {
    supplier?: Supplier,
    currency?: Currency,
    taxIncluded: boolean,
    // price per item id: the supplier's price list, else the item's last purchase cost
    priceList: Record<string, number>,
    lookedUpRate?: number | null,
    foreignCurrency: boolean,
    items: PurchasableItem[],
    byId: Map<number, PurchasableItem>,
    totals: SalesTotals,
};

/**
 * What a supplier document form needs to price itself while the user types: the supplier's
 * currency, purchase taxes and prices, the exchange rate on the document date, and live totals
 * (the backend recalculates on save). Reads `supplier_id` and `tax_included` from the form.
 */
export function usePurchasePricing<T extends FieldValues>(control: Control<T>, date: string | null | undefined, lines: PricedLine[] | undefined): PurchasePricing {
    // react-hook-form can't resolve paths on an open generic, so read the slice by name
    const slice = control as unknown as Control<{supplier_id: number | null, tax_included: boolean | null}>;
    const [supplierId, taxIncludedField] = useWatch({control: slice, name: ["supplier_id", "tax_included"]});

    const {data: suppliers} = useGetSupplierOptions();
    const {data: currencies} = useGetCurrencyOptions();
    const {items, byId} = usePurchasableItems();

    const supplier = suppliers?.find(s => s.id === supplierId);
    const currency = currencies?.find(c => c.id === supplier?.currency_id);
    const taxIncluded = taxIncludedField ?? !!supplier?.tax_included;

    const {data: taxContext} = useGetPurchaseTaxContext(supplierId);
    const {data: supplierPrices} = useGetSupplierPrices(supplierId, date);
    const {data: rateLookup} = useGetExchangeRate(supplier?.currency_id, date);

    const priceList = useMemo(() => {
        const list: Record<string, number> = {};
        items.forEach(item => {
            if (item.purchaseCost > 0) list[item.id] = item.purchaseCost;
        });
        return {...list, ...(supplierPrices ?? {})};
    }, [items, supplierPrices]);

    const totals = useMemo(() => calculateSalesTotals(
        taxContext?.tax_types ?? [],
        taxIncluded,
        (lines ?? []).map(line => {
            const rule = taxContext?.item_tax_categories[String(byId.get(line.item_id ?? 0)?.item_tax_category_id ?? "")];
            return {
                quantity: Number(line.quantity) || 0,
                unit_price: Number(line.unit_price) || 0,
                discount_percent: 0,
                exempt: rule?.exempt,
                exempt_tax_type_ids: rule?.exempt_tax_type_ids,
            };
        }),
    ), [taxContext, taxIncluded, lines, byId]);

    return {
        supplier,
        currency,
        taxIncluded,
        priceList,
        lookedUpRate: rateLookup?.rate,
        foreignCurrency: !!rateLookup && rateLookup.rate !== 1,
        items,
        byId,
        totals,
    };
}

/** Live totals of rows priced elsewhere (receipt / bill lines): taxes from the supplier, item by id. */
export function usePricedRows(supplierId: number | null | undefined, taxIncluded: boolean, rows: {item_id: number | null, item_tax_category_id?: number | null, quantity: number, unit_price: number}[]): SalesTotals {
    const {data: taxContext} = useGetPurchaseTaxContext(supplierId);

    return useMemo(() => calculateSalesTotals(
        taxContext?.tax_types ?? [],
        taxIncluded,
        rows.map(row => {
            const rule = taxContext?.item_tax_categories[String(row.item_tax_category_id ?? "")];
            return {quantity: row.quantity, unit_price: row.unit_price, discount_percent: 0, exempt: rule?.exempt, exempt_tax_type_ids: rule?.exempt_tax_type_ids};
        }),
    ), [taxContext, taxIncluded, rows]);
}
