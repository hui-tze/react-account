import {ReactNode, useMemo, useState} from "react";
import {Button, Col, Form, Row} from "react-bootstrap";
import {useWatch} from "react-hook-form";
import {useRequestForm} from "@/hooks/use-request-handler";
import {PurchaseOrderDocument} from "@/apis/models/purchase-document";
import {PurchaseOrderRequest} from "@/apis/requests/purchase-api";
import {useGetInventoryLocationOptions} from "@/apis/requests/inventory-location-api";
import {SelectField, TextAreaField, TextField} from "@/components/FormField/FormFields";
import SettingsFormPage from "@/views/Settings/shared/SettingsFormPage";
import {applyServerErrors} from "@/views/Inventory/shared/document";
import {formatDecimal} from "@/views/Inventory/shared/options";
import {useSmartTranslation} from "@/hooks/use-translation";
import {LineLock, SalesLinesTable} from "@/views/Sales/shared/SalesLinesTable";
import {TotalsPanel} from "@/views/Sales/shared/TotalsPanel";
import {DocCard, DocPair, DocTotal} from "@/views/Sales/shared/DocCard";
import {ExchangeRateField} from "@/views/Sales/shared/ExchangeRateField";
import {EMPTY_DELIVERY_ADDRESS} from "@/views/Sales/shared/sales-form";
import {sameAddress} from "@/views/Sales/shared/DeliverySection";
import {EntryChecks, lineChecks, totalDetails, useErrorCheck} from "@/views/Sales/shared/EntryLayout";
import {SupplierSection, useSupplierChecks} from "../shared/SupplierSection";
import {usePurchasePricing} from "../shared/usePurchasePricing";
import {blankOrderValues, orderToValues, toOrderPayload} from "../shared/purchase-form";

type PurchaseOrderFormProps = {
    record?: PurchaseOrderDocument,
    backTo: string,
    onSubmit: (data: PurchaseOrderRequest) => Promise<void>,
    onSuccess?: () => Promise<void>,
    banner?: ReactNode,
};

