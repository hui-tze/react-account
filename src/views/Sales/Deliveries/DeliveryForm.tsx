import {ReactNode, useMemo, useState} from "react";
import {formatQuantity} from "@/utils/display-format";
import {Button, Col, Form, Row, Table} from "react-bootstrap";
import {AlertTriangle} from "react-feather";
import {useFormState, useWatch} from "react-hook-form";
import {useRequestForm} from "@/hooks/use-request-handler";
import {CustomerTransDocument, SalesOrderDocument} from "@/apis/models/sales-document";
import {DeliveryNoteRequest} from "@/apis/requests/delivery-note-api";
import {useGetInventoryLocationOptions} from "@/apis/requests/inventory-location-api";
import {useGetStockOnHand} from "@/apis/requests/inventory-movement-api";
import {useGetSalesTaxContext, useGetShippingCompanyOptions} from "@/apis/requests/sales-lookup-api";
import {SelectField, SwitchField, TextAreaField, TextField} from "@/components/FormField/FormFields";
import SettingsFormPage from "@/views/Settings/shared/SettingsFormPage";
import {applyServerErrors, LineNumberInput, today} from "@/views/Inventory/shared/document";
import {formatDecimal} from "@/views/Inventory/shared/options";
import {blankToNull} from "@/views/Settings/Organization/Profile/profile-form";
import {useSmartTranslation} from "@/hooks/use-translation";
import {useSellableItems} from "../shared/items";
import {calculateSalesTotals} from "../shared/tax";
import {TotalsPanel} from "../shared/TotalsPanel";
import {DocCard, DocPair, DocTotal, FactsGrid} from "../shared/DocCard";
import {EntryChecks, LinesFooter, LinesNote, totalDetails, useErrorCheck} from "../shared/EntryLayout";
import {EMPTY_DELIVERY_ADDRESS} from "../shared/sales-form";
import {addressLine, sameAddress} from "../shared/DeliverySection";
import {DimensionFields} from "@/views/Dimensions/shared/DimensionFields";

type DeliveryFormProps = {
    // the order being delivered
    order: SalesOrderDocument,
    record?: CustomerTransDocument,
    backTo: string,
    onSubmit: (data: DeliveryNoteRequest) => Promise<void>,
    onSuccess?: () => Promise<void>,
    banner?: ReactNode,
};

type DeliveryRow = {
    orderLineId: number,
    itemId: number,
    code: string,
    description: string,
    uom: string | null,
    ordered: number,
    // delivered by other notes
    deliveredBefore: number,
    // most this note can ship
    available: number,
    unitPrice: number,
    discountPercent: number,
    holdsStock: boolean,
};

