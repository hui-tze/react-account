import {ReactNode} from "react";
import {formatQuantity} from "@/utils/display-format";
import {Badge, Button, Form, Table} from "react-bootstrap";
import {Lock, Plus, X} from "react-feather";
import {Control, Controller, useFieldArray, UseFormSetValue, useWatch} from "react-hook-form";
import type {SalesLineRequest} from "@/apis/requests/sales-order-api";
import {ItemPicker, LineNumberInput} from "@/views/Inventory/shared/document";
import {formatDecimal} from "@/views/Inventory/shared/options";
import {useSmartTranslation} from "@/hooks/use-translation";
import type {SellableItem} from "./items";
import type {LineTotals} from "./tax";
import {EMPTY_LINE} from "./sales-form";
import {LinesFooter} from "./EntryLayout";

/** History that pins a saved line: what was already delivered / converted from it. */
export type LineLock = {
    // the line can't go below this quantity
    minQuantity: number,
    // e.g. "Delivered 3" / "Ordered 6"
    label: string,
    // item can't change and the line can't be removed
    locked: boolean,
};

// any form with sales `lines` (quotation, order, direct invoice, direct credit note)
type LinesForm = {lines: SalesLineRequest[]};

type SalesLinesTableProps<T extends LinesForm> = {
    control: Control<T>,
    setValue: UseFormSetValue<T>,
    items: SellableItem[],
    byId: Map<number, SellableItem>,
    // selling price per item id for the document's price list and currency
    priceList?: Record<string, number>,
    // customer's default line discount %
    defaultDiscount: number,
    taxIncluded: boolean,
    // live totals per line, same order as the lines
    lineTotals: LineTotals[],
    // keyed by saved line id
    locks?: Map<number, LineLock>,
    readOnly?: boolean,
    // purchases have no line discount
    showDiscount?: boolean,
    // translation key when no item matches the search
    noOptionsKey?: string,
    // under the grid: totals on the right, extra buttons beside "Add line"
    totals?: ReactNode,
    footerActions?: ReactNode,
    // quantity on hand per item id at the shipping location: shown under stock lines
    stockOnHand?: Record<string, number>,
};

