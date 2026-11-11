import {ReactNode, useMemo} from "react";
import {formatQuantity} from "@/utils/display-format";
import {Col, Row} from "react-bootstrap";
import {useWatch} from "react-hook-form";
import {useRequestForm} from "@/hooks/use-request-handler";
import {SalesOrderDocument} from "@/apis/models/sales-document";
import {SalesOrderRequest} from "@/apis/requests/sales-order-api";
import {TextAreaField, TextField} from "@/components/FormField/FormFields";
import SettingsFormPage from "@/views/Settings/shared/SettingsFormPage";
import {applyServerErrors} from "@/views/Inventory/shared/document";
import {useSmartTranslation} from "@/hooks/use-translation";
import {LineLock, SalesLinesTable} from "../shared/SalesLinesTable";
import {TotalsPanel} from "../shared/TotalsPanel";
import {DeliveryFromFields, DeliverToBillingCheck, DeliverySection, useDeliveryAddress} from "../shared/DeliverySection";
import {PartySection, PaymentTermField, useCustomerChecks} from "../shared/PartySection";
import {EntryChecks, lineChecks, totalDetails, useErrorCheck} from "../shared/EntryLayout";
import {DocCard, DocPair, DocTotal} from "../shared/DocCard";
import {ExchangeRateField} from "../shared/ExchangeRateField";
import {useDocumentPricing} from "../shared/useDocumentPricing";
import {blankOrderValues, orderToValues, toOrderPayload} from "../shared/sales-form";
import {DimensionFields} from "@/views/Dimensions/shared/DimensionFields";

export type SalesOrderKind = "quotation" | "order";

type SalesOrderFormProps = {
    kind: SalesOrderKind,
    record?: SalesOrderDocument,
    // pre-filled values for a new document (e.g. an order converted from a quotation)
    initialValues?: SalesOrderRequest,
    backTo: string,
    onSubmit: (data: SalesOrderRequest) => Promise<void>,
    onSuccess?: () => Promise<void>,
    // status strip shown above a saved document
    banner?: ReactNode,
};

