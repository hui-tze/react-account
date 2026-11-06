import {Button, ButtonGroup, Form, Table} from "react-bootstrap";
import {Link2, Zap} from "react-feather";
import {Control, Controller, FieldValues, UseFormSetValue} from "react-hook-form";
import type {OpenItem} from "@/apis/models/sales-document";
import {today} from "@/views/Inventory/shared/document";
import {formatDecimal} from "@/views/Inventory/shared/options";
import {useSmartTranslation} from "@/hooks/use-translation";
import {roundMoney} from "./tax";
import {DocCard} from "./DocCard";
import {LinesFooter, LinesNote} from "./EntryLayout";

// any form with a `pay` column: amount applied per row, in row order
type PayForm = {pay: (number | null)[]};

type AllocationTableProps<T extends PayForm> = {
    control: Control<T>,
    setValue: UseFormSetValue<T>,
    // the customer's open invoices (amount still owed in `open`)
    rows: OpenItem[],
    // what can be applied in total (payment + discount, or the credit note's total)
    available: number,
    // lines above "applied", e.g. amount received / discount, or credit total
    sources: {label: string, amount: number}[],
    // current pay column, for the applied / left-over summary
    pay: (number | null)[] | undefined,
    readOnly?: boolean,
    hint: string,
    emptyText: string,
    className?: string,
    // supplier side: bills and credit with the supplier
    party?: "customer" | "supplier",
};

/**
 * Card of the customer's open invoices with a "Pay" amount each (All / None per row,
 * auto-apply oldest due first), and what is applied versus left over as customer credit.
 */
export function AllocationTable<T extends PayForm>(props: AllocationTableProps<T>) {
    // react-hook-form can't resolve `pay.${n}` paths on an open generic, so work on the slice type
    const {control, setValue, rows, available, sources, pay, readOnly, hint, emptyText, className, party = "customer"} = props as unknown as AllocationTableProps<PayForm>;
    const supplier = party === "supplier";
    const {t} = useSmartTranslation();
    const applied = appliedTotal(pay);
    const remainder = roundMoney(available - applied);

    const autoApply = () => {
        let left = available;
        setValue("pay", rows.map(row => {
            const take = roundMoney(Math.max(0, Math.min(row.open, left)));
            left = roundMoney(left - take);
            return take;
        }), {shouldValidate: true});
    };

    return (
        <DocCard
            icon={Link2}
            title={supplier ? t('applyToBills') : t('applyToInvoices')}
            hint={hint}
            className={className}
            flush
            actions={!readOnly && rows.length > 0 && (
                <Button variant="outline-primary" size="sm" onClick={autoApply}><Zap size={14} className="me-1" />{t('autoApply')}</Button>
            )}
        >
            {rows.length === 0 ? <LinesNote>{emptyText}</LinesNote> : (
                <div className="table-responsive">
                    <Table className="mb-0 sales-lines">
                        <thead className="table-light">
                            <tr>
                                <th>{supplier ? t('bill') : t('invoice')}</th>
                                <th>{t('date')}</th>
                                <th>{t('dueDate')}</th>
                                <th className="text-end">{t('total')}</th>
                                <th className="text-end">{t('owed')}</th>
                                <th className="text-end" style={{width: 160}}>{t('pay')}</th>
                                <th style={{width: 110}} />
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, index) => (
                                <tr key={row.id}>
                                    <td className="sales-line-amount">{row.reference_no}</td>
                                    <td className="sales-line-amount fw-normal">{row.trans_date}</td>
                                    <td className={`sales-line-amount fw-normal ${row.due_date && row.due_date < today() ? "text-danger" : ""}`}>{row.due_date ?? "-"}</td>
                                    <td className="text-end sales-line-amount fw-normal">{formatDecimal(row.grand_total)}</td>
                                    <td className="text-end sales-line-amount">{formatDecimal(row.open)}</td>
                                    <td>
                                        <Controller
                                            control={control}
                                            name={`pay.${index}`}
                                            rules={{validate: (v) => (Number(v) || 0) <= row.open + 0.005 || t('maxAvailable', {qty: formatDecimal(row.open)})}}
                                            render={({field, fieldState}) => (
                                                <>
                                                    <Form.Control size="sm" type="number" step="0.01" min={0} className="text-end" value={field.value ?? ""}
                                                        onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                                                        onBlur={field.onBlur} isInvalid={!!fieldState.error} disabled={readOnly} />
                                                    <Form.Control.Feedback type="invalid">{fieldState.error?.message}</Form.Control.Feedback>
                                                </>
                                            )}
                                        />
                                    </td>
                                    <td className="text-end">
                                        {!readOnly && (
                                            <ButtonGroup size="sm">
                                                <Button variant="flush-primary" onClick={() => setValue(`pay.${index}`, row.open, {shouldValidate: true})}>{t('all')}</Button>
                                                <Button variant="flush-secondary" onClick={() => setValue(`pay.${index}`, 0, {shouldValidate: true})}>{t('none')}</Button>
                                            </ButtonGroup>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}

            <LinesFooter totals={(
                <dl className="doc-totals">
                    {sources.map(source => (
                        <div key={source.label}><dt>{source.label}</dt><dd>{formatDecimal(source.amount)}</dd></div>
                    ))}
                    <div><dt>{supplier ? t('appliedToBills') : t('appliedToInvoices')}</dt><dd>{formatDecimal(applied)}</dd></div>
                    <div className="doc-totals-grand">
                        <dt>{remainder >= 0 ? (supplier ? t('leftAsSupplierCredit') : t('leftAsCredit')) : (supplier ? t('overAppliedPaid') : t('overApplied'))}</dt>
                        <dd className={remainder < 0 ? "text-danger" : undefined}>{formatDecimal(remainder)}</dd>
                    </div>
                </dl>
            )} />
        </DocCard>
    );
}

/** Σ of the pay column. */
export function appliedTotal(pay: (number | null)[] | undefined): number {
    return roundMoney((pay ?? []).reduce((sum: number, v) => sum + (Number(v) || 0), 0));
}

/** Rows with a positive amount, as API allocations. */
export function toAllocations(rows: OpenItem[], pay: (number | null)[]): {target_id: number, amount: number}[] {
    return rows.map((row, i) => ({target_id: row.id, amount: Number(pay[i]) || 0})).filter(a => a.amount > 0);
}