/** The item lines of a quotation / order: item, description, qty, price, discount, tax and amount. */
export function SalesLinesTable<T extends LinesForm>(props: SalesLinesTableProps<T>) {
    // react-hook-form can't resolve `lines.${n}` paths on an open generic, so work on the slice type
    const {control, setValue, items, byId, priceList, defaultDiscount, taxIncluded, lineTotals, locks, readOnly, showDiscount = true, noOptionsKey = "noSellableItems", totals: totalsPanel, footerActions, stockOnHand} = props as unknown as SalesLinesTableProps<LinesForm>;
    const {t} = useSmartTranslation();
    const {fields, append, remove} = useFieldArray({control, name: "lines", keyName: "fieldKey"});
    const lines = useWatch({control, name: "lines"}) ?? [];

    // a picked item brings its name, list price and the customer's discount
    const onPicked = (index: number, item: SellableItem | undefined) => {
        if (!item) {
            return;
        }
        setValue(`lines.${index}.description`, item.name);
        const price = priceList?.[item.id];
        if (price !== undefined) {
            setValue(`lines.${index}.unit_price`, price, {shouldValidate: true});
        }
        if (showDiscount && !lines[index]?.discount_percent) {
            setValue(`lines.${index}.discount_percent`, defaultDiscount);
        }
    };

    return (
        <>
            <div className="table-responsive">
                <Table className="mb-0 sales-lines">
                    <thead className="table-light">
                        <tr>
                            <th className="doc-line-no">#</th>
                            <th style={{minWidth: 300}}>{t('item')}</th>
                            <th style={{width: 130}} className="text-end">{t('quantity')}</th>
                            <th style={{width: 140}} className="text-end">{taxIncluded ? t('priceInclTax') : t('price')}</th>
                            {showDiscount && <th style={{width: 100}} className="text-end">{t('discountPercentShort')}</th>}
                            <th style={{width: 120}}>{t('tax')}</th>
                            <th style={{width: 130}} className="text-end">{t('amount')}</th>
                            <th style={{width: 44}} />
                        </tr>
                    </thead>
                    <tbody>
                        {fields.map((field, index) => {
                            const line = lines[index];
                            const item = line?.item_id != null ? byId.get(line.item_id) : undefined;
                            const lock = line?.id ? locks?.get(line.id) : undefined;
                            const totals = lineTotals[index];
                            const taxCodes = (totals?.taxes ?? []).filter(tx => tx.tax_amount !== 0 || tx.rate === 0).map(tx => tx.code);

                            return (
                                <tr key={field.fieldKey}>
                                    <td className="doc-line-no">{index + 1}</td>
                                    <td>
                                        <ItemPicker
                                            control={control}
                                            name={`lines.${index}.item_id`}
                                            items={items}
                                            excludeIds={[]}
                                            disabled={readOnly || lock?.locked}
                                            noOptionsKey={noOptionsKey}
                                            onPicked={(picked) => onPicked(index, picked ? byId.get(picked.id) : undefined)}
                                        />
                                        {item && (
                                            <>
                                            <Controller
                                                    control={control}
                                                    name={`lines.${index}.description`}
                                                    render={({field: f}) => (
                                                        <Form.Control
                                                            size="sm"
                                                            className="sales-line-description"
                                                            placeholder={t('description')}
                                                            value={f.value ?? ""}
                                                            onChange={f.onChange}
                                                            onBlur={f.onBlur}
                                                            // only items that allow it take a custom description
                                                            disabled={readOnly || !item.allow_description_override}
                                                            title={!item.allow_description_override ? t('descriptionFixedHint') : undefined}
                                                        />
                                                    )}
                                                />
                                                <div className="sales-line-meta">
                                                    {[item.code, item.uom].filter(Boolean).join(" · ")}
                                                    {stockOnHand && ["stock", "manufactured"].includes(item.item_type) && (() => {
                                                        const onHand = Number(stockOnHand[item.id] ?? 0);
                                                        const short = (Number(line?.quantity) || 0) > onHand + 0.00005;
                                                        return <span className={short ? "text-danger fw-semibold" : "text-success fw-semibold"}> · {t('qtyOnHand', {qty: formatQuantity(onHand)})}</span>;
                                                    })()}
                                                </div>
                                                </>
                                        )}
                                    </td>
                                    <td>
                                        <LineNumberInput
                                            control={control}
                                            name={`lines.${index}.quantity`}
                                            min={0}
                                            disabled={readOnly}
                                            validate={(v) => {
                                                if (v <= 0) return t('valueMustBePositive');
                                                if (lock && v < lock.minQuantity) return t('quantityBelowDone', {qty: formatQuantity(lock.minQuantity)});
                                                return true;
                                            }}
                                        />
                                        <div className="sales-line-meta text-end">
                                            {lock ? (
                                                <Badge bg="light" className="badge-soft-info d-inline-flex align-items-center gap-1">
                                                    {lock.locked && <Lock size={10} />}{lock.label}
                                                </Badge>
                                            ) : item?.uom}
                                        </div>
                                    </td>
                                    <td>
                                        <LineNumberInput control={control} name={`lines.${index}.unit_price`} min={0} disabled={readOnly}
                                            validate={(v) => v >= 0 || t('valueMustNotBeNegative')} />
                                    </td>
                                    {showDiscount && (
                                        <td>
                                            <LineNumberInput control={control} name={`lines.${index}.discount_percent`} min={0} step="0.01" disabled={readOnly}
                                                validate={(v) => (v >= 0 && v <= 100) || t('percentMax100')} />
                                        </td>
                                    )}
                                    <td className="sales-line-amount fw-normal">
                                        {item ? (taxCodes.length
                                            ? <div className="d-flex flex-wrap gap-1">{taxCodes.map(code => <Badge key={code} bg="light" className="badge-soft-secondary">{code}</Badge>)}</div>
                                            : <span className="small text-muted">{t('noTax')}</span>) : null}
                                    </td>
                                    <td className="text-end sales-line-amount">
                                        {formatDecimal(totals?.line_total ?? 0)}
                                        {!!totals?.discount_amount && <div className="sales-line-meta fw-normal">−{formatDecimal(totals.discount_amount)}</div>}
                                    </td>
                                    <td className="text-end">
                                        {!readOnly && !lock?.locked && fields.length > 1 && (
                                            <Button variant="flush-secondary" size="sm" className="btn-icon btn-rounded doc-line-remove" title={t('remove')} onClick={() => remove(index)}>
                                                <X size={16} />
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </div>
            <LinesFooter
                actions={(!readOnly || footerActions) && (
                    <>
                        {!readOnly && (
                            <Button variant="outline-primary" onClick={() => append({...EMPTY_LINE, discount_percent: showDiscount ? defaultDiscount : 0})}>
                                <Plus size={15} className="me-1" />{t('addLine')}
                            </Button>
                        )}
                        {footerActions}
                    </>
                )}
                totals={totalsPanel}
            />
        </>
    );
}
