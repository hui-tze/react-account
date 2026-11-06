import {useMemo} from "react";
import {Button, Col, Row, Table} from "react-bootstrap";
import {useFieldArray, useWatch} from "react-hook-form";
import {Plus} from "react-feather";
import {useRequestForm} from "@/hooks/use-request-handler";
import {SupplierTransDocument} from "@/apis/models/purchase-document";
import {BillKind, PurchaseLineRequest, SupplierCreditNoteRequest} from "@/apis/requests/purchase-api";
import {TextAreaField, TextField} from "@/components/FormField/FormFields";
import SettingsFormPage from "@/views/Settings/shared/SettingsFormPage";
import {applyServerErrors, LineNumberInput, today} from "@/views/Inventory/shared/document";
import {formatDecimal} from "@/views/Inventory/shared/options";
import {blankToNull} from "@/views/Settings/Organization/Profile/profile-form";
import {useSmartTranslation} from "@/hooks/use-translation";
import {SalesLinesTable} from "@/views/Sales/shared/SalesLinesTable";
import {TotalsPanel} from "@/views/Sales/shared/TotalsPanel";
import {DocCard, DocPair, DocTotal, FactsGrid} from "@/views/Sales/shared/DocCard";
import {SelfBilledEinvoiceSection} from "@/views/Sales/shared/billing";
import {ExchangeRateField} from "@/views/Sales/shared/ExchangeRateField";
import {EntryChecks, LinesFooter, LinesNote, lineChecks, totalDetails, useErrorCheck} from "@/views/Sales/shared/EntryLayout";
import {SupplierSection, useSupplierChecks} from "../shared/SupplierSection";
import {usePurchasePricing} from "../shared/usePurchasePricing";
import {EMPTY_PURCHASE_LINE, linesToPayload} from "../shared/purchase-form";

type SupplierCreditNoteFormProps = {
    kind: BillKind,
    // the bill being credited (returns come from its lines); none = plain credit lines only
    bill?: SupplierTransDocument,
    backTo: string,
    onSubmit: (data: SupplierCreditNoteRequest) => Promise<void>,
    onSuccess?: () => Promise<void>,
};

type CreditValues = {
    reference_no: string,
    supplier_id: number | null,
    tax_included: boolean | null,
    supplier_invoice_no: string,
    trans_date: string,
    exchange_rate: number | null,
    remarks: string,
    // goods returned per bill line, in row order
    returns: {quantity: number | null, unit_price: number | null}[],
    // plain credits (price adjustments, rebates)
    lines: PurchaseLineRequest[],
};

