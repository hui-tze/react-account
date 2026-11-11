import {useMemo} from "react";
import {Col, Form, Row} from "react-bootstrap";
import {Package, Send} from "react-feather";
import {Controller, useFormState, useWatch} from "react-hook-form";
import {useRequestForm} from "@/hooks/use-request-handler";
import {POS_PAYMENT_METHODS, PosDocument} from "@/apis/models/pos";
import {PosCreditNoteRequest} from "@/apis/requests/pos-api";
import {useGetPosSettingOptions} from "@/apis/requests/pos-setting-api";
import {useGetSalesTaxContext} from "@/apis/requests/sales-lookup-api";
import {SelectField, TextAreaField, TextField} from "@/components/FormField/FormFields";
import SettingsFormPage from "@/views/Settings/shared/SettingsFormPage";
import {applyServerErrors, today} from "@/views/Inventory/shared/document";
import {formatDecimal} from "@/views/Inventory/shared/options";
import {formatDate} from "@/utils/display-format";
import {blankToNull} from "@/views/Settings/Organization/Profile/profile-form";
import {useSmartTranslation} from "@/hooks/use-translation";
import {DimensionFields} from "@/views/Dimensions/shared/DimensionFields";
import {EinvoiceReadiness} from "@/views/Einvoice/shared/EinvoiceReadiness";
import {useSellableItems} from "../shared/items";
import {calculateSalesTotals} from "../shared/tax";
import {TotalsPanel} from "../shared/TotalsPanel";
import {SourceLinesTable, SourceRow} from "../shared/billing";
import {DocCard, DocPair, DocTotal, FactsGrid} from "../shared/DocCard";
import {EntryChecks, LinesNote, totalDetails, useErrorCheck} from "../shared/EntryLayout";
import {consolidationDeadline} from "./pos-ui";

type PosCreditNoteFormProps = {
    receipt: PosDocument,
    backTo: string,
    onSubmit: (data: PosCreditNoteRequest) => Promise<void>,
    onSuccess?: () => Promise<void>,
};

