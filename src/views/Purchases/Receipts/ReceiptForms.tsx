import {ReactNode, useEffect, useMemo} from "react";
import {formatQuantity, formatDate} from "@/utils/display-format";
import {Button, ButtonGroup, Col, Row, Table} from "react-bootstrap";
import {useWatch} from "react-hook-form";
import {Link} from "@/components/Access/Guarded";
import {useRequestForm} from "@/hooks/use-request-handler";
import {GoodsReceiptDocument, PurchaseOrderDocument} from "@/apis/models/purchase-document";
import {GoodsReceiptRequest, PurchaseLineRequest, purchaseOrderApi} from "@/apis/requests/purchase-api";
import {useGetInventoryLocationOptions} from "@/apis/requests/inventory-location-api";
import {SelectField, TextAreaField, TextField} from "@/components/FormField/FormFields";
import SettingsFormPage from "@/views/Settings/shared/SettingsFormPage";
import {applyServerErrors, LineNumberInput, today} from "@/views/Inventory/shared/document";
import {formatDecimal} from "@/views/Inventory/shared/options";
import {blankToNull} from "@/views/Settings/Organization/Profile/profile-form";
import {useSmartTranslation} from "@/hooks/use-translation";
import {SalesLinesTable} from "@/views/Sales/shared/SalesLinesTable";
import {TotalsPanel} from "@/views/Sales/shared/TotalsPanel";
import {DocCard, DocPair, DocTotal} from "@/views/Sales/shared/DocCard";
import {ExchangeRateField} from "@/views/Sales/shared/ExchangeRateField";
import {EntryChecks, LinesNote, lineChecks, totalDetails, useErrorCheck} from "@/views/Sales/shared/EntryLayout";
import {SupplierSection, useSupplierChecks} from "../shared/SupplierSection";
import {usePurchasePricing} from "../shared/usePurchasePricing";
import {EMPTY_PURCHASE_LINE, linesToPayload} from "../shared/purchase-form";
import {DimensionFields} from "@/views/Dimensions/shared/DimensionFields";
import type {DimensionTag} from "@/apis/models/dimension";
import {RECEIPTS_PATH} from "../purchases-menu";

type ReceiptFormProps = {
    record?: GoodsReceiptDocument,
    backTo: string,
    onSubmit: (data: GoodsReceiptRequest) => Promise<void>,
    onSuccess?: () => Promise<void>,
    banner?: ReactNode,
};

/** Against an order or direct — the switch at the top of a new receipt. */
export function ReceiptModeSwitch({direct}: {direct: boolean}) {
    const {t} = useSmartTranslation();

    return (
        <ButtonGroup className="mb-3">
            <Link to={`${RECEIPTS_PATH}/create`} className={`btn btn-sm ${direct ? "btn-outline-primary" : "btn-primary"}`}>{t('againstPurchaseOrder')}</Link>
            <Link to={`${RECEIPTS_PATH}/create?direct=1`} className={`btn btn-sm ${direct ? "btn-primary" : "btn-outline-primary"}`}>{t('directReceipt')}</Link>
        </ButtonGroup>
    );
}

function useLocationOptions(selected?: number | null) {
    const {data: locations} = useGetInventoryLocationOptions();
    return (locations ?? [])
        .filter(l => l.status === "active" || l.id === selected)
        .map(l => ({value: l.id, label: `${l.code} - ${l.name}`}));
}

type OrderReceiptValues = {
    reference_no: string,
    supplier_id: number | null,
    tax_included: boolean | null,
    purchase_order_id: number | null,
    receipt_date: string,
    warehouse_id: number | null,
    exchange_rate: number | null,
    remarks: string,
    dimensions: DimensionTag[],
    // to receive per order line, in the order the rows are shown
    lines: {purchase_order_item_id: number, quantity: number | null}[],
};

type ReceiptRow = {
    purchase_order_item_id: number,
    code: string,
    description: string,
    uom: string | null,
    ordered: number,
    // received by other receipts
    before: number,
    // most this receipt can take
    available: number,
};