/** Create / edit form shared by quotations and sales orders. */
export function SalesOrderForm({kind, record, initialValues, backTo, onSubmit, onSuccess, banner}: SalesOrderFormProps) {
    const {t} = useSmartTranslation();
    const readOnly = !!record && record.status !== "active";

    const {control, setValue, getValues, setError, submitting, handleSubmitRequest} = useRequestForm<SalesOrderRequest>({
        formOptions: {defaultValues: initialValues ?? (record ? orderToValues(record) : blankOrderValues(kind))},
    });

    const [orderDate, lines] = useWatch({control, name: ["order_date", "lines"]});
    const pricing = useDocumentPricing(control, orderDate, lines, record?.tax_included);
    const party = useCustomerChecks(control, {creditCheck: kind === "order" ? "order" : "none", total: pricing.totals.grand_total, savedTotal: Number(record?.grand_total ?? 0)});
    const lineCheck = lineChecks(lines, t);
    const errorCheck = useErrorCheck(control);
    const delivery = useDeliveryAddress(control, setValue);

    // saved lines that were partly delivered (orders) or converted (quotations)
    const locks = useMemo(() => {
        const map = new Map<number, LineLock>();
        (record?.lines ?? []).forEach(line => {
            if (kind === "order") {
                const done = Math.max(Number(line.quantity_delivered), Number(line.quantity_invoiced));
                if (done > 0) {
                    map.set(line.id, {minQuantity: done, label: t('deliveredQty', {qty: formatQuantity(line.quantity_delivered)}), locked: true});
                }
            } else if (line.quantity_converted > 0) {
                map.set(line.id, {minQuantity: 0, label: t('orderedQty', {qty: formatQuantity(line.quantity_converted)}), locked: true});
            }
        });
        return map;
    }, [record, kind, t]);

    const submit = async (values: SalesOrderRequest) => {
        try {
            await onSubmit(toOrderPayload(values));
        } catch (e) {
            applyServerErrors(e, setError, ["reference_no", "customer_id", "branch_id", "order_date", "valid_until", "requested_delivery_date", "exchange_rate", "dimensions", "lines"]);
            throw e;
        }
    };

    const totalLabel = kind === "quotation" ? t('quotationTotal') : t('orderTotal');

    return (
        <SettingsFormPage
            onSubmit={handleSubmitRequest({request: submit, onSuccess})}
            submitting={submitting}
            isEditing={!!record}
            backTo={backTo}
            readOnly={readOnly}
            submitLabel={record ? undefined : (kind === "quotation" ? t('saveQuotation') : t('saveSalesOrder'))}
            stickyActions
            documentLayout
            actionsSummary={<DocTotal label={totalLabel} amount={pricing.totals.grand_total} currencyCode={pricing.currency?.code}
                details={totalDetails(pricing.totals, lineCheck.filled, t)} />}
        >
            {banner}
            {!readOnly && <EntryChecks issues={[errorCheck, ...party.issues, ...lineCheck.issues]} ready={[...party.ready, t('lineCount', {count: lineCheck.filled})]} />}

            <DocPair>
                <DocCard title={kind === "quotation" ? t('whoIsTheQuote') : t('whoIsOrdering')}>
                    <PartySection control={control} setValue={setValue} getValues={getValues} creditCheck={kind === "order" ? "order" : "none"}
                        saved={record} readOnly={readOnly} lockCustomer={locks.size > 0} />
                    <DeliverToBillingCheck delivery={delivery} readOnly={readOnly} />
                </DocCard>

                <DocCard title={kind === "quotation" ? t('quotationDetails') : t('orderDetails')}>
                    <Row className="gx-4">
                        <Col sm={12}>
                            <PaymentTermField control={control} savedId={record?.payment_term_id} readOnly={readOnly} />
                        </Col>
                        <Col sm={6}>
                            <TextField control={control} name="order_date" label={kind === "quotation" ? t('quotationDate') : t('orderDate')} type="date" required disabled={readOnly} />
                        </Col>
                        <Col sm={6}>
                            {kind === "quotation" ? (
                                <TextField control={control} name="valid_until" label={t('validUntil')} type="date" disabled={readOnly}
                                    rules={{validate: (v) => !v || String(v) >= String(getValues("order_date")) || t('dateBeforeDocument')}} />
                            ) : (
                                <TextField control={control} name="requested_delivery_date" label={t('requiredBy')} type="date" disabled={readOnly}
                                    rules={{validate: (v) => !v || String(v) >= String(getValues("order_date")) || t('dateBeforeDocument')}} />
                            )}
                        </Col>
                        <Col sm={6}>
                            <TextField control={control} name="customer_po_no" label={t('customerPoNo')} maxLength={100} disabled={readOnly} placeholder={t('optional')} />
                        </Col>
                        <Col sm={6}>
                            <TextField control={control} name="reference_no" label={t('referenceNo')} maxLength={255} disabled={readOnly}
                                placeholder={record ? undefined : t('autoGenerated')} />
                        </Col>
                        <DeliveryFromFields control={control} locationRequired={kind === "order"} readOnly={readOnly} />
                        <ExchangeRateField control={control} pricing={pricing} savedRate={record?.exchange_rate} readOnly={readOnly} />
                        {/* orders don't post, so required dimensions can wait for the delivery / invoice */}
                        <DimensionFields control={control} readOnly={readOnly} enforceRequired={false} />
                    </Row>
                </DocCard>
            </DocPair>

            <DeliverySection control={control} delivery={delivery} readOnly={readOnly} />

            <DocCard title={t('lineItems')} hint={pricing.taxIncluded ? t('pricesIncludeTax') : undefined} flush>
                <SalesLinesTable
                    control={control}
                    setValue={setValue}
                    items={pricing.items}
                    byId={pricing.byId}
                    priceList={pricing.priceList}
                    defaultDiscount={pricing.defaultDiscount}
                    taxIncluded={pricing.taxIncluded}
                    lineTotals={pricing.totals.lines}
                    locks={locks}
                    readOnly={readOnly}
                    totals={<TotalsPanel totals={pricing.totals} taxIncluded={pricing.taxIncluded} currencyCode={pricing.currency?.code} totalLabel={totalLabel} />}
                />
            </DocCard>

            <DocCard title={t('notes')}>
                <Row className="gx-4">
                    <Col md={6}>
                        <TextAreaField control={control} name="remarks" label={kind === "quotation" ? t('printedOnQuotation') : t('printedOnOrder')} rows={3} disabled={readOnly}
                            placeholder={t('printedNotePlaceholder')} />
                    </Col>
                    <Col md={6}>
                        <TextAreaField control={control} name="internal_notes" label={t('internalNoteNotPrinted')} rows={3} disabled={readOnly}
                            placeholder={t('internalNotePlaceholder')} />
                    </Col>
                </Row>
            </DocCard>
        </SettingsFormPage>
    );
}
