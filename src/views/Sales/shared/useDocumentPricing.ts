import {useMemo} from "react";
import {Control, FieldValues, useWatch} from "react-hook-form";
import {Customer} from "@/apis/models/customer";
import {Currency} from "@/apis/models/currency";
import {useGetCustomerOptions} from "@/apis/requests/customer-api";
import {useGetCurrencyOptions} from "@/apis/requests/currency-api";
import {useGetSalesTypeOptions} from "@/apis/requests/sales-type-api";
import {useGetExchangeRate, useGetSalesPriceList, useGetSalesTaxContext} from "@/apis/requests/sales-lookup-api";
import {SellableItem, useSellableItems} from "./items";
import {calculateSalesTotals, SalesTotals} from "./tax";

type PricedLine = {item_id?: number | null, quantity?: number | null, unit_price?: number | null, discount_percent?: number | null};

export type DocumentPricing = {
    customer?: Customer,
    currency?: Currency,
    taxIncluded: boolean,
    // selling price per item id for the document's price list
    priceList?: Record<string, number>,
    // rate on the document date: 1 home currency, null = foreign currency without a rate yet
    lookedUpRate?: number | null,
    foreignCurrency: boolean,
    items: SellableItem[],
    byId: Map<number, SellableItem>,
    // customer's default line discount %
    defaultDiscount: number,
    totals: SalesTotals,
};

/**
 * Everything a customer document form needs to price itself while the user types:
 * the customer's currency and discount, the price list and whether it includes tax, the
 * branch's taxes, the exchange rate, and the live totals (backend recalculates on save).
 */
export function useDocumentPricing<T extends FieldValues>(control: Control<T>, date: string | null | undefined, lines: PricedLine[] | undefined, savedTaxIncluded?: boolean): DocumentPricing {
    // react-hook-form can't resolve paths on an open generic, so read the slice by name
    const slice = control as unknown as Control<{customer_id: number | null, branch_id: number | null, sales_type_id: number | null}>;
    const [customerId, branchId, salesTypeId] = useWatch({control: slice, name: ["customer_id", "branch_id", "sales_type_id"]});

    const {data: customers} = useGetCustomerOptions();
    const {data: currencies} = useGetCurrencyOptions();
    const {data: salesTypes} = useGetSalesTypeOptions();
    const {items, byId} = useSellableItems();

    const customer = customers?.find(c => c.id === customerId);
    const currency = currencies?.find(c => c.id === customer?.currency_id);
    const salesType = salesTypes?.find(s => s.id === salesTypeId);
    const taxIncluded = salesType ? !!salesType.tax_included : !!savedTaxIncluded;

    const {data: taxContext} = useGetSalesTaxContext(branchId);
    const {data: priceList} = useGetSalesPriceList(salesTypeId, customer?.currency_id);
    const {data: rateLookup} = useGetExchangeRate(customer?.currency_id, date);

    const totals = useMemo(() => calculateSalesTotals(
        taxContext?.tax_types ?? [],
        taxIncluded,
        (lines ?? []).map(line => {
            const rule = taxContext?.item_tax_categories[String(byId.get(line.item_id ?? 0)?.item_tax_category_id ?? "")];
            return {
                quantity: Number(line.quantity) || 0,
                unit_price: Number(line.unit_price) || 0,
                discount_percent: Number(line.discount_percent) || 0,
                exempt: rule?.exempt,
                exempt_tax_type_ids: rule?.exempt_tax_type_ids,
            };
        }),
    ), [taxContext, taxIncluded, lines, byId]);

    return {
        customer,
        currency,
        taxIncluded,
        priceList,
        lookedUpRate: rateLookup?.rate,
        foreignCurrency: !!rateLookup && rateLookup.rate !== 1,
        items,
        byId,
        defaultDiscount: Number(customer?.default_discount ?? 0),
        totals,
    };
}
