import {formatDecimal} from "@/views/Inventory/shared/options";
import {useSmartTranslation} from "@/hooks/use-translation";
import type {SalesTotals} from "./tax";

type TotalsPanelProps = {
    totals: SalesTotals,
    taxIncluded: boolean,
    currencyCode?: string,
    // e.g. "Total due", "Order total", "Credit total"; defaults to "Total"
    totalLabel?: string,
};

/**
 * Subtotal before discounts, line discounts, each tax and the document total — live while
 * the user types. Shipping is not a separate amount: it is charged as an item line.
 */
export function TotalsPanel({totals, taxIncluded, currencyCode, totalLabel}: TotalsPanelProps) {
    const {t} = useSmartTranslation();
    const money = (value: number) => formatDecimal(value);
    const hasDiscount = totals.discount_total > 0;

    return (
        <dl className="doc-totals">
            <div>
                <dt>{t('subtotal')}</dt>
                <dd>{money(totals.subtotal + totals.discount_total)}</dd>
            </div>
            {hasDiscount && (
                <>
                    <div className="is-discount">
                        <dt>{t('lineDiscounts')}</dt>
                        <dd>−{money(totals.discount_total)}</dd>
                    </div>
                    <div>
                        <dt>{t('afterDiscount')}</dt>
                        <dd>{money(totals.subtotal)}</dd>
                    </div>
                </>
            )}
            {totals.taxes.map(tax => (
                <div key={tax.tax_type_id}>
                    <dt>{taxIncluded ? t('taxIncludedLine', {name: tax.name, rate: tax.rate}) : t('taxLine', {name: tax.name, rate: tax.rate})}</dt>
                    <dd>{money(tax.tax_amount)}</dd>
                </div>
            ))}
            <div className="doc-totals-grand">
                <dt>{totalLabel ?? t('total')}</dt>
                <dd>{currencyCode ? `${currencyCode} ` : ""}{money(totals.grand_total)}</dd>
            </div>
        </dl>
    );
}
