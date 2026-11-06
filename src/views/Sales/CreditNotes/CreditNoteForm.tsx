import {useMemo} from "react";
import {Col, Row} from "react-bootstrap";
import {useFormState, useWatch} from "react-hook-form";
import {useRequestForm} from "@/hooks/use-request-handler";
import {CustomerTransDocument} from "@/apis/models/sales-document";
import {CreditNoteRequest} from "@/apis/requests/sales-billing-api";
import {useGetInventoryLocationOptions} from "@/apis/requests/inventory-location-api";
import {useGetSalesTaxContext} from "@/apis/requests/sales-lookup-api";
import {TextAreaField, TextField} from "@/components/FormField/FormFields";
import SettingsFormPage from "@/views/Settings/shared/SettingsFormPage";
import {applyServerErrors, today} from "@/views/Inventory/shared/document";
import {formatDecimal} from "@/views/Inventory/shared/options";
import {blankToNull} from "@/views/Settings/Organization/Profile/profile-form";
import {useSmartTranslation} from "@/hooks/use-translation";
import {useSellableItems} from "../shared/items";
import {calculateSalesTotals} from "../shared/tax";
import {TotalsPanel} from "../shared/TotalsPanel";
import {EinvoiceSection, ReturnedGoodsCard, SourceLinesTable, SourceRow} from "../shared/billing";
import {DocCard, DocPair, DocTotal, FactsGrid} from "../shared/DocCard";
import {EntryChecks, LinesNote, totalDetails, useErrorCheck} from "../shared/EntryLayout";

type CreditNoteFormProps = {
    invoice: CustomerTransDocument,
    backTo: string,
    onSubmit: (data: CreditNoteRequest) => Promise<void>,
    onSuccess?: () => Promise<void>,
};