/** Refund all or part of a POS receipt at the counter. */
export function PosCreditNoteForm({receipt, backTo, onSubmit, onSuccess}: PosCreditNoteFormProps) {
    const {t} = useSmartTranslation();
    const {byId} = useSellableItems();
    const {data: posList} = useGetPosSettingOptions();
    const receiptPos = posList?.find(p => p.id === receipt.pos_setting_id);
    const {data: taxContext} = useGetSalesTaxContext(receipt.branch_id, receiptPos?.tax_group_id);
    const consolidated = receipt.einvoice_treatment === "consolidated";

    const rows: SourceRow[] = useMemo(() => (receipt.lines ?? []).map(line => ({
        id: line.id,
        code: line.item_code,
        description: line.description,
        uom: line.item?.uom ?? null,
        sourceQty: Number(line.quantity),
        before: Number(line.quantity_done),
        available: Number(line.quantity) - Number(line.quantity_done),
        unitPrice: Number(line.unit_price),
        discountPercent: Number(line.discount_percent),
    })).filter(row => row.available > 0), [receipt]);

    // stock items can go back on the shelf; services can't
    const hasStock = (receipt.lines ?? []).some(l => ["stock", "manufactured"].includes(l.item?.item_type ?? ""));

    const {control, setError, submitting, handleSubmitRequest} = useRequestForm<PosCreditNoteRequest>({
        formOptions: {
            defaultValues: {
                source_trans_id: receipt.id,
                pos_setting_id: receipt.pos_setting_id,
                reference_no: "",
                trans_date: today(),
                credit_type: hasStock ? "return" : null,
                payment_method: receipt.payment_method ?? "cash",
                customer_ref: "",
                remarks: "",
                einvoice_submission_mode: consolidated ? null : (receipt.einvoice_submission_mode as "S" | "I" | "H" | null) ?? "I",
                dimensions: receipt.dimensions ?? [],
                // nothing is refunded until the user says so
                lines: rows.map(row => ({src_id: row.id, quantity: 0})),
            },
        },
    });

    const [lines, date] = useWatch({control, name: ["lines", "trans_date"]});
    const {errors} = useFormState({control});
    const linesError = (errors.lines as {message?: string} | undefined)?.message;
    const errorCheck = useErrorCheck(control);
    const refundedCount = (lines ?? []).filter(l => (Number(l.quantity) || 0) > 0).length;

    const totals = useMemo(() => calculateSalesTotals(
        taxContext?.tax_types ?? [],
        receipt.tax_included,
        rows.map((row, index) => {
            const rule = taxContext?.item_tax_categories[String(byId.get(receipt.lines?.find(l => l.id === row.id)?.item_id ?? 0)?.item_tax_category_id ?? "")];
            return {quantity: Number(lines?.[index]?.quantity) || 0, unit_price: row.unitPrice, discount_percent: row.discountPercent, exempt: rule?.exempt, exempt_tax_type_ids: rule?.exempt_tax_type_ids};
        }),
    ), [taxContext, receipt, rows, lines, byId]);

    const submit = async (values: PosCreditNoteRequest) => {
        const refunded = values.lines.filter(l => (Number(l.quantity) || 0) > 0);
        if (refunded.length === 0) {
            setError("lines", {type: "manual", message: t('posEnterQuantityToRefund')});
            throw new Error(t('posEnterQuantityToRefund'));
        }
        try {
            await onSubmit({...values, reference_no: values.reference_no.trim(), customer_ref: blankToNull(values.customer_ref), remarks: blankToNull(values.remarks), lines: refunded});
        } catch (e) {
            applyServerErrors(e, setError, ["reference_no", "trans_date", "pos_setting_id", "dimensions", "accounts", "einvoice"]);
            throw e;
        }
    };

    const posOptions = (posList ?? []).filter(p => p.status === "active" || p.id === receipt.pos_setting_id).map(p => ({value: p.id, label: p.name}));

    return (
        <SettingsFormPage onSubmit={handleSubmitRequest({request: submit, onSuccess})} submitting={submitting} isEditing={false}
            backTo={backTo} submitLabel={t('posSaveRefund')} stickyActions documentLayout
            actionsSummary={<DocTotal label={t('posRefundTotal')} amount={totals.grand_total} currencyCode={receipt.currency?.code} details={totalDetails(totals, refundedCount, t)} />}>
            <EntryChecks
                issues={[errorCheck, refundedCount === 0 && {text: t('posEnterQuantityToRefund'), tone: "info" as const}]}
                ready={[t('posRefundingReceipt', {ref: receipt.reference_no}), t('lineCount', {count: refundedCount})]}
            />

            <DocPair>
                <DocCard title={t('posRefunding')}>
                    <FactsGrid facts={[
                        {label: t('docType_pos_receipt'), value: receipt.reference_no},
                        {label: t('date'), value: receipt.trans_date},
                        {label: t('posBuyer'), value: receipt.buyer_name},
                        {label: t('total'), value: `${formatDecimal(receipt.grand_total)} ${receipt.currency?.code ?? ""}`},
                    ]} />
                </DocCard>

                <DocCard title={t('posRefundDetails')}>
                    <Row className="gx-4">
                        <Col sm={6}>
                            <TextField control={control} name="trans_date" label={t('date')} type="date" required />
                        </Col>
                        <Col sm={6}>
                            <SelectField control={control} name="pos_setting_id" label={t('posRefundFrom')} options={posOptions} numeric required placeholder="" />
                        </Col>
                        <Col sm={6}>
                            <SelectField control={control} name="payment_method" label={t('posRefundMethod')} placeholder=""
                                options={POS_PAYMENT_METHODS.map(m => ({value: m, label: t(`posMethod_${m}`)}))} />
                        </Col>
                        <Col sm={6}>
                            <TextField control={control} name="reference_no" label={t('referenceNo')} maxLength={255} placeholder={t('autoGenerated')} />
                        </Col>
                        <DimensionFields control={control} />
                    </Row>
                </DocCard>
            </DocPair>

            <DocCard title={t('posItemsToRefund')} flush>
                {linesError && <LinesNote tone="danger">{linesError}</LinesNote>}
                <SourceLinesTable control={control} rows={rows} lineTotals={totals.lines} taxIncluded={receipt.tax_included}
                    sourceLabel={t('posSold')} beforeLabel={t('posRefundedBefore')} thisLabel={t('posThisRefund')}
                    totals={<TotalsPanel totals={totals} taxIncluded={receipt.tax_included} currencyCode={receipt.currency?.code} totalLabel={t('posRefundTotal')} />} />
            </DocCard>

            <DocPair>
                {hasStock ? (
                    <DocCard icon={Package} title={t('returnedGoods')}>
                        <Controller control={control} name="credit_type" render={({field}) => (
                            <div>
                                <Form.Check type="radio" id="pos-credit-return" checked={field.value === "return"} onChange={() => field.onChange("return")}
                                    label={<><span className="fw-semibold">{t('creditTypeReturn')}</span><div className="small text-muted">{t('posReturnHint', {location: receipt.inventory_location?.name ?? ""})}</div></>} />
                                <Form.Check type="radio" id="pos-credit-write-off" className="mt-2" checked={field.value === "write_off"} onChange={() => field.onChange("write_off")}
                                    label={<><span className="fw-semibold">{t('creditTypeWriteOff')}</span><div className="small text-muted">{t('creditTypeWriteOffHint')}</div></>} />
                            </div>
                        )} />
                    </DocCard>
                ) : <div />}

                <DocCard icon={Send} title={t('myInvois')}>
                    {consolidated ? (
                        <div className="small text-muted">
                            {t('posRefundConsolidatedNote', {period: (date ?? today()).slice(0, 7), deadline: formatDate(consolidationDeadline(date ?? today()))})}
                        </div>
                    ) : (
                        <Row className="gx-4">
                            <Col md={6}>
                                <SelectField control={control} name="einvoice_submission_mode" label={t('submissionMode')} placeholder=""
                                    options={[{value: "S", label: t('submissionMode_S')}, {value: "I", label: t('submissionMode_I')}, {value: "H", label: t('submissionMode_H')}]} />
                            </Col>
                            <Col md={6}>
                                <div className="doc-field-caption">{t('status')}</div>
                                <EinvoiceReadiness transType="pos_credit_note" partyId={receipt.customer_id} />
                            </Col>
                        </Row>
                    )}
                </DocCard>
            </DocPair>

            <DocCard title={t('reasonForCredit')}>
                <TextAreaField control={control} name="remarks" label={t('printedOnCreditNote')} rows={2} placeholder={t('reasonForCreditPlaceholder')} />
            </DocCard>
        </SettingsFormPage>
    );
}
