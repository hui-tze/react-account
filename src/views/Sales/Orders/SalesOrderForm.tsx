import {ReactNode, useMemo} from "react";
import {Col, Row} from "react-bootstrap";
import {useWatch} from "react-hook-form";
import {DollarSign, FileText, List, MessageSquare, User} from "react-feather";
import {useRequestForm} from "@/hooks/use-request-handler";
import {SalesOrderDocument} from "@/apis/models/sales-document";
import {SalesOrderRequest} from "@/apis/requests/sales-order-api";
import {TextAreaField, TextField} from "@/components/FormField/FormFields";
import SettingsFormPage from "@/views/Settings/shared/SettingsFormPage";
import {applyServerErrors} from "@/views/Inventory/shared/document";
import {formatDecimal} from "@/views/Inventory/shared/options";
import {useSmartTranslation} from "@/hooks/use-translation";
import {LineLock, SalesLinesTable} from "../shared/SalesLinesTable";
import {TotalsPanel} from "../shared/TotalsPanel";
import {DeliverySection} from "../shared/DeliverySection";
import {PartySection} from "../shared/PartySection";
import {DocCard, DocTotal} from "../shared/DocCard";
import {ExchangeRateField} from "../shared/ExchangeRateField";
import {useDocumentPricing} from "../shared/useDocumentPricing";
import {blankOrderValues, orderToValues, toOrderPayload} from "../shared/sales-form";

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

    // saved lines that were partly delivered (orders) or converted (quotations)
    const locks = useMemo(() => {
        const map = new Map<number, LineLock>();
        (record?.lines ?? []).forEach(line => {
            if (kind === "order") {
                const done = Math.max(Number(line.quantity_delivered), Number(line.quantity_invoiced));
                if (done > 0) {
                    map.set(line.id, {minQuantity: done, label: t('deliveredQty', {qty: formatDecimal(line.quantity_delivered)}), locked: true});
                }
            } else if (line.quantity_converted > 0) {
                map.set(line.id, {minQuantity: 0, label: t('orderedQty', {qty: formatDecimal(line.quantity_converted)}), locked: true});
            }
        });
        return map;
    }, [record, kind, t]);

    const submit = async (values: SalesOrderRequest) => {
        try {
            await onSubmit(toOrderPayload(values));
        } catch (e) {
            applyServerErrors(e, setError, ["reference_no", "customer_id", "branch_id", "order_date", "valid_until", "requested_delivery_date", "exchange_rate", "lines"]);
            throw e;
        }
    };

    return (
        <SettingsFormPage
            onSubmit={handleSubmitRequest({request: submit, onSuccess})}
            submitting={submitting}
            isEditing={!!record}
            backTo={backTo}
            readOnly={readOnly}
            submitLabel={record ? undefined : (kind === "quotation" ? t('saveQuotation') : t('saveSalesOrder'))}
            stickyActions
            actionsSummary={<DocTotal label={t('total')} amount={pricing.totals.grand_total} currencyCode={pricing.currency?.code} />}
        >
            {banner}

            <Row className="g-3">
                <Col xl={7}>
                    <DocCard icon={User} title={t('customer')} className="h-100 mb-0">
                        <PartySection control={control} setValue={setValue} getValues={getValues} creditCheck={kind === "order" ? "order" : "none"}
                            saved={record} readOnly={readOnly} lockCustomer={locks.size > 0} />
                    </DocCard>
                </Col>
                <Col xl={5}>
                    <DocCard icon={FileText} title={t('documentDetails')} className="h-100 mb-0">
                        <Row className="gx-3">
                            <Col sm={6}>
                                <TextField control={control} name="reference_no" label={t('referenceNo')} maxLength={255} disabled={readOnly}
                                    placeholder={record ? undefined : t('autoGenerated')} />
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
                                <TextField control={control} name="customer_po_no" label={t('customerPoNo')} maxLength={100} disabled={readOnly} />
                            </Col>
                            <ExchangeRateField control={control} pricing={pricing} savedRate={record?.exchange_rate} readOnly={readOnly} />
                        </Row>
                    </DocCard>
                </Col>
            </Row>

            <DocCard icon={List} title={t('items')} hint={pricing.taxIncluded ? t('pricesIncludeTax') : undefined} className="mt-3">
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
                />
            </DocCard>

            <Row className="g-3">
                <Col lg={7}>
                    <DeliverySection control={control} locationRequired={kind === "order"} readOnly={readOnly} />
                    <DocCard icon={MessageSquare} title={t('notes')} className="mb-0">
                        <TextAreaField control={control} name="remarks" label={t('remarksPrinted')} rows={2} disabled={readOnly} />
                        <TextAreaField control={control} name="internal_notes" label={t('internalNotes')} rows={2} disabled={readOnly} />
                    </DocCard>
                </Col>
                <Col lg={5}>
                    <DocCard icon={DollarSign} title={t('summary')} className="mb-0">
                        <TotalsPanel totals={pricing.totals} taxIncluded={pricing.taxIncluded} currencyCode={pricing.currency?.code} />
                    </DocCard>
                </Col>
            </Row>
        </SettingsFormPage>
    );
}
