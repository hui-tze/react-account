import {ReactNode, useEffect, useMemo} from "react";
import {formatQuantity} from "@/utils/display-format";
import {Button, ButtonGroup, Col, Row, Table} from "react-bootstrap";
import {useFieldArray, useWatch} from "react-hook-form";
import {Plus} from "react-feather";
import {useRequestForm} from "@/hooks/use-request-handler";
import {OpenGoodsReceiptItem, SupplierTransDocument} from "@/apis/models/purchase-document";
import {BillKind, BillRequest, goodsReceiptApi, PurchaseLineRequest} from "@/apis/requests/purchase-api";
import {useGetInventoryLocationOptions} from "@/apis/requests/inventory-location-api";
import {useGetPaymentTermOptions} from "@/apis/requests/payment-term-api";
import {SelectField, TextAreaField, TextField} from "@/components/FormField/FormFields";
import SettingsFormPage from "@/views/Settings/shared/SettingsFormPage";
import {applyServerErrors, LineNumberInput, today} from "@/views/Inventory/shared/document";
import {formatDecimal} from "@/views/Inventory/shared/options";
import {blankToNull} from "@/views/Settings/Organization/Profile/profile-form";
import {useSmartTranslation} from "@/hooks/use-translation";
import {SalesLinesTable} from "@/views/Sales/shared/SalesLinesTable";
import {TotalsPanel} from "@/views/Sales/shared/TotalsPanel";
import {DocCard, DocPair, DocTotal} from "@/views/Sales/shared/DocCard";
import {SelfBilledEinvoiceSection} from "@/views/Sales/shared/billing";
import {ExchangeRateField} from "@/views/Sales/shared/ExchangeRateField";
import {dueDateOf} from "@/views/Sales/shared/terms";
import {EntryChecks, LinesFooter, LinesNote, lineChecks, totalDetails, useErrorCheck} from "@/views/Sales/shared/EntryLayout";
import {SupplierSection, useSupplierChecks} from "../shared/SupplierSection";
import {usePurchasePricing} from "../shared/usePurchasePricing";
import {EMPTY_PURCHASE_LINE, linesToPayload} from "../shared/purchase-form";
import {DimensionFields} from "@/views/Dimensions/shared/DimensionFields";
import type {DimensionTag} from "@/apis/models/dimension";

type BillFormProps = {
    kind: BillKind,
    record?: SupplierTransDocument,
    // new bill: start with a blank item line instead of received goods
    direct?: boolean,
    // new bill: pre-pick this supplier and bill everything from this receipt
    supplierId?: number | null,
    receiptId?: number | null,
    backTo: string,
    onSubmit: (data: BillRequest) => Promise<void>,
    onSuccess?: () => Promise<void>,
    banner?: ReactNode,
};

type BillValues = {
    reference_no: string,
    supplier_id: number | null,
    tax_included: boolean | null,
    supplier_invoice_no: string,
    trans_date: string,
    due_date: string | null,
    exchange_rate: number | null,
    warehouse_id: number | null,
    remarks: string,
    dimensions: DimensionTag[],
    // received goods: quantity / price per open GRN line, in row order
    grn: {quantity: number | null, unit_price: number | null}[],
    // item lines the bill receives itself
    lines: PurchaseLineRequest[],
};

/** A GRN line that can be billed: open goods, plus (edit) what this bill already bills. */
type GrnRow = OpenGoodsReceiptItem & {mine: number};

/** Default bill price of received goods: as ordered when the tax basis matches, else the net cost. */
const defaultPrice = (row: OpenGoodsReceiptItem, taxIncluded: boolean) => row.order_tax_included === taxIncluded ? row.order_unit_price : row.unit_cost;