/** Credit all or part of an invoice. The note is applied to the invoice automatically. */
export function CreditNoteForm({invoice, backTo, onSubmit, onSuccess}: CreditNoteFormProps) {
    const {t} = useSmartTranslation();
    const {byId} = useSellableItems();
    const {data: taxContext} = useGetSalesTaxContext(invoice.branch_id);
    const {data: locations} = useGetInventoryLocationOptions();

    const rows: SourceRow[] = useMemo(() => (invoice.lines ?? []).map(line => ({
        id: line.id,
        code: line.item_code,
        description: line.description,
        uom: line.item?.uom ?? null,
        sourceQty: Number(line.quantity),
        before: Number(line.quantity_done),
        available: Number(line.quantity) - Number(line.quantity_done),
        unitPrice: Number(line.unit_price),
        discountPercent: Number(line.discount_percent),
    })).filter(row => row.available > 0), [invoice]);

    // stock items can come back into a location; services can't
    const hasStock = (invoice.lines ?? []).some(l => ["stock", "manufactured"].includes(l.item?.item_type ?? ""));

    const {control, setError, submitting, handleSubmitRequest} = useRequestForm<CreditNoteRequest>({
        formOptions: {
            defaultValues: {
                reference_no: "",
                source_trans_id: invoice.id,
                trans_date: today(),
                credit_type: hasStock ? "return" : null,
                inventory_location_id: invoice.inventory_location_id,
                customer_ref: "",
                remarks: "",
                einvoice_submission_mode: invoice.einvoice_submission_mode ?? "S",
                // nothing is credited until the user says so
                lines: rows.map(row => ({src_id: row.id, quantity: 0})),
            },
        },
    });

    const [lines, creditType] = useWatch({control, name: ["lines", "credit_type"]});
    const {errors} = useFormState({control});
    const linesError = (errors.lines as {message?: string} | undefined)?.message;
    const errorCheck = useErrorCheck(control);
    const creditedCount = (lines ?? []).filter(l => (Number(l.quantity) || 0) > 0).length;

    const totals = useMemo(() => calculateSalesTotals(
        taxContext?.tax_types ?? [],
        invoice.tax_included,
        rows.map((row, index) => {
            const rule = taxContext?.item_tax_categories[String(byId.get(invoice.lines?.find(l => l.id === row.id)?.item_id ?? 0)?.item_tax_category_id ?? "")];
            return {quantity: Number(lines?.[index]?.quantity) || 0, unit_price: row.unitPrice, discount_percent: row.discountPercent, exempt: rule?.exempt, exempt_tax_type_ids: rule?.exempt_tax_type_ids};
        }),
    ), [taxContext, invoice, rows, lines, byId]);

    const submit = async (values: CreditNoteRequest) => {
        const credited = values.lines.filter(l => (Number(l.quantity) || 0) > 0);
        if (credited.length === 0) {
            setError("lines", {type: "manual", message: t('enterQuantityToCredit')});
            throw new Error(t('enterQuantityToCredit'));
        }
        try {
            await onSubmit({...values, reference_no: values.reference_no.trim(), customer_ref: blankToNull(values.customer_ref), remarks: blankToNull(values.remarks), lines: credited});
        } catch (e) {
            applyServerErrors(e, setError, ["reference_no", "trans_date", "inventory_location_id", "accounts"]);
            throw e;
        }
    };

    const locationOptions = (locations ?? []).filter(l => l.status === "active" || l.id === invoice.inventory_location_id).map(l => ({value: l.id, label: `${l.code} - ${l.name}`}));

    return (
        <SettingsFormPage onSubmit={handleSubmitRequest({request: submit, onSuccess})} submitting={submitting} isEditing={false}
            backTo={backTo} submitLabel={t('saveCreditNote')} stickyActions documentLayout
            actionsSummary={<DocTotal label={t('creditTotal')} amount={totals.grand_total} currencyCode={invoice.currency?.code} details={totalDetails(totals, creditedCount, t)} />}>
            <EntryChecks
                issues={[errorCheck, creditedCount === 0 && {text: t('enterQuantityToCredit'), tone: "info" as const}]}
                ready={[t('creditingInvoice', {ref: invoice.reference_no}), t('lineCount', {count: creditedCount})]}
            />

            <DocPair>
                <DocCard title={t('crediting')} hint={t('creditAppliedHint')}>
                    <FactsGrid facts={[
                        {label: t('invoice'), value: invoice.reference_no},
                        {label: t('customer'), value: invoice.customer?.name},
                        {label: t('invoiceTotal'), value: `${formatDecimal(invoice.grand_total)} ${invoice.currency?.code ?? ""}`},
                        {label: t('balanceDue'), value: formatDecimal(invoice.balance ?? 0)},
                    ]} />
                </DocCard>

                <DocCard title={t('creditNoteDetails')}>
                    <Row className="gx-4">
                        <Col sm={6}>
                            <TextField control={control} name="trans_date" label={t('creditNoteDate')} type="date" required />
                        </Col>
                        <Col sm={6}>
                            <TextField control={control} name="customer_ref" label={t('customerRef')} maxLength={255} placeholder={t('optional')} />
                        </Col>
                        <Col sm={6}>
                            <TextField control={control} name="reference_no" label={t('referenceNo')} maxLength={255} placeholder={t('autoGenerated')} />
                        </Col>
                    </Row>
                </DocCard>
            </DocPair>

            <DocCard title={t('itemsToCredit')} flush>
                {linesError && <LinesNote tone="danger">{linesError}</LinesNote>}
                <SourceLinesTable control={control} rows={rows} lineTotals={totals.lines} taxIncluded={invoice.tax_included}
                    sourceLabel={t('invoiced')} beforeLabel={t('creditedBefore')} thisLabel={t('thisCredit')}
                    totals={<TotalsPanel totals={totals} taxIncluded={invoice.tax_included} currencyCode={invoice.currency?.code} totalLabel={t('creditTotal')} />} />
            </DocCard>

            {hasStock && <ReturnedGoodsCard control={control} creditType={creditType} locationOptions={locationOptions} />}

            <EinvoiceSection control={control} transType="customer_credit_note" customerId={invoice.customer_id} />

            <DocCard title={t('reasonForCredit')}>
                <TextAreaField control={control} name="remarks" label={t('printedOnCreditNote')} rows={3} placeholder={t('reasonForCreditPlaceholder')} />
            </DocCard>
        </SettingsFormPage>
    );
}
