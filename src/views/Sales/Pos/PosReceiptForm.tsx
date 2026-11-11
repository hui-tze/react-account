import {useEffect, useMemo} from "react";
import {Alert, Col, Form, Row} from "react-bootstrap";
import {CreditCard, Send, User} from "react-feather";
import {Controller, useWatch} from "react-hook-form";
import {useRequestForm} from "@/hooks/use-request-handler";
import {POS_PAYMENT_METHODS} from "@/apis/models/pos";
import {PosReceiptRequest} from "@/apis/requests/pos-api";
import {useGetPosSettingOptions} from "@/apis/requests/pos-setting-api";
import {useGetCustomerOptions} from "@/apis/requests/customer-api";
import {useGetCustomerBranches} from "@/apis/requests/customer-branch-api";
import {useGetCurrencyOptions} from "@/apis/requests/currency-api";
import {useGetSalesTypeOptions} from "@/apis/requests/sales-type-api";
import {useGetSalesPriceList, useGetSalesTaxContext} from "@/apis/requests/sales-lookup-api";
import {SelectField, TextAreaField, TextField} from "@/components/FormField/FormFields";
import SettingsFormPage from "@/views/Settings/shared/SettingsFormPage";
import {applyServerErrors, today} from "@/views/Inventory/shared/document";
import {blankToNull} from "@/views/Settings/Organization/Profile/profile-form";
import {formatDecimal} from "@/views/Inventory/shared/options";
import {formatDate} from "@/utils/display-format";
import {useSmartTranslation} from "@/hooks/use-translation";
import {DimensionFields} from "@/views/Dimensions/shared/DimensionFields";
import {EinvoiceReadiness} from "@/views/Einvoice/shared/EinvoiceReadiness";
import {useSellableItems} from "../shared/items";
import {calculateSalesTotals} from "../shared/tax";
import {TotalsPanel} from "../shared/TotalsPanel";
import {CustomerPicker} from "../shared/CustomerPicker";
import {DocCard, DocPair, DocTotal} from "../shared/DocCard";
import {EntryChecks, lineChecks, totalDetails, useErrorCheck} from "../shared/EntryLayout";
import {SalesLinesTable} from "../shared/SalesLinesTable";
import {EMPTY_LINE} from "../shared/sales-form";
import {consolidationDeadline, INDIVIDUAL_EINVOICE_ABOVE} from "./pos-ui";

type PosReceiptFormProps = {
    backTo: string,
    onSubmit: (data: PosReceiptRequest) => Promise<void>,
    onSuccess?: () => Promise<void>,
};

const SERVER_FIELDS = ["pos_setting_id", "reference_no", "trans_date", "customer_id", "sales_type_id", "tendered_amount", "dimensions", "lines", "accounts", "einvoice"];