/** A supplier (or self-billed) credit note: goods returned from a bill and/or plain credit lines. */
export function SupplierCreditNoteForm({kind, bill, backTo, onSubmit, onSuccess}: SupplierCreditNoteFormProps) {
    const {t} = useSmartTranslation();
    const selfBilled = kind === "self_billed";

    // bill lines with received goods behind them that can still go back
    const rows = useMemo(() => (bill?.lines ?? [])
        .filter(line => line.goods_receipt_item_id)
        .map(line => ({...line, returnable: Math.max(0, Math.min(line.quantity, (line.billed ?? 0) - (line.returned ?? 0)))})), [bill]);

    const {control, setValue, setError, submitting, handleSubmitRequest} = useRequestForm<CreditValues>({
        formOptions: {
            defaultValues: {
                reference_no: "",
                supplier_id: bill?.supplier_id ?? null,
                tax_included: bill ? bill.tax_included : null,
                supplier_invoice_no: "",
                trans_date: today(),
                exchange_rate: null,
                remarks: "",
                returns: rows.map(row => ({quantity: 0, unit_price: row.unit_price})),
                lines: bill ? [] : [{...EMPTY_PURCHASE_LINE}],
            },
        },
    });
    const {append} = useFieldArray({control, name: "lines"});

    const [transDate, returns, lines, supplierId] = useWatch({control, name: ["trans_date", "returns", "lines", "supplier_id"]});
    const pricedLines = useMemo(() => [
        ...rows.map((row, i) => ({item_id: row.item_id, quantity: Number(returns?.[i]?.quantity) || 0, unit_price: Number(returns?.[i]?.unit_price) || 0})),
        ...(lines ?? []).map(line => ({item_id: line?.item_id, quantity: line?.quantity, unit_price: line?.unit_price})),
    ], [rows, returns, lines]);
    const pricing = usePurchasePricing(control, transDate, pricedLines);

    const submit = async (values: CreditValues) => {
        const returned = rows
            .map((row, i) => ({goods_receipt_item_id: row.goods_receipt_item_id, quantity: Number(values.returns[i]?.quantity) || 0, unit_price: Number(values.returns[i]?.unit_price) || 0}))
            .filter(line => line.quantity > 0);
        const credits = linesToPayload(values.lines).map(({item_id, description, quantity, unit_price}) => ({item_id, description, quantity, unit_price}));
        if (returned.length + credits.length === 0) {
            setError("lines", {type: "manual", message: t('creditAtLeastOne')});
            throw new Error(t('creditAtLeastOne'));
        }
        try {
            await onSubmit({
                reference_no: values.reference_no.trim(),
                supplier_id: values.supplier_id,
                source_bill_id: bill?.id ?? null,
                supplier_invoice_no: selfBilled ? null : values.supplier_invoice_no.trim(),
                trans_date: values.trans_date,
                // blank: the bill's rate
                exchange_rate: values.exchange_rate,
                tax_included: values.tax_included ?? pricing.taxIncluded,
                remarks: blankToNull(values.remarks),
                lines: [...returned, ...credits],
            });
        } catch (e) {
            applyServerErrors(e, setError, ["reference_no", "supplier_id", "source_bill_id", "supplier_invoice_no", "trans_date", "exchange_rate", "lines", "accounts", "stock"]);
            throw e;
        }
    };

    const returning = rows.filter((_, i) => (Number(returns?.[i]?.quantity) || 0) > 0).length;
    const supplierCheck = useSupplierChecks(control);
    const lineCheck = lineChecks(lines, t, {optional: true});
    const errorCheck = useErrorCheck(control);
    const totalsPanel = <TotalsPanel totals={pricing.totals} taxIncluded={pricing.taxIncluded} currencyCode={pricing.currency?.code} totalLabel={t('creditTotal')} />;

    return (
        <SettingsFormPage onSubmit={handleSubmitRequest({request: submit, onSuccess})} submitting={submitting} isEditing={false}
            backTo={backTo} submitLabel={t('saveCreditNote')} stickyActions documentLayout
            actionsSummary={<DocTotal label={t('creditTotal')} amount={pricing.totals.grand_total} currencyCode={pricing.currency?.code}
                details={totalDetails(pricing.totals, returning + lineCheck.filled, t)} />}>
            <EntryChecks
                issues={[
                    errorCheck,
                    ...(bill ? [] : supplierCheck.issues),
                    returning + lineCheck.filled === 0 && {text: t('creditAtLeastOne'), tone: "info" as const},
                    ...lineCheck.issues,
                ]}
                ready={[bill ? t('creditingBill', {ref: bill.reference_no}) : supplierCheck.ready[0], t('lineCount', {count: returning + lineCheck.filled})]}
            />

            <DocPair>
                {bill ? (
                    <DocCard title={selfBilled ? t('docType_self_billed_invoice') : t('docType_supplier_bill')} hint={t('creditAppliedToBillHint')}>
                        <FactsGrid facts={[
                            {label: t('referenceNo'), value: bill.reference_no},
                            {label: t('supplierInvoiceNo'), value: selfBilled ? undefined : bill.supplier_invoice_no},
                            {label: t('supplier'), value: bill.supplier?.name},
                            {label: t('billDate'), value: bill.trans_date},
                            {label: t('total'), value: `${formatDecimal(bill.grand_total)} ${bill.currency}`},
                            {label: t('owed'), value: formatDecimal(bill.balance ?? 0)},
                        ]} />
                    </DocCard>
                ) : (
                    <DocCard title={t('supplier')} hint={t('plainCreditHint')}>
                        <SupplierSection control={control} setValue={setValue} />
                    </DocCard>
                )}

                <DocCard title={t('creditNoteDetails')}>
                    <Row className="gx-4">
                        {!selfBilled && (
                            <Col sm={6}>
                                <TextField control={control} name="supplier_invoice_no" label={t('supplierCreditNoteNo')} required maxLength={255} />
                            </Col>
                        )}
                        <Col sm={6}>
                            <TextField control={control} name="trans_date" label={t('creditNoteDate')} type="date" required />
                        </Col>
                        <Col sm={6}>
                            <TextField control={control} name="reference_no" label={selfBilled ? t('referenceNo') : t('ourReference')} maxLength={255} placeholder={t('autoGenerated')} />
                        </Col>
                        <ExchangeRateField control={control} pricing={pricing} savedRate={bill?.exchange_rate} />
                    </Row>
                </DocCard>
            </DocPair>

            {bill && (
                <DocCard title={t('goodsReturned')} hint={t('goodsReturnedHint')} flush>
                    {rows.length === 0 ? <LinesNote>{t('nothingToReturn')}</LinesNote> : (
                        <div className="table-responsive">
                            <Table className="mb-0 sales-lines">
                                <thead className="table-light">
                                    <tr>
                                        <th className="doc-line-no">#</th>
                                        <th style={{minWidth: 240}}>{t('item')}</th>
                                        <th className="text-end" style={{width: 100}}>{t('billed')}</th>
                                        <th className="text-end" style={{width: 120}}>{t('returnable')}</th>
                                        <th className="text-end" style={{width: 140}}>{t('returnQty')}</th>
                                        <th className="text-end" style={{width: 140}}>{bill.tax_included ? t('priceInclTax') : t('price')}</th>
                                        <th className="text-end" style={{width: 120}}>{t('amount')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, index) => (
                                        <tr key={row.id}>
                                            <td className="doc-line-no">{index + 1}</td>
                                            <td>
                                                <div className="fw-semibold text-dark">{row.item_code}</div>
                                                <div className="small text-muted">{row.description}{row.grn_reference_no ? ` · ${row.grn_reference_no}` : ""}</div>
                                            </td>
                                            <td className="text-end">{formatDecimal(row.quantity)}</td>
                                            <td className="text-end text-muted">{formatDecimal(row.returnable)}</td>
                                            <td>
                                                <LineNumberInput control={control} name={`returns.${index}.quantity`} min={0}
                                                    validate={(v) => v < 0 ? t('valueMustNotBeNegative') : v > row.returnable + 0.00005 ? t('maxAvailable', {qty: formatDecimal(row.returnable)}) : true} />
                                            </td>
                                            <td>
                                                <LineNumberInput control={control} name={`returns.${index}.unit_price`} min={0} validate={(v) => v >= 0 || t('valueMustNotBeNegative')} />
                                            </td>
                                            <td className="text-end sales-line-amount">{formatDecimal(pricing.totals.lines[index]?.line_total ?? 0)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </DocCard>
            )}

            <DocCard title={bill ? t('otherCredits') : t('creditLines')} hint={t('plainCreditLinesHint')} flush>
                {(lines ?? []).length > 0 ? (
                    <SalesLinesTable control={control} setValue={setValue} items={pricing.items} byId={pricing.byId}
                        defaultDiscount={0} showDiscount={false} noOptionsKey="noPurchasableItems" taxIncluded={pricing.taxIncluded}
                        lineTotals={pricing.totals.lines.slice(rows.length)} totals={totalsPanel} />
                ) : (
                    <>
                        <LinesNote>{t('noOtherCredits')}</LinesNote>
                        <LinesFooter
                            actions={<Button variant="outline-primary" onClick={() => append({...EMPTY_PURCHASE_LINE})}><Plus size={15} className="me-1" />{t('addLine')}</Button>}
                            totals={totalsPanel}
                        />
                    </>
                )}
            </DocCard>

            {selfBilled && <SelfBilledEinvoiceSection transType="self_billed_credit_note" supplierId={supplierId} />}

            <DocCard title={t('reasonForCredit')}>
                <TextAreaField control={control} name="remarks" label={t('reasonForCredit')} rows={3} placeholder={t('reasonForCreditPlaceholder')} />
            </DocCard>
        </SettingsFormPage>
    );
}