/** Ship (part of) a sales order: one row per order line with something left to deliver. */
export function DeliveryForm({order, record, backTo, onSubmit, onSuccess, banner}: DeliveryFormProps) {
    const {t} = useSmartTranslation();
    const readOnly = !!record && (record.state !== "uninvoiced");
    const {byId} = useSellableItems();
    const {data: locations} = useGetInventoryLocationOptions();
    const {data: shippers} = useGetShippingCompanyOptions();
    const {data: taxContext} = useGetSalesTaxContext(order.branch_id);

    // what this note already ships per order line (edit)
    const mine = useMemo(() => new Map((record?.lines ?? []).map(l => [l.sales_order_detail_id ?? 0, Number(l.quantity)])), [record]);

    const rows: DeliveryRow[] = useMemo(() => (order.lines ?? [])
        .map(line => {
            const own = mine.get(line.id) ?? 0;
            const deliveredBefore = Number(line.quantity_delivered) - own;
            return {
                orderLineId: line.id,
                itemId: line.item_id,
                code: line.item_code,
                description: line.description,
                uom: line.item?.uom ?? null,
                ordered: Number(line.quantity),
                deliveredBefore,
                available: Number(line.quantity) - deliveredBefore,
                unitPrice: Number(line.unit_price),
                discountPercent: Number(line.discount_percent),
                holdsStock: ["stock", "manufactured"].includes(byId.get(line.item_id)?.item_type ?? "stock"),
            };
        })
        .filter(row => row.available > 0 || mine.has(row.orderLineId)), [order, mine, byId]);

    const {control, setValue, setError, submitting, handleSubmitRequest} = useRequestForm<DeliveryNoteRequest>({
        formOptions: {
            defaultValues: {
                reference_no: record?.reference_no ?? "",
                sales_order_id: order.id,
                trans_date: record?.trans_date ?? today(),
                inventory_location_id: record?.inventory_location_id ?? order.inventory_location_id,
                shipping_company_id: record?.shipping_company_id ?? order.shipping_company_id,
                customer_ref: record?.customer_ref ?? order.customer_ref ?? "",
                deliver_to: record?.deliver_to ?? order.deliver_to ?? "",
                contact_no: record?.contact_no ?? order.contact_no ?? "",
                remarks: record?.remarks ?? "",
                close_order_balance: false,
                delivery_address: {...EMPTY_DELIVERY_ADDRESS, ...(record?.delivery_address ?? order.delivery_address ?? {})},
                // a new note carries the order's dimensions
                dimensions: (record ? record.dimensions : order.dimensions) ?? [],
                lines: rows.map(row => ({
                    sales_order_detail_id: row.orderLineId,
                    // a new note offers everything outstanding; an edit shows what it ships
                    quantity: record ? (mine.get(row.orderLineId) ?? 0) : row.available,
                })),
            },
        },
    });

    const [lines, locationId, address] = useWatch({control, name: ["lines", "inventory_location_id", "delivery_address"]});
    const {errors} = useFormState({control});
    // a whole-array error (no quantity anywhere) rather than a per-line one
    const linesError = (errors.lines as {message?: string} | undefined)?.message;
    const {data: onHand} = useGetStockOnHand(locationId);

    // goods go to the order's delivery address unless the user unticks it (then the address card opens)
    const orderAddress = {...EMPTY_DELIVERY_ADDRESS, ...(order.delivery_address ?? {})};
    const [differs, setDiffers] = useState(false);
    const sameAsOrder = !differs && sameAddress(address, orderAddress);
    const showAddress = !sameAsOrder || ["deliver_to", "delivery_address", "contact_no"].some(field => (errors as Record<string, unknown>)[field]);
    const setSameAsOrder = (value: boolean) => {
        setDiffers(!value);
        setValue("deliver_to", value ? order.deliver_to ?? "" : "");
        setValue("contact_no", value ? order.contact_no ?? "" : "");
        setValue("delivery_address", value ? orderAddress : {...EMPTY_DELIVERY_ADDRESS});
    };

    const totals = useMemo(() => calculateSalesTotals(
        taxContext?.tax_types ?? [],
        order.tax_included,
        rows.map((row, index) => {
            const rule = taxContext?.item_tax_categories[String(byId.get(row.itemId)?.item_tax_category_id ?? "")];
            return {
                quantity: Number(lines?.[index]?.quantity) || 0,
                unit_price: row.unitPrice,
                discount_percent: row.discountPercent,
                exempt: rule?.exempt,
                exempt_tax_type_ids: rule?.exempt_tax_type_ids,
            };
        }),
    ), [taxContext, order.tax_included, rows, lines, byId]);

    const partial = rows.some((row, index) => (Number(lines?.[index]?.quantity) || 0) < row.available);

    const submit = async (values: DeliveryNoteRequest) => {
        const shipping = values.lines.filter(l => (Number(l.quantity) || 0) > 0);
        if (shipping.length === 0) {
            setError("lines", {type: "manual", message: t('enterQuantityToDeliver')});
            throw new Error(t('enterQuantityToDeliver'));
        }
        try {
            await onSubmit({
                ...values,
                reference_no: values.reference_no.trim(),
                customer_ref: blankToNull(values.customer_ref),
                deliver_to: blankToNull(values.deliver_to),
                contact_no: blankToNull(values.contact_no),
                remarks: blankToNull(values.remarks),
                lines: shipping,
            });
        } catch (e) {
            // server errors name lines by their position among the shipped ones; show them on the form
            applyServerErrors(e, setError, ["reference_no", "trans_date", "inventory_location_id", "sales_order_id", "dimensions"]);
            throw e;
        }
    };

    const locationOptions = (locations ?? []).filter(l => l.status === "active" || l.id === record?.inventory_location_id)
        .map(l => ({value: l.id, label: `${l.code} - ${l.name}`}));
    const shipperOptions = (shippers ?? []).map(s => ({value: s.id, label: s.name}));

    // what the location holds for a row (this note's own earlier quantities count as available); null: not a stock item
    const stockFor = (row: (typeof rows)[number]) => row.holdsStock && locationId
        ? Number(onHand?.[row.itemId] ?? 0) + (record && record.inventory_location_id === locationId ? (mine.get(row.orderLineId) ?? 0) : 0)
        : null;
    const qtyOf = (index: number) => Number(lines?.[index]?.quantity) || 0;
    const shipping = rows.filter((_, index) => qtyOf(index) > 0).length;
    const errorCheck = useErrorCheck(control);
    const shortages = rows.map((row, index) => {
        const stock = stockFor(row);
        return stock !== null && qtyOf(index) > stock + 0.00005
            ? {text: t('stockShortage', {code: row.code, available: formatQuantity(stock), qty: formatQuantity(qtyOf(index))}), tone: "warning" as const}
            : null;
    }).filter((check): check is {text: string, tone: "warning"} => check !== null);

    return (
        <SettingsFormPage
            onSubmit={handleSubmitRequest({request: submit, onSuccess})}
            submitting={submitting}
            isEditing={!!record}
            backTo={backTo}
            readOnly={readOnly}
            submitLabel={record ? undefined : t('processDelivery')}
            stickyActions
            documentLayout
            actionsSummary={<DocTotal label={t('total')} amount={totals.grand_total} currencyCode={order.currency?.code} details={totalDetails(totals, shipping, t)} />}
        >
            {banner}
            {!readOnly && (
                <EntryChecks
                    issues={[errorCheck, shipping === 0 && {text: t('checkEnterQuantityToDeliver'), tone: "info" as const}, ...shortages]}
                    ready={[t('deliveringOrder', {ref: order.reference_no}), t('lineCount', {count: shipping})]}
                />
            )}

            <DocPair>
                <DocCard title={t('salesOrder')}>
                    <FactsGrid facts={[
                        {label: t('referenceNo'), value: order.reference_no},
                        {label: t('customer'), value: order.branch && order.branch.name !== order.customer?.name ? `${order.customer?.name} · ${order.branch.name}` : order.customer?.name},
                        {label: t('currency'), value: order.currency?.code},
                        {label: t('customerPoNo'), value: order.customer_po_no},
                        {label: t('requiredBy'), value: order.requested_delivery_date},
                    ]} />
                    <div className="doc-card-foot">
                        <Form.Check type="checkbox" id="deliver-to-order" className="mb-1" label={t('deliverToOrderAddress')}
                            checked={sameAsOrder} disabled={readOnly} onChange={(e) => setSameAsOrder(e.target.checked)} />
                        <div className="small text-muted">{t('orderDeliveryAddress')}: {[order.deliver_to, addressLine(orderAddress)].filter(Boolean).join(" — ") || t('noDeliveryDetails')}</div>
                        {showAddress && <div className="small fw-semibold text-primary mt-1">{t('deliveryAddressBelow')} ↓</div>}
                    </div>
                </DocCard>

                <DocCard title={t('deliveryDetails')}>
                    <Row className="gx-4">
                        <Col sm={6}>
                            <TextField control={control} name="trans_date" label={t('deliveryDate')} type="date" required disabled={readOnly} />
                        </Col>
                        <Col sm={6}>
                            <TextField control={control} name="reference_no" label={t('referenceNo')} maxLength={255} disabled={readOnly} placeholder={record ? undefined : t('autoGenerated')} />
                        </Col>
                        <Col sm={6}>
                            <SelectField control={control} name="inventory_location_id" label={t('deliverFrom')} options={locationOptions} numeric required placeholder="" disabled={readOnly} />
                        </Col>
                        <Col sm={6}>
                            <SelectField control={control} name="shipping_company_id" label={t('shippingCompany')} options={shipperOptions} numeric placeholder="" disabled={readOnly} />
                        </Col>
                        <Col sm={6}>
                            <TextField control={control} name="customer_ref" label={t('customerRef')} maxLength={255} disabled={readOnly} placeholder={t('optional')} />
                        </Col>
                        <DimensionFields control={control} readOnly={readOnly} />
                    </Row>
                </DocCard>
            </DocPair>

            {showAddress && (
                <DocCard sub title={t('deliveryAddress')} hint={t('deliveryAddressHint')}
                    actions={!readOnly && <Button variant="link" size="sm" className="p-0" onClick={() => setSameAsOrder(true)}>{t('useOrderAddress')}</Button>}>
                    <Row className="gx-4">
                        <Col md={6}>
                            <TextField control={control} name="deliver_to" label={t('deliverTo')} maxLength={255} disabled={readOnly} placeholder={t('siteOrCompanyName')} />
                        </Col>
                        <Col md={6}>
                            <TextField control={control} name="delivery_address.recipient_name" label={t('contactPerson')} maxLength={255} disabled={readOnly} placeholder={t('nameOnSite')} />
                        </Col>
                        <Col md={6}>
                            <TextField control={control} name="delivery_address.address1" label={t('addressLine1')} disabled={readOnly} />
                        </Col>
                        <Col md={6}>
                            <TextField control={control} name="delivery_address.address2" label={t('addressLine2')} disabled={readOnly} placeholder={t('optional')} />
                        </Col>
                        <Col sm={6} lg={3}>
                            <TextField control={control} name="delivery_address.postcode" label={t('postcode')} disabled={readOnly} />
                        </Col>
                        <Col sm={6} lg={3}>
                            <TextField control={control} name="delivery_address.city" label={t('city')} disabled={readOnly} />
                        </Col>
                        <Col sm={6} lg={3}>
                            <TextField control={control} name="delivery_address.state" label={t('state')} disabled={readOnly} />
                        </Col>
                        <Col sm={6} lg={3}>
                            <TextField control={control} name="delivery_address.country" label={t('country')} disabled={readOnly} />
                        </Col>
                        <Col md={6}>
                            <TextField control={control} name="contact_no" label={t('contactNo')} maxLength={50} disabled={readOnly} />
                        </Col>
                    </Row>
                </DocCard>
            )}

            <DocCard title={t('itemsToDeliver')} hint={readOnly ? undefined : t('itemsToDeliverHint')} flush>
                {linesError && <LinesNote tone="danger">{linesError}</LinesNote>}
                <div className="table-responsive">
                    <Table className="mb-0 sales-lines">
                        <thead className="table-light">
                            <tr>
                                <th className="doc-line-no">#</th>
                                <th style={{minWidth: 240}}>{t('item')}</th>
                                <th className="text-end" style={{width: 100}}>{t('ordered')}</th>
                                <th className="text-end" style={{width: 120}}>{t('deliveredBefore')}</th>
                                <th className="text-end" style={{width: 100}}>{t('onHand')}</th>
                                <th className="text-end" style={{width: 140}}>{t('thisDelivery')}</th>
                                <th className="text-end" style={{width: 120}}>{order.tax_included ? t('priceInclTax') : t('price')}</th>
                                <th className="text-end" style={{width: 120}}>{t('amount')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, index) => {
                                const qty = qtyOf(index);
                                const stock = stockFor(row);
                                const short = stock !== null && qty > stock;
                                return (
                                    <tr key={row.orderLineId}>
                                        <td className="doc-line-no">{index + 1}</td>
                                        <td>
                                            <div className="fw-semibold text-dark">{row.code}</div>
                                            <div className="sales-line-meta">{row.description}</div>
                                        </td>
                                        <td className="text-end sales-line-amount fw-normal">{formatDecimal(row.ordered)}</td>
                                        <td className="text-end sales-line-amount fw-normal text-muted">{formatDecimal(row.deliveredBefore)}</td>
                                        <td className={`text-end sales-line-amount ${short ? "text-danger" : "fw-normal text-muted"}`}>
                                            {stock === null ? "—" : formatQuantity(stock)}
                                            {short && <AlertTriangle size={12} className="ms-1" />}
                                        </td>
                                        <td>
                                            <LineNumberInput
                                                control={control}
                                                name={`lines.${index}.quantity`}
                                                min={0}
                                                disabled={readOnly}
                                                validate={(v) => v < 0 ? t('valueMustNotBeNegative') : v > row.available + 0.00005 ? t('maxToDeliver', {qty: formatQuantity(row.available)}) : true}
                                            />
                                            <div className="sales-line-meta text-end">{row.uom}</div>
                                        </td>
                                        <td className="text-end sales-line-amount fw-normal">
                                            {formatDecimal(row.unitPrice)}
                                            {row.discountPercent > 0 && <div className="sales-line-meta">−{formatDecimal(row.discountPercent)}%</div>}
                                        </td>
                                        <td className="text-end sales-line-amount">{formatDecimal(totals.lines[index]?.line_total ?? 0)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </div>
                <LinesFooter
                    actions={!record && partial && (
                        <SwitchField control={control} name="close_order_balance" label={t('closeOrderBalance')} hint={t('closeOrderBalanceHint')} />
                    )}
                    totals={<TotalsPanel totals={totals} taxIncluded={order.tax_included} currencyCode={order.currency?.code} />}
                />
            </DocCard>

            <DocCard title={t('notes')}>
                <TextAreaField control={control} name="remarks" label={t('printedOnDeliveryNote')} rows={3} disabled={readOnly} placeholder={t('printedNotePlaceholder')} />
            </DocCard>
        </SettingsFormPage>
    );
}