/** A counter sale: walk-in or a customer, items, and how it was paid. */
export function PosReceiptForm({backTo, onSubmit, onSuccess}: PosReceiptFormProps) {
    const {t} = useSmartTranslation();
    const {data: posList} = useGetPosSettingOptions();
    const {data: customers} = useGetCustomerOptions();
    const {data: currencies} = useGetCurrencyOptions();
    const {data: salesTypes} = useGetSalesTypeOptions();
    const {items, byId} = useSellableItems();
    const activePos = (posList ?? []).filter(p => p.status === "active");

    const {control, setValue, getValues, setError, submitting, handleSubmitRequest} = useRequestForm<PosReceiptRequest>({
        formOptions: {
            defaultValues: {
                pos_setting_id: null,
                reference_no: "",
                trans_date: today(),
                customer_id: null,
                branch_id: null,
                payor_name: "",
                identity_no: "",
                contact_no: "",
                customer_ref: "",
                sales_type_id: null,
                payment_method: "cash",
                tendered_amount: null,
                remarks: "",
                einvoice_individual: false,
                einvoice_submission_mode: "I",
                dimensions: [],
                lines: [{...EMPTY_LINE}],
            },
        },
    });

    const [posId, customerId, salesTypeId, lines, tendered, individual, date, paymentMethod] = useWatch({
        control, name: ["pos_setting_id", "customer_id", "sales_type_id", "lines", "tendered_amount", "einvoice_individual", "trans_date", "payment_method"],
    });
    const pos = activePos.find(p => p.id === posId);

    // one counter: pick it; a POS brings its price list
    useEffect(() => {
        if (!getValues("pos_setting_id") && activePos.length === 1) {
            setValue("pos_setting_id", activePos[0].id);
        }
    }, [activePos, getValues, setValue]);
    useEffect(() => {
        if (pos?.sales_type_id) {
            setValue("sales_type_id", pos.sales_type_id);
        }
    }, [pos?.id, pos?.sales_type_id, setValue]);

    const {data: branches} = useGetCustomerBranches(customerId);
    const branch = branches?.find(b => b.status === "active");
    useEffect(() => {
        setValue("branch_id", customerId ? (branch?.id ?? null) : null);
    }, [customerId, branch?.id, setValue]);

    // walk-in sales are in the home currency (a customer in another currency is refused on save)
    const customer = customers?.find(c => c.id === customerId);
    const home = currencies?.find(c => c.code === "MYR") ?? currencies?.[0];
    const currencyId = customer?.currency_id ?? home?.id;
    const currencyCode = currencies?.find(c => c.id === currencyId)?.code;
    const salesType = salesTypes?.find(s => s.id === salesTypeId);
    const taxIncluded = !!salesType?.tax_included;
    const {data: priceList} = useGetSalesPriceList(salesTypeId, currencyId);
    const {data: taxContext} = useGetSalesTaxContext(branch?.id, pos?.tax_group_id);

    const totals = useMemo(() => calculateSalesTotals(
        taxContext?.tax_types ?? [],
        taxIncluded,
        (lines ?? []).map(line => {
            const rule = taxContext?.item_tax_categories[String(byId.get(line.item_id ?? 0)?.item_tax_category_id ?? "")];
            return {quantity: Number(line.quantity) || 0, unit_price: Number(line.unit_price) || 0, discount_percent: Number(line.discount_percent) || 0,
                exempt: rule?.exempt, exempt_tax_type_ids: rule?.exempt_tax_type_ids};
        }),
    ), [taxContext, taxIncluded, lines, byId]);

    const forcedIndividual = totals.grand_total > INDIVIDUAL_EINVOICE_ABOVE;
    const ownEinvoice = forcedIndividual || !!individual;
    const change = tendered !== null && tendered !== undefined && String(tendered) !== "" ? Number(tendered) - totals.grand_total : null;

    const submit = async (values: PosReceiptRequest) => {
        try {
            await onSubmit({
                ...values,
                reference_no: values.reference_no.trim(),
                payor_name: values.customer_id ? null : blankToNull(values.payor_name),
                identity_no: values.customer_id ? null : blankToNull(values.identity_no),
                contact_no: blankToNull(values.contact_no),
                customer_ref: blankToNull(values.customer_ref),
                remarks: blankToNull(values.remarks),
                tendered_amount: values.tendered_amount === null || String(values.tendered_amount) === "" ? null : Number(values.tendered_amount),
                einvoice_individual: ownEinvoice,
                einvoice_submission_mode: ownEinvoice ? values.einvoice_submission_mode : null,
                lines: values.lines.map(l => ({item_id: l.item_id, description: (l.description ?? "").trim(), quantity: l.quantity, unit_price: l.unit_price, discount_percent: l.discount_percent ?? 0})),
            });
        } catch (e) {
            applyServerErrors(e, setError, SERVER_FIELDS);
            throw e;
        }
    };

    const lineCheck = lineChecks(lines, t);
    const errorCheck = useErrorCheck(control);
    const posOptions = activePos.map(p => ({value: p.id, label: p.name}));
    const salesTypeOptions = (salesTypes ?? []).filter(s => s.status === "active").map(s => ({value: s.id, label: s.name}));

    return (
        <SettingsFormPage onSubmit={handleSubmitRequest({request: submit, onSuccess})} submitting={submitting} isEditing={false}
            backTo={backTo} submitLabel={t('posSaveReceipt')} stickyActions documentLayout
            actionsSummary={<DocTotal label={t('total')} amount={totals.grand_total} currencyCode={currencyCode} details={totalDetails(totals, lineCheck.filled, t)} />}>
            <EntryChecks
                issues={[
                    errorCheck,
                    posList && activePos.length === 0 ? {text: t('posNoCounters'), tone: "warning" as const} : null,
                    change !== null && change < -0.005 ? {text: t('posTenderedShort', {amount: formatDecimal(-change)}), tone: "warning" as const} : null,
                    ...lineCheck.issues,
                ]}
                ready={[pos ? t('posAtCounter', {name: pos.name}) : null, customer ? customer.name : t('posWalkIn'), t('lineCount', {count: lineCheck.filled})]}
            />

            <DocPair left={5}>
                <DocCard icon={User} title={t('posBuyer')} hint={t('posBuyerHint')}>
                    {customers && (
                        <CustomerPicker control={control} name="customer_id" customers={customers} label={t('customer')} optional placeholder={t('posWalkInPlaceholder')} />
                    )}
                    {!customerId && (
                        <Row className="gx-3">
                            <Col sm={12}>
                                <TextField control={control} name="payor_name" label={t('posBuyerName')} maxLength={255} placeholder={t('optional')} />
                            </Col>
                            <Col sm={6}>
                                <TextField control={control} name="identity_no" label={t('posIdentityNo')} maxLength={50} placeholder={t('optional')} />
                            </Col>
                            <Col sm={6}>
                                <TextField control={control} name="contact_no" label={t('contactNo')} maxLength={50} placeholder={t('optional')} />
                            </Col>
                        </Row>
                    )}
                    {customerId && customer?.tin && <div className="small text-muted">{t('tin')} {customer.tin}</div>}
                </DocCard>

                <DocCard title={t('posReceiptDetails')}>
                    <Row className="gx-4">
                        <Col sm={6}>
                            <SelectField control={control} name="pos_setting_id" label={t('posCounter')} options={posOptions} numeric required placeholder="" />
                        </Col>
                        <Col sm={6}>
                            <TextField control={control} name="trans_date" label={t('date')} type="date" required />
                        </Col>
                        <Col sm={6}>
                            <SelectField control={control} name="sales_type_id" label={t('priceList')} options={salesTypeOptions} numeric required placeholder=""
                                hint={taxIncluded ? t('pricesIncludeTax') : undefined} />
                        </Col>
                        <Col sm={6}>
                            <TextField control={control} name="reference_no" label={t('referenceNo')} maxLength={255} placeholder={t('autoGenerated')} />
                        </Col>
                        <DimensionFields control={control} />
                    </Row>
                </DocCard>
            </DocPair>

            <DocCard title={t('lineItems')} hint={pos ? t('posStockFrom') : undefined} flush>
                <SalesLinesTable control={control} setValue={setValue} items={items} byId={byId} priceList={priceList}
                    defaultDiscount={Number(customer?.default_discount ?? 0)} taxIncluded={taxIncluded} lineTotals={totals.lines}
                    totals={<TotalsPanel totals={totals} taxIncluded={taxIncluded} currencyCode={currencyCode} totalLabel={t('total')} />} />
            </DocCard>

            <DocPair>
                <DocCard icon={CreditCard} title={t('posPayment')}>
                    <Row className="gx-4">
                        <Col sm={6}>
                            <SelectField control={control} name="payment_method" label={t('posPaymentMethod')} placeholder=""
                                options={POS_PAYMENT_METHODS.map(m => ({value: m, label: t(`posMethod_${m}`)}))} />
                        </Col>
                        <Col sm={6}>
                            <TextField control={control} name="tendered_amount" label={paymentMethod === "cash" ? t('posCashReceived') : t('posAmountReceived')}
                                type="number" step="0.01" min={0} placeholder={formatDecimal(totals.grand_total)} />
                        </Col>
                        {change !== null && (
                            <Col sm={12}>
                                <div className={`fs-5 fw-bold ${change < -0.005 ? "text-danger" : "text-success"}`}>
                                    {change < -0.005 ? t('posShortBy', {amount: formatDecimal(-change)}) : t('posChange', {amount: formatDecimal(change)})}
                                </div>
                            </Col>
                        )}
                    </Row>
                </DocCard>

                <DocCard icon={Send} title={t('myInvois')} hint={t('posEinvoiceHint')}>
                    {forcedIndividual ? (
                        <Alert variant="info" className="py-2 small">{t('posOverLimit', {limit: formatDecimal(INDIVIDUAL_EINVOICE_ABOVE)})}</Alert>
                    ) : (
                        <Controller control={control} name="einvoice_individual" render={({field}) => (
                            <Form.Check type="switch" id="pos-einvoice-individual" className="mb-2" checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)}
                                label={<><span className="fw-semibold">{t('posOwnEinvoice')}</span><div className="small text-muted">{t('posOwnEinvoiceHint')}</div></>} />
                        )} />
                    )}
                    {ownEinvoice ? (
                        <Row className="gx-4">
                            <Col md={6}>
                                <SelectField control={control} name="einvoice_submission_mode" label={t('submissionMode')} placeholder=""
                                    options={[{value: "S", label: t('submissionMode_S')}, {value: "I", label: t('submissionMode_I')}, {value: "H", label: t('submissionMode_H')}]} />
                            </Col>
                            <Col md={6}>
                                <div className="doc-field-caption">{t('status')}</div>
                                <EinvoiceReadiness transType="pos_receipt" partyId={customerId} />
                                {!customerId && <div className="small text-muted">{t('posGeneralPublicTin')}</div>}
                            </Col>
                        </Row>
                    ) : (
                        <div className="small text-muted">
                            {t('posConsolidatedNote', {period: (date ?? today()).slice(0, 7), deadline: formatDate(consolidationDeadline(date ?? today()))})}
                        </div>
                    )}
                </DocCard>
            </DocPair>

            <DocCard title={t('notes')}>
                <TextAreaField control={control} name="remarks" label={t('printedOnReceipt')} rows={2} />
            </DocCard>
        </SettingsFormPage>
    );
}