/** Create / edit a purchase order. Lines with goods received keep their item and can't go below what came in. */
export function PurchaseOrderForm({record, backTo, onSubmit, onSuccess, banner}: PurchaseOrderFormProps) {
    const {t} = useSmartTranslation();
    const readOnly = !!record && record.status !== "active";
    const {data: locations} = useGetInventoryLocationOptions();

    const {control, setValue, setError, submitting, handleSubmitRequest} = useRequestForm<PurchaseOrderRequest>({
        formOptions: {defaultValues: record ? orderToValues(record) : blankOrderValues()},
    });

    const [orderDate, lines, address] = useWatch({control, name: ["order_date", "lines", "delivery_address"]});
    // no address of its own: the supplier delivers to the receiving warehouse; unticking opens the address card
    const [differs, setDiffers] = useState(false);
    const toWarehouse = !differs && !address?.recipient_name && sameAddress(address, EMPTY_DELIVERY_ADDRESS);
    const setToWarehouse = (value: boolean) => {
        setDiffers(!value);
        if (value) {
            setValue("delivery_address", {...EMPTY_DELIVERY_ADDRESS});
        }
    };
    const pricing = usePurchasePricing(control, orderDate, lines);

    // saved lines with goods received
    const locks = useMemo(() => {
        const map = new Map<number, LineLock>();
        (record?.details ?? []).forEach(line => {
            const received = Number(line.received_qty);
            if (received > 0) {
                map.set(line.id, {minQuantity: received, label: t('receivedQty', {qty: formatDecimal(received)}), locked: true});
            }
        });
        return map;
    }, [record, t]);

    const locationOptions = (locations ?? [])
        .filter(l => l.status === "active" || l.id === record?.warehouse_id)
        .map(l => ({value: l.id, label: `${l.code} - ${l.name}`}));

    const submit = async (values: PurchaseOrderRequest) => {
        try {
            await onSubmit(toOrderPayload({...values, tax_included: values.tax_included ?? pricing.taxIncluded}));
        } catch (e) {
            applyServerErrors(e, setError, ["reference_no", "supplier_id", "order_date", "expected_delivery", "warehouse_id", "exchange_rate", "lines"]);
            throw e;
        }
    };

    const supplierCheck = useSupplierChecks(control);
    const lineCheck = lineChecks(lines, t);
    const errorCheck = useErrorCheck(control);

    return (
        <SettingsFormPage
            onSubmit={handleSubmitRequest({request: submit, onSuccess})}
            submitting={submitting}
            isEditing={!!record}
            backTo={backTo}
            readOnly={readOnly}
            submitLabel={record ? undefined : t('savePurchaseOrder')}
            stickyActions
            documentLayout
            actionsSummary={<DocTotal label={t('orderTotal')} amount={pricing.totals.grand_total} currencyCode={pricing.currency?.code}
                details={totalDetails(pricing.totals, lineCheck.filled, t)} />}
        >
            {banner}
            {!readOnly && <EntryChecks issues={[errorCheck, ...supplierCheck.issues, ...lineCheck.issues]} ready={[...supplierCheck.ready, t('lineCount', {count: lineCheck.filled})]} />}

            <DocPair>
                <DocCard title={t('whoYouAreBuyingFrom')}>
                    <SupplierSection control={control} setValue={setValue} readOnly={readOnly} lockSupplier={!!record}>
                        <Col md={6}>
                            <SelectField control={control} name="warehouse_id" label={t('receiveInto')} options={locationOptions} numeric required placeholder="" disabled={readOnly} />
                        </Col>
                    </SupplierSection>
                    <div className="doc-card-foot">
                        <Form.Check type="checkbox" id="deliver-to-warehouse" className="mb-1" label={t('deliverToWarehouse')}
                            checked={toWarehouse} disabled={readOnly} onChange={(e) => setToWarehouse(e.target.checked)} />
                        <div className="small text-muted">{t('deliverToWarehouseHint')}</div>
                        {!toWarehouse && <div className="small fw-semibold text-primary mt-1">{t('deliveryAddressBelow')} ↓</div>}
                    </div>
                </DocCard>

                <DocCard title={t('orderDetails')}>
                    <Row className="gx-4">
                        <Col sm={6}>
                            <TextField control={control} name="order_date" label={t('orderDate')} type="date" required disabled={readOnly} />
                        </Col>
                        <Col sm={6}>
                            <TextField control={control} name="expected_delivery" label={t('expectedDelivery')} type="date" disabled={readOnly}
                                rules={{validate: (v) => !v || String(v) >= String(orderDate) || t('dateBeforeDocument')}} />
                        </Col>
                        <Col sm={6}>
                            <TextField control={control} name="reference_no" label={t('referenceNo')} maxLength={255} disabled={readOnly}
                                placeholder={record ? undefined : t('autoGenerated')} />
                        </Col>
                        <ExchangeRateField control={control} pricing={pricing} savedRate={record?.exchange_rate} readOnly={readOnly} />
                    </Row>
                </DocCard>
            </DocPair>

            {!toWarehouse && (
                <DocCard sub title={t('deliveryAddress')} hint={t('deliveryAddressHint')}
                    actions={!readOnly && <Button variant="link" size="sm" className="p-0" onClick={() => setToWarehouse(true)}>{t('useWarehouseAddress')}</Button>}>
                    <Row className="gx-4">
                        <Col sm={6}>
                            <TextField control={control} name="delivery_address.recipient_name" label={t('attention')} maxLength={255} disabled={readOnly} />
                        </Col>
                        <Col sm={12}>
                            <TextField control={control} name="delivery_address.address1" label={t('addressLine1')} disabled={readOnly} />
                        </Col>
                        <Col sm={12}>
                            <TextField control={control} name="delivery_address.address2" label={t('addressLine2')} disabled={readOnly} />
                        </Col>
                        <Col sm={6} lg={3}>
                            <TextField control={control} name="delivery_address.postcode" label={t('postcode')} maxLength={20} disabled={readOnly} />
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
                    </Row>
                </DocCard>
            )}

            <DocCard title={t('lineItems')} hint={pricing.taxIncluded ? t('pricesIncludeTax') : t('purchasePriceHint')} flush>
                <SalesLinesTable
                    control={control}
                    setValue={setValue}
                    items={pricing.items}
                    byId={pricing.byId}
                    priceList={pricing.priceList}
                    defaultDiscount={0}
                    showDiscount={false}
                    noOptionsKey="noPurchasableItems"
                    taxIncluded={pricing.taxIncluded}
                    lineTotals={pricing.totals.lines}
                    locks={locks}
                    readOnly={readOnly}
                    totals={<TotalsPanel totals={pricing.totals} taxIncluded={pricing.taxIncluded} currencyCode={pricing.currency?.code} totalLabel={t('orderTotal')} />}
                />
            </DocCard>

            <DocCard title={t('notes')}>
                <TextAreaField control={control} name="remarks" label={t('printedOnPurchaseOrder')} rows={3} disabled={readOnly} placeholder={t('printedNotePlaceholder')} />
            </DocCard>
        </SettingsFormPage>
    );
}