/** Rows of an order still to receive (new receipt), or the receipt's own lines (edit). */
function receiptRows(order: PurchaseOrderDocument | undefined, record: GoodsReceiptDocument | undefined): ReceiptRow[] {
    if (record) {
        return (record.lines ?? []).map(line => ({
            purchase_order_item_id: line.purchase_order_item_id,
            code: line.item_code,
            description: line.description,
            uom: line.item?.uom ?? null,
            ordered: line.ordered,
            before: line.received_on_order - line.quantity,
            available: line.ordered - line.received_on_order + line.quantity,
        }));
    }
    return (order?.details ?? [])
        .map(line => ({
            purchase_order_item_id: line.id,
            code: line.item_code,
            description: line.description,
            uom: line.uom || null,
            ordered: Number(line.quantity),
            before: Number(line.received_qty),
            available: Math.max(0, Number(line.quantity) - Number(line.received_qty)),
        }))
        .filter(row => row.available > 0);
}

/** Goods arriving against a purchase order: pick the order, receive part or all of each line. */
export function OrderReceiptForm({record, order: givenOrder, backTo, onSubmit, onSuccess, banner}: ReceiptFormProps & {order?: PurchaseOrderDocument}) {
    const {t} = useSmartTranslation();
    const readOnly = !!record && record.status !== "active";

    const {control, setValue, getValues, setError, submitting, handleSubmitRequest} = useRequestForm<OrderReceiptValues>({
        formOptions: {
            defaultValues: {
                reference_no: record?.reference_no ?? "",
                supplier_id: record?.supplier_id ?? givenOrder?.supplier_id ?? null,
                tax_included: null,
                purchase_order_id: record?.purchase_order_id ?? givenOrder?.id ?? null,
                receipt_date: record?.receipt_date ?? today(),
                warehouse_id: record?.warehouse_id ?? givenOrder?.warehouse_id ?? null,
                exchange_rate: record && Number(record.exchange_rate) !== 1 ? Number(record.exchange_rate) : null,
                remarks: record?.remarks ?? "",
                // a new receipt starts from the order's values
                dimensions: record?.dimensions ?? givenOrder?.dimensions ?? [],
                lines: [],
            },
        },
    });

    const [supplierId, orderId, receiptDate, lines] = useWatch({control, name: ["supplier_id", "purchase_order_id", "receipt_date", "lines"]});
    const pricing = usePurchasePricing(control, receiptDate, []);
    const {data: openOrders} = purchaseOrderApi.useOpen(record ? null : supplierId);
    const {data: loadedOrder} = purchaseOrderApi.useGetOne(!record && orderId && orderId !== givenOrder?.id ? orderId : null, {revalidateOnFocus: false});
    const order = record ? undefined : (orderId === givenOrder?.id ? givenOrder : loadedOrder);
    const rows = useMemo(() => receiptRows(order, record), [order, record]);
    const locationOptions = useLocationOptions(record?.warehouse_id);

    // a picked order fills the rows with what is still to receive, into its location
    useEffect(() => {
        if (record) {
            setValue("lines", (record.lines ?? []).map(line => ({purchase_order_item_id: line.purchase_order_item_id, quantity: line.quantity})));
            return;
        }
        setValue("lines", rows.map(row => ({purchase_order_item_id: row.purchase_order_item_id, quantity: row.available})));
        if (order?.warehouse_id && !getValues("warehouse_id")) {
            setValue("warehouse_id", order.warehouse_id);
        }
        if (order?.dimensions?.length) {
            setValue("dimensions", order.dimensions);
        }
    }, [rows, record, order, setValue, getValues]);

    const orderOptions = (openOrders ?? []).map(o => ({value: o.id, label: `${o.reference_no} · ${formatDate(o.order_date)}`}));
    const receiving = (lines ?? []).reduce((total, line) => total + (Number(line?.quantity) || 0), 0);

    const submit = async (values: OrderReceiptValues) => {
        if (receiving <= 0) {
            setError("lines", {type: "manual", message: t('receiveAtLeastOne')});
            throw new Error(t('receiveAtLeastOne'));
        }
        try {
            await onSubmit({
                reference_no: values.reference_no.trim(),
                purchase_order_id: values.purchase_order_id,
                receipt_date: values.receipt_date,
                warehouse_id: values.warehouse_id,
                exchange_rate: values.exchange_rate,
                remarks: blankToNull(values.remarks),
                dimensions: values.dimensions,
                lines: values.lines.filter(line => (Number(line.quantity) || 0) > 0),
            });
        } catch (e) {
            applyServerErrors(e, setError, ["reference_no", "purchase_order_id", "receipt_date", "warehouse_id", "exchange_rate", "dimensions", "lines", "accounts", "stock"]);
            throw e;
        }
    };

    const supplierCheck = useSupplierChecks(control);
    const errorCheck = useErrorCheck(control);
    const receivingLines = rows.filter((_, i) => (Number(lines?.[i]?.quantity) || 0) > 0).length;

    return (
        <SettingsFormPage onSubmit={handleSubmitRequest({request: submit, onSuccess})} submitting={submitting} isEditing={!!record}
            backTo={backTo} readOnly={readOnly} submitLabel={record ? undefined : t('saveReceipt')} stickyActions documentLayout
            actionsSummary={<DocTotal label={t('quantityReceived')} amount={receiving} details={[t('lineCount', {count: receivingLines})]} />}>
            {!record && <ReceiptModeSwitch direct={false} />}
            {banner}
            {!readOnly && (
                <EntryChecks
                    issues={[
                        errorCheck,
                        ...supplierCheck.issues,
                        supplierId && !orderId && {text: t('checkPickPurchaseOrder'), tone: "info" as const},
                        orderId && rows.length > 0 && receivingLines === 0 && {text: t('receiveAtLeastOne'), tone: "info" as const},
                    ]}
                    ready={[...supplierCheck.ready, t('lineCount', {count: receivingLines})]}
                />
            )}

            <DocPair>
                <DocCard title={t('supplierAndOrder')}>
                    <SupplierSection control={control} setValue={setValue} getValues={getValues} readOnly={readOnly} lockSupplier={!!record || !!givenOrder} showTaxIncluded={false}
                        onPicked={() => setValue("purchase_order_id", null)}>
                        <Col md={6}>
                            {record || givenOrder ? (
                                <>
                                    <div className="doc-field-caption">{t('purchaseOrder')}</div>
                                    <div className="fw-semibold text-dark mb-3">{record?.purchase_order?.reference_no ?? givenOrder?.reference_no}</div>
                                </>
                            ) : (
                                <SelectField control={control} name="purchase_order_id" label={t('purchaseOrder')} options={orderOptions} numeric required placeholder=""
                                    hint={supplierId && openOrders && !openOrders.length ? t('noOpenPurchaseOrders') : undefined} />
                            )}
                        </Col>
                    </SupplierSection>
                </DocCard>

                <DocCard title={t('receiptDetails')}>
                    <Row className="gx-4">
                        <Col sm={6}>
                            <TextField control={control} name="receipt_date" label={t('receiptDate')} type="date" required disabled={readOnly} />
                        </Col>
                        <Col sm={6}>
                            <SelectField control={control} name="warehouse_id" label={t('receiveInto')} options={locationOptions} numeric required placeholder="" disabled={readOnly} />
                        </Col>
                        <Col sm={6}>
                            <TextField control={control} name="reference_no" label={t('grnNo')} maxLength={255} disabled={readOnly} placeholder={record ? undefined : t('autoGenerated')} />
                        </Col>
                        <ExchangeRateField control={control} pricing={pricing} savedRate={record?.exchange_rate} readOnly={readOnly} />
                        <DimensionFields control={control} readOnly={readOnly} />
                    </Row>
                </DocCard>
            </DocPair>

            <DocCard title={t('itemsReceived')} hint={readOnly ? undefined : t('itemsReceivedHint')} flush
                actions={!readOnly && rows.length > 0 && (
                    <ButtonGroup size="sm">
                        <Button variant="outline-primary" onClick={() => rows.forEach((row, i) => setValue(`lines.${i}.quantity`, row.available, {shouldValidate: true}))}>{t('receiveAll')}</Button>
                        <Button variant="outline-secondary" onClick={() => rows.forEach((_, i) => setValue(`lines.${i}.quantity`, 0, {shouldValidate: true}))}>{t('clearAll')}</Button>
                    </ButtonGroup>
                )}>
                {rows.length === 0 ? <LinesNote>{orderId ? t('orderFullyReceived') : t('pickPurchaseOrderFirst')}</LinesNote> : (
                    <div className="table-responsive">
                        <Table className="mb-0 sales-lines">
                            <thead className="table-light">
                                <tr>
                                    <th className="doc-line-no">#</th>
                                    <th style={{minWidth: 240}}>{t('item')}</th>
                                    <th className="text-end" style={{width: 110}}>{t('ordered')}</th>
                                    <th className="text-end" style={{width: 130}}>{t('receivedBefore')}</th>
                                    <th className="text-end" style={{width: 150}}>{t('thisReceipt')}</th>
                                    <th style={{width: 70}}>{t('unit')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, index) => (
                                    <tr key={row.purchase_order_item_id}>
                                        <td className="doc-line-no">{index + 1}</td>
                                        <td>
                                            <div className="fw-semibold text-dark">{row.code}</div>
                                            <div className="small text-muted">{row.description}</div>
                                        </td>
                                        <td className="text-end">{formatDecimal(row.ordered)}</td>
                                        <td className="text-end text-muted">{formatDecimal(row.before)}</td>
                                        <td>
                                            <LineNumberInput control={control} name={`lines.${index}.quantity`} min={0} disabled={readOnly}
                                                validate={(v) => v < 0 ? t('valueMustNotBeNegative') : v > row.available + 0.00005 ? t('maxAvailable', {qty: formatQuantity(row.available)}) : true} />
                                        </td>
                                        <td className="text-muted">{row.uom ?? "-"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                )}
            </DocCard>

            <DocCard title={t('notes')}>
                <TextAreaField control={control} name="remarks" label={t('remarks')} rows={3} disabled={readOnly} />
            </DocCard>
        </SettingsFormPage>
    );
}

type DirectReceiptValues = {
    reference_no: string,
    supplier_id: number | null,
    tax_included: boolean | null,
    receipt_date: string,
    warehouse_id: number | null,
    exchange_rate: number | null,
    remarks: string,
    dimensions: DimensionTag[],
    lines: PurchaseLineRequest[],
};

/** Goods received without a purchase order: items, quantities and their cost. */
export function DirectReceiptForm({record, backTo, onSubmit, onSuccess, banner}: ReceiptFormProps) {
    const {t} = useSmartTranslation();
    const readOnly = !!record && record.status !== "active";

    const {control, setValue, getValues, setError, submitting, handleSubmitRequest} = useRequestForm<DirectReceiptValues>({
        formOptions: {
            defaultValues: {
                reference_no: record?.reference_no ?? "",
                supplier_id: record?.supplier_id ?? null,
                tax_included: record?.purchase_order?.tax_included ?? null,
                receipt_date: record?.receipt_date ?? today(),
                warehouse_id: record?.warehouse_id ?? null,
                exchange_rate: record && Number(record.exchange_rate) !== 1 ? Number(record.exchange_rate) : null,
                remarks: record?.remarks ?? "",
                dimensions: record?.dimensions ?? [],
                lines: record
                    ? (record.lines ?? []).map(line => ({item_id: line.item_id, description: line.description, quantity: line.quantity, unit_price: line.unit_price, discount_percent: 0}))
                    : [{...EMPTY_PURCHASE_LINE}],
            },
        },
    });

    const [receiptDate, lines] = useWatch({control, name: ["receipt_date", "lines"]});
    const pricing = usePurchasePricing(control, receiptDate, lines);
    const locationOptions = useLocationOptions(record?.warehouse_id);

    const submit = async (values: DirectReceiptValues) => {
        try {
            await onSubmit({
                reference_no: values.reference_no.trim(),
                purchase_order_id: null,
                supplier_id: values.supplier_id,
                tax_included: values.tax_included ?? pricing.taxIncluded,
                receipt_date: values.receipt_date,
                warehouse_id: values.warehouse_id,
                exchange_rate: values.exchange_rate,
                remarks: blankToNull(values.remarks),
                dimensions: values.dimensions,
                lines: linesToPayload(values.lines).map(({item_id, description, quantity, unit_price}) => ({item_id, description, quantity, unit_price})),
            });
        } catch (e) {
            applyServerErrors(e, setError, ["reference_no", "supplier_id", "receipt_date", "warehouse_id", "exchange_rate", "dimensions", "lines", "accounts", "stock"]);
            throw e;
        }
    };

    const supplierCheck = useSupplierChecks(control);
    const lineCheck = lineChecks(lines, t);
    const errorCheck = useErrorCheck(control);

    return (
        <SettingsFormPage onSubmit={handleSubmitRequest({request: submit, onSuccess})} submitting={submitting} isEditing={!!record}
            backTo={backTo} readOnly={readOnly} submitLabel={record ? undefined : t('saveReceipt')} stickyActions documentLayout
            actionsSummary={<DocTotal label={t('total')} amount={pricing.totals.grand_total} currencyCode={pricing.currency?.code}
                details={totalDetails(pricing.totals, lineCheck.filled, t)} />}>
            {!record && <ReceiptModeSwitch direct />}
            {banner}
            {!readOnly && <EntryChecks issues={[errorCheck, ...supplierCheck.issues, ...lineCheck.issues]} ready={[...supplierCheck.ready, t('lineCount', {count: lineCheck.filled})]} />}

            <DocPair>
                <DocCard title={t('supplier')} hint={t('directReceiptHint')}>
                    <SupplierSection control={control} setValue={setValue} getValues={getValues} readOnly={readOnly} lockSupplier={!!record}>
                        <Col md={6}>
                            <SelectField control={control} name="warehouse_id" label={t('receiveInto')} options={locationOptions} numeric required placeholder="" disabled={readOnly} />
                        </Col>
                    </SupplierSection>
                </DocCard>

                <DocCard title={t('receiptDetails')}>
                    <Row className="gx-4">
                        <Col sm={6}>
                            <TextField control={control} name="receipt_date" label={t('receiptDate')} type="date" required disabled={readOnly} />
                        </Col>
                        <Col sm={6}>
                            <TextField control={control} name="reference_no" label={t('grnNo')} maxLength={255} disabled={readOnly} placeholder={record ? undefined : t('autoGenerated')} />
                        </Col>
                        <ExchangeRateField control={control} pricing={pricing} savedRate={record?.exchange_rate} readOnly={readOnly} />
                        <DimensionFields control={control} readOnly={readOnly} />
                    </Row>
                </DocCard>
            </DocPair>

            <DocCard title={t('itemsReceived')} hint={pricing.taxIncluded ? t('pricesIncludeTax') : t('purchasePriceHint')} flush>
                <SalesLinesTable control={control} setValue={setValue} items={pricing.items} byId={pricing.byId} priceList={pricing.priceList}
                    defaultDiscount={0} showDiscount={false} noOptionsKey="noPurchasableItems" taxIncluded={pricing.taxIncluded}
                    lineTotals={pricing.totals.lines} readOnly={readOnly}
                    totals={<TotalsPanel totals={pricing.totals} taxIncluded={pricing.taxIncluded} currencyCode={pricing.currency?.code} />} />
            </DocCard>

            <DocCard title={t('notes')}>
                <TextAreaField control={control} name="remarks" label={t('remarks')} rows={3} disabled={readOnly} />
            </DocCard>
        </SettingsFormPage>
    );
}