export function BillForm({kind, record, direct, supplierId: givenSupplierId, receiptId, backTo, onSubmit, onSuccess, banner}: BillFormProps) {
    const {t} = useSmartTranslation();
    const readOnly = !!record && record.status !== "active";
    const selfBilled = kind === "self_billed";
    const {data: locations} = useGetInventoryLocationOptions();
    const {data: terms} = useGetPaymentTermOptions();

    const recordGrnLines = (record?.lines ?? []).filter(line => !line.direct);
    const recordDirectLines = (record?.lines ?? []).filter(line => line.direct);

    const {control, setValue, getValues, setError, submitting, handleSubmitRequest} = useRequestForm<BillValues>({
        formOptions: {
            defaultValues: {
                reference_no: record?.reference_no ?? "",
                supplier_id: record?.supplier_id ?? givenSupplierId ?? null,
                tax_included: record ? record.tax_included : null,
                supplier_invoice_no: record && !selfBilled ? record.supplier_invoice_no : "",
                trans_date: record?.trans_date ?? today(),
                due_date: record?.due_date ?? null,
                exchange_rate: record && Number(record.exchange_rate) !== 1 ? Number(record.exchange_rate) : null,
                warehouse_id: record?.warehouse_id ?? null,
                remarks: record?.remarks ?? "",
                dimensions: record?.dimensions ?? [],
                grn: [],
                lines: record
                    ? recordDirectLines.map(line => ({item_id: line.item_id, description: line.description, quantity: line.quantity, unit_price: line.unit_price, discount_percent: 0}))
                    : (direct || selfBilled ? [{...EMPTY_PURCHASE_LINE}] : []),
            },
        },
    });
    const {append} = useFieldArray({control, name: "lines"});

    const [supplierId, transDate, grn, lines, taxIncludedField, dueDate] = useWatch({control, name: ["supplier_id", "trans_date", "grn", "lines", "tax_included", "due_date"]});
    const {data: openItems} = goodsReceiptApi.useOpenItems(readOnly ? null : supplierId, {revalidateOnFocus: false});
    // billing a receipt: start from its dimension values
    const {data: sourceReceipt} = goodsReceiptApi.useGetOne(!record && receiptId ? receiptId : null, {revalidateOnFocus: false});
    useEffect(() => {
        if (sourceReceipt?.dimensions?.length) {
            setValue("dimensions", sourceReceipt.dimensions);
        }
    }, [sourceReceipt, setValue]);

    // open received goods, plus (edit) the ones this bill bills — its own quantity counts as open
    const rows: GrnRow[] = useMemo(() => {
        const mine = new Map<number, number>();
        recordGrnLines.forEach(line => mine.set(line.goods_receipt_item_id ?? 0, (mine.get(line.goods_receipt_item_id ?? 0) ?? 0) + line.quantity));
        const list: GrnRow[] = (openItems ?? []).map(item => ({...item, mine: mine.get(item.goods_receipt_item_id) ?? 0, open: item.open + (mine.get(item.goods_receipt_item_id) ?? 0)}));
        recordGrnLines.forEach(line => {
            if (!list.some(row => row.goods_receipt_item_id === line.goods_receipt_item_id)) {
                list.push({
                    goods_receipt_item_id: line.goods_receipt_item_id ?? 0, goods_receipt_id: 0, grn_reference_no: line.grn_reference_no ?? "", receipt_date: "",
                    purchase_order_id: 0, po_reference_no: line.po_reference_no ?? null, item_id: line.item_id, item_code: line.item_code, description: line.description,
                    received: line.quantity, billed: line.quantity, open: line.quantity, unit_cost: line.unit_price, order_unit_price: line.unit_price,
                    order_tax_included: record?.tax_included ?? false, item: line.item, mine: line.quantity,
                });
            }
        });
        return list;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openItems, record]);

    // (re)fill the received-goods column when the supplier's open goods arrive
    useEffect(() => {
        const taxIncluded = taxIncludedField ?? false;
        const priced = new Map(recordGrnLines.map(line => [line.goods_receipt_item_id, line.unit_price]));
        setValue("grn", rows.map(row => {
            if (record) {
                return {quantity: row.mine, unit_price: priced.get(row.goods_receipt_item_id) ?? defaultPrice(row, taxIncluded)};
            }
            const take = receiptId && row.goods_receipt_id === receiptId ? row.open : 0;
            return {quantity: take, unit_price: defaultPrice(row, taxIncluded)};
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rows, record, receiptId, setValue]);

    // every line priced together: received goods first, then the item lines
    const pricedLines = useMemo(() => [
        ...rows.map((row, i) => ({item_id: row.item_id, quantity: Number(grn?.[i]?.quantity) || 0, unit_price: Number(grn?.[i]?.unit_price) || 0})),
        ...(lines ?? []).map(line => ({item_id: line?.item_id, quantity: line?.quantity, unit_price: line?.unit_price})),
    ], [rows, grn, lines]);
    const pricing = usePurchasePricing(control, transDate, pricedLines);
    const directTotals = pricing.totals.lines.slice(rows.length);
    const needsLocation = (lines ?? []).some(line => {
        const type = pricing.byId.get(line?.item_id ?? 0)?.item_type;
        return type === "stock" || type === "manufactured";
    });

    const supplierTerm = terms?.find(p => p.id === pricing.supplier?.payment_terms_id);
    const suggestedDue = transDate && supplierTerm ? dueDateOf(supplierTerm, transDate) : null;

    const locationOptions = (locations ?? [])
        .filter(l => l.status === "active" || l.id === record?.warehouse_id)
        .map(l => ({value: l.id, label: `${l.code} - ${l.name}`}));

    const submit = async (values: BillValues) => {
        const billed = rows
            .map((row, i) => ({goods_receipt_item_id: row.goods_receipt_item_id, quantity: Number(values.grn[i]?.quantity) || 0, unit_price: Number(values.grn[i]?.unit_price) || 0}))
            .filter(line => line.quantity > 0);
        const itemLines = linesToPayload(values.lines).map(({item_id, description, quantity, unit_price}) => ({item_id, description, quantity, unit_price}));
        if (billed.length + itemLines.length === 0) {
            setError("lines", {type: "manual", message: t('billAtLeastOne')});
            throw new Error(t('billAtLeastOne'));
        }
        try {
            await onSubmit({
                reference_no: values.reference_no.trim(),
                supplier_id: values.supplier_id,
                supplier_invoice_no: selfBilled ? null : values.supplier_invoice_no.trim(),
                trans_date: values.trans_date,
                due_date: values.due_date || null,
                exchange_rate: values.exchange_rate,
                tax_included: values.tax_included ?? pricing.taxIncluded,
                warehouse_id: itemLines.length ? values.warehouse_id : null,
                remarks: blankToNull(values.remarks),
                dimensions: values.dimensions,
                lines: [...billed, ...itemLines],
            });
        } catch (e) {
            applyServerErrors(e, setError, ["reference_no", "supplier_id", "supplier_invoice_no", "trans_date", "due_date", "exchange_rate", "warehouse_id", "dimensions", "lines", "accounts", "stock"]);
            throw e;
        }
    };

    const billing = rows.reduce((n, _, i) => n + ((Number(grn?.[i]?.quantity) || 0) > 0 ? 1 : 0), 0);
    const supplierCheck = useSupplierChecks(control);
    const lineCheck = lineChecks(lines, t, {optional: true});
    const errorCheck = useErrorCheck(control);
    const [supplierInvoiceNo] = useWatch({control, name: ["supplier_invoice_no"]});
    const totalsPanel = <TotalsPanel totals={pricing.totals} taxIncluded={pricing.taxIncluded} currencyCode={pricing.currency?.code} totalLabel={t('totalDue')} />;

    return (
        <SettingsFormPage onSubmit={handleSubmitRequest({request: submit, onSuccess})} submitting={submitting} isEditing={!!record}
            backTo={backTo} readOnly={readOnly} submitLabel={record ? undefined : (selfBilled ? t('saveSelfBilledInvoice') : t('saveBill'))}
            stickyActions documentLayout
            actionsSummary={<DocTotal label={t('totalDue')} amount={pricing.totals.grand_total} currencyCode={pricing.currency?.code}
                details={totalDetails(pricing.totals, billing + lineCheck.filled, t)} />}>
            {banner}
            {!readOnly && (
                <EntryChecks
                    issues={[
                        errorCheck,
                        ...supplierCheck.issues,
                        !selfBilled && supplierId && !String(supplierInvoiceNo ?? "").trim() && {text: t('checkSupplierInvoiceNo'), tone: "info" as const},
                        supplierId && billing + lineCheck.filled === 0 && {text: t('billAtLeastOne'), tone: "info" as const},
                        ...lineCheck.issues,
                    ]}
                    ready={[...supplierCheck.ready, t('lineCount', {count: billing + lineCheck.filled})]}
                />
            )}

            <DocPair>
                <DocCard title={selfBilled ? t('whoYouAreBillingFor') : t('whoBilledYou')}>
                    <SupplierSection control={control} setValue={setValue} getValues={getValues} readOnly={readOnly} lockSupplier={!!record}>
                        {!selfBilled && (
                            <Col md={6}>
                                <TextField control={control} name="supplier_invoice_no" label={t('supplierInvoiceNo')} required maxLength={255} disabled={readOnly} />
                            </Col>
                        )}
                    </SupplierSection>
                </DocCard>

                <DocCard title={selfBilled ? t('invoiceDetails') : t('billDetails')} hint={selfBilled ? t('selfBilledHint') : undefined}>
                    <Row className="gx-4">
                        <Col sm={6}>
                            <TextField control={control} name="trans_date" label={selfBilled ? t('invoiceDate') : t('billDate')} type="date" required disabled={readOnly} />
                        </Col>
                        <Col sm={6}>
                            <TextField control={control} name="due_date" label={t('dueDate')} type="date" disabled={readOnly}
                                hint={!dueDate && suggestedDue ? t('dueFromTerms', {date: suggestedDue}) : undefined} />
                        </Col>
                        <Col sm={6}>
                            <TextField control={control} name="reference_no" label={selfBilled ? t('referenceNo') : t('ourReference')} maxLength={255} disabled={readOnly}
                                placeholder={record ? undefined : t('autoGenerated')} />
                        </Col>
                        <ExchangeRateField control={control} pricing={pricing} savedRate={record?.exchange_rate} readOnly={readOnly} />
                        {needsLocation && (
                            <Col sm={6}>
                                <SelectField control={control} name="warehouse_id" label={t('receiveInto')} options={locationOptions} numeric required placeholder="" disabled={readOnly}
                                    hint={t('billLocationHint')} />
                            </Col>
                        )}
                        <DimensionFields control={control} readOnly={readOnly} />
                    </Row>
                </DocCard>
            </DocPair>

            {(rows.length > 0 || (!direct && !selfBilled && !record)) && (
                <DocCard title={t('receivedGoods')} hint={readOnly ? undefined : t('receivedGoodsHint')} flush
                    actions={!readOnly && rows.length > 0 && (
                        <ButtonGroup size="sm">
                            <Button variant="outline-primary" onClick={() => rows.forEach((row, i) => setValue(`grn.${i}.quantity`, row.open, {shouldValidate: true}))}>{t('billAll')}</Button>
                            <Button variant="outline-secondary" onClick={() => rows.forEach((_, i) => setValue(`grn.${i}.quantity`, 0, {shouldValidate: true}))}>{t('clearAll')}</Button>
                        </ButtonGroup>
                    )}>
                    {rows.length === 0 ? <LinesNote>{supplierId ? t('nothingToBill') : t('pickSupplierFirst')}</LinesNote> : (
                        <div className="table-responsive">
                            <Table className="mb-0 sales-lines">
                                <thead className="table-light">
                                    <tr>
                                        <th className="doc-line-no">#</th>
                                        <th style={{width: 170}}>{t('grnNo')}</th>
                                        <th style={{minWidth: 220}}>{t('item')}</th>
                                        <th className="text-end" style={{width: 100}}>{t('toBill')}</th>
                                        <th className="text-end" style={{width: 130}}>{t('thisBill')}</th>
                                        <th className="text-end" style={{width: 140}}>{pricing.taxIncluded ? t('priceInclTax') : t('price')}</th>
                                        <th className="text-end" style={{width: 120}}>{t('amount')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, index) => {
                                        const taking = (Number(grn?.[index]?.quantity) || 0) > 0;
                                        return (
                                            <tr key={row.goods_receipt_item_id} className={taking ? "" : "opacity-75"}>
                                                <td className="doc-line-no">{index + 1}</td>
                                                <td>
                                                    <div className="fw-semibold text-dark text-nowrap">{row.grn_reference_no}</div>
                                                    {row.po_reference_no && <div className="small text-muted">{row.po_reference_no}</div>}
                                                </td>
                                                <td>
                                                    <div className="fw-semibold text-dark">{row.item_code}</div>
                                                    <div className="small text-muted">{row.description}</div>
                                                </td>
                                                <td className="text-end">{formatDecimal(row.open)} <span className="small text-muted">{row.item?.uom}</span></td>
                                                <td>
                                                    <LineNumberInput control={control} name={`grn.${index}.quantity`} min={0} disabled={readOnly}
                                                        validate={(v) => v < 0 ? t('valueMustNotBeNegative') : v > row.open + 0.00005 ? t('maxAvailable', {qty: formatQuantity(row.open)}) : true} />
                                                </td>
                                                <td>
                                                    <LineNumberInput control={control} name={`grn.${index}.unit_price`} min={0} disabled={readOnly}
                                                        validate={(v) => v >= 0 || t('valueMustNotBeNegative')} />
                                                    {taking && Math.abs((Number(grn?.[index]?.unit_price) || 0) - defaultPrice(row, pricing.taxIncluded)) > 0.00005 && (
                                                        <div className="sales-line-meta text-end text-warning">{t('orderedAt', {price: formatDecimal(defaultPrice(row, pricing.taxIncluded))})}</div>
                                                    )}
                                                </td>
                                                <td className="text-end sales-line-amount">{formatDecimal(pricing.totals.lines[index]?.line_total ?? 0)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </div>
                    )}
                    {!readOnly && rows.length > 0 && <LinesNote>{t('billingLines', {count: billing})}</LinesNote>}
                </DocCard>
            )}

            <DocCard title={rows.length > 0 || !(direct || selfBilled || record) ? t('otherItems') : t('lineItems')} hint={t('billItemLinesHint')} flush>
                {(lines ?? []).length > 0 ? (
                    <SalesLinesTable control={control} setValue={setValue} items={pricing.items} byId={pricing.byId} priceList={pricing.priceList}
                        defaultDiscount={0} showDiscount={false} noOptionsKey="noPurchasableItems" taxIncluded={pricing.taxIncluded}
                        lineTotals={directTotals} readOnly={readOnly} totals={totalsPanel} />
                ) : (
                    <>
                        <LinesNote>{t('noOtherItems')}</LinesNote>
                        <LinesFooter
                            actions={!readOnly && (
                                <Button variant="outline-primary" onClick={() => append({...EMPTY_PURCHASE_LINE})}><Plus size={15} className="me-1" />{t('addLine')}</Button>
                            )}
                            totals={totalsPanel}
                        />
                    </>
                )}
            </DocCard>

            {selfBilled && <SelfBilledEinvoiceSection transType="self_billed_invoice" supplierId={supplierId} transId={record?.id} />}

            <DocCard title={t('notes')}>
                <TextAreaField control={control} name="remarks" label={t('remarks')} rows={3} disabled={readOnly} />
            </DocCard>
        </SettingsFormPage>
    );
}
