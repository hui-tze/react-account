import {ReactNode, useMemo} from "react";
import {Alert, Col, Row} from "react-bootstrap";
import {AlertTriangle, DollarSign, FileText, List, MessageSquare, User} from "react-feather";
import {useWatch} from "react-hook-form";
import {useRequestForm} from "@/hooks/use-request-handler";
import {CustomerTransDocument} from "@/apis/models/sales-document";
import {DirectDeliveryRequest} from "@/apis/requests/delivery-note-api";
import {useGetStockOnHand} from "@/apis/requests/inventory-movement-api";
import {TextAreaField, TextField} from "@/components/FormField/FormFields";
import SettingsFormPage from "@/views/Settings/shared/SettingsFormPage";
import {applyServerErrors, today} from "@/views/Inventory/shared/document";
import {formatDecimal} from "@/views/Inventory/shared/options";
import {blankToNull} from "@/views/Settings/Organization/Profile/profile-form";
import {useSmartTranslation} from "@/hooks/use-translation";
import {PartySection} from "../shared/PartySection";
import {DocCard, DocTotal} from "../shared/DocCard";
import {SalesLinesTable} from "../shared/SalesLinesTable";
import {TotalsPanel} from "../shared/TotalsPanel";
import {DeliverySection} from "../shared/DeliverySection";
import {ExchangeRateField} from "../shared/ExchangeRateField";
import {useDocumentPricing} from "../shared/useDocumentPricing";
import {EMPTY_DELIVERY_ADDRESS, EMPTY_LINE} from "../shared/sales-form";

type DirectDeliveryFormProps = {
    record?: CustomerTransDocument,
    backTo: string,
    onSubmit: (data: DirectDeliveryRequest) => Promise<void>,
    onSuccess?: () => Promise<void>,
    banner?: ReactNode,
};

function toValues(record?: CustomerTransDocument): DirectDeliveryRequest {
    return {
        reference_no: record?.reference_no ?? "",
        sales_order_id: null,
        customer_id: record?.customer_id ?? null,
        branch_id: record?.branch_id ?? null,
        sales_type_id: record?.sales_type_id ?? null,
        payment_term_id: record?.payment_term_id ?? null,
        sales_person_id: record?.sales_person_id ?? null,
        exchange_rate: record && Number(record.exchange_rate) !== 1 ? Number(record.exchange_rate) : null,
        trans_date: record?.trans_date ?? today(),
        inventory_location_id: record?.inventory_location_id ?? null,
        shipping_company_id: record?.shipping_company_id ?? null,
        customer_ref: record?.customer_ref ?? "",
        deliver_to: record?.deliver_to ?? "",
        contact_no: record?.contact_no ?? "",
        remarks: record?.remarks ?? "",
        delivery_address: {...EMPTY_DELIVERY_ADDRESS, ...(record?.delivery_address ?? {})},
        lines: record?.lines?.map(l => ({item_id: l.item_id, description: l.description, quantity: Number(l.quantity), unit_price: Number(l.unit_price), discount_percent: Number(l.discount_percent)}))
            ?? [{...EMPTY_LINE}],
    };
}

/**
 * Goods shipped without a sales order (e.g. a walk-in collection to be invoiced later).
 * Stock leaves the chosen location and cost of sales is posted; editable until invoiced.
 */
