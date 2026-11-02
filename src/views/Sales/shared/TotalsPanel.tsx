import {Table} from "react-bootstrap";
import {formatDecimal} from "@/views/Inventory/shared/options";
import {useSmartTranslation} from "@/hooks/use-translation";
import type {SalesTotals} from "./tax";

type TotalsPanelProps = {
    totals: SalesTotals,
    taxIncluded: boolean,
    currencyCode?: string,
};

/**
 * Subtotal, each tax and the document total — live while the user types.
 * Shipping is not a separate amount: it is charged as an item line.
 */
export function TotalsPanel({totals, taxIncluded, currencyCode}: TotalsPanelProps) {
    const {t} = useSmartTranslation();
    const money = (value: number) => formatDecimal(value);

    return (
        <div className="sales-totals-card">
            <Table size="sm" borderless className="mb-0 sales-totals">
                <tbody>
                    <tr>
                        <td className="text-muted">{t('subtotal')}</td>
                        <td className="text-end">{money(totals.subtotal)}</td>
                    </tr>
                    {totals.discount_total > 0 && (
                        <tr>
                            <td className="text-muted small ps-3">{t('discountIncluded')}</td>
                            <td className="text-end text-muted small">−{money(totals.discount_total)}</td>
                        </tr>
                    )}
                    {totals.taxes.map(tax => (
                        <tr key={tax.tax_type_id}>
                            <td className="text-muted">
                                {taxIncluded ? t('taxIncludedLine', {name: tax.name, rate: tax.rate}) : t('taxLine', {name: tax.name, rate: tax.rate})}
                            </td>
                            <td className="text-end">{money(tax.tax_amount)}</td>
                        </tr>
                    ))}
                    <tr className="border-top">
                        <td className="fw-semibold pt-3">{t('total')}{currencyCode ? ` (${currencyCode})` : ""}</td>
                        <td className="text-end pt-3 sales-grand-total">{money(totals.grand_total)}</td>
                    </tr>
                </tbody>
            </Table>
        </div>
    );
}