export function DirectDeliveryForm({record, backTo, onSubmit, onSuccess, banner}: DirectDeliveryFormProps) {
    const {t} = useSmartTranslation();
    const readOnly = !!record && record.state !== "uninvoiced";

    const {control, setValue, getValues, setError, submitting, handleSubmitRequest} = useRequestForm<DirectDeliveryRequest>({
        formOptions: {defaultValues: toValues(record)},
    });
    const [date, lines, locationId] = useWatch({control, name: ["trans_date", "lines", "inventory_location_id"]});
    const pricing = useDocumentPricing(control, date, lines, record?.tax_included);
    const {data: onHand} = useGetStockOnHand(locationId);

    // stock items asked for beyond what the location holds (this note's own earlier quantities count as available)
    const shortages = useMemo(() => {
        if (!locationId || !onHand) {
            return [];
        }
        const own = new Map<number, number>();
        if (record && record.inventory_location_id === locationId) {
            (record.lines ?? []).forEach(l => own.set(l.item_id, (own.get(l.item_id) ?? 0) + Number(l.quantity)));
        }
        const wanted = new Map<number, number>();
        (lines ?? []).forEach(l => {
            const item = l.item_id ? pricing.byId.get(l.item_id) : undefined;
            if (item && ["stock", "manufactured"].includes(item.item_type)) {
                wanted.set(item.id, (wanted.get(item.id) ?? 0) + (Number(l.quantity) || 0));
            }
        });
        return [...wanted.entries()]
            .map(([itemId, qty]) => ({item: pricing.byId.get(itemId)!, qty, available: Number(onHand[itemId] ?? 0) + (own.get(itemId) ?? 0)}))
            .filter(row => row.qty > row.available + 0.00005);
    }, [lines, locationId, onHand, record, pricing.byId]);

    const submit = async (values: DirectDeliveryRequest) => {
        try {
            await onSubmit({
                ...values,
                reference_no: values.reference_no.trim(),
                customer_ref: blankToNull(values.customer_ref),
                deliver_to: blankToNull(values.deliver_to),
                contact_no: blankToNull(values.contact_no),
                remarks: blankToNull(values.remarks),
                lines: values.lines.map(l => ({item_id: l.item_id, description: (l.description ?? "").trim(), quantity: l.quantity, unit_price: l.unit_price, discount_percent: l.discount_percent ?? 0})),
            });
        } catch (e) {
            applyServerErrors(e, setError, ["reference_no", "customer_id", "branch_id", "trans_date", "inventory_location_id", "exchange_rate", "lines", "accounts"]);
            throw e;
        }
    };

    return (
        <SettingsFormPage onSubmit={handleSubmitRequest({request: submit, onSuccess})} submitting={submitting} isEditing={!!record}
            backTo={backTo} readOnly={readOnly} submitLabel={record ? undefined : t('processDelivery')}
            stickyActions actionsSummary={<DocTotal label={t('total')} amount={pricing.totals.grand_total} currencyCode={pricing.currency?.code} />}>
            {banner}

            <Row className="g-3">
                <Col xl={7}>
                    <DocCard icon={User} title={t('customer')} className="h-100 mb-0">
                        <PartySection control={control} setValue={setValue} getValues={getValues} creditCheck="order" saved={record ?? undefined} readOnly={readOnly} />
                    </DocCard>
                </Col>
                <Col xl={5}>
                    <DocCard icon={FileText} title={t('documentDetails')} hint={record ? undefined : t('directDeliveryHint')} className="h-100 mb-0">
                        <Row className="gx-3">
                            <Col sm={6}>
                                <TextField control={control} name="reference_no" label={t('referenceNo')} maxLength={255} disabled={readOnly} placeholder={record ? undefined : t('autoGenerated')} />
                            </Col>
                            <Col sm={6}>
                                <TextField control={control} name="trans_date" label={t('deliveryDate')} type="date" required disabled={readOnly} />
                            </Col>
                            <Col sm={6}>
                                <TextField control={control} name="customer_ref" label={t('customerPoNo')} maxLength={255} disabled={readOnly} />
                            </Col>
                            <ExchangeRateField control={control} pricing={pricing} savedRate={record?.exchange_rate} readOnly={readOnly} />
                        </Row>
                    </DocCard>
                </Col>
            </Row>

            <DocCard icon={List} title={t('itemsToDeliver')} hint={pricing.taxIncluded ? t('pricesIncludeTax') : undefined} className="mt-3">
                <SalesLinesTable control={control} setValue={setValue} items={pricing.items} byId={pricing.byId} priceList={pricing.priceList}
                    defaultDiscount={pricing.defaultDiscount} taxIncluded={pricing.taxIncluded} lineTotals={pricing.totals.lines} readOnly={readOnly} />
                {shortages.length > 0 && !readOnly && (
                    <Alert variant="warning" className="py-2 small mt-3 mb-0">
                        <AlertTriangle size={14} className="me-1" />
                        {shortages.map(s => t('stockShortage', {code: s.item.code, available: formatDecimal(s.available), qty: formatDecimal(s.qty)})).join(" · ")}
                    </Alert>
                )}
            </DocCard>

            <Row className="g-3">
                <Col lg={7}>
                    <DeliverySection control={control} locationRequired showEmail={false} readOnly={readOnly} />
                    <DocCard icon={MessageSquare} title={t('notes')} className="mb-0">
                        <TextAreaField control={control} name="remarks" label={t('remarksPrinted')} rows={2} disabled={readOnly} />
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
