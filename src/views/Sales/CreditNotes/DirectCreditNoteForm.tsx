import {useEffect, useMemo} from "react";
import {Col, Row} from "react-bootstrap";
import {useWatch} from "react-hook-form";
import {useRequestForm} from "@/hooks/use-request-handler";
import {DocumentDeliveryAddress} from "@/apis/models/sales-document";
import {CreditNoteRequest, useGetCustomerOpenItems} from "@/apis/requests/sales-billing-api";
import {SalesLineRequest} from "@/apis/requests/sales-order-api";
import {useGetInventoryLocationOptions} from "@/apis/requests/inventory-location-api";
import {TextAreaField, TextField} from "@/components/FormField/FormFields";
import SettingsFormPage from "@/views/Settings/shared/SettingsFormPage";
import {applyServerErrors, today} from "@/views/Inventory/shared/document";
import {blankToNull} from "@/views/Settings/Organization/Profile/profile-form";
import {useSmartTranslation} from "@/hooks/use-translation";
import {PartySection, useCustomerChecks} from "../shared/PartySection";
import {EntryChecks, lineChecks, totalDetails, useErrorCheck} from "../shared/EntryLayout";
import {SalesLinesTable} from "../shared/SalesLinesTable";
import {TotalsPanel} from "../shared/TotalsPanel";
import {ExchangeRateField} from "../shared/ExchangeRateField";
import {EinvoiceSection, ReturnedGoodsCard} from "../shared/billing";
import {DocCard, DocPair, DocTotal} from "../shared/DocCard";
import {AllocationTable, appliedTotal, toAllocations} from "../shared/AllocationTable";
import {useDocumentPricing} from "../shared/useDocumentPricing";
import {EMPTY_DELIVERY_ADDRESS, EMPTY_LINE} from "../shared/sales-form";

type DirectCreditValues = {
    reference_no: string,
    trans_date: string,
    credit_type: "return" | "write_off" | null,
    // filled by the customer section (only some are sent)
    customer_id: number | null,
    branch_id: number | null,
    sales_type_id: number | null,
    payment_term_id: number | null,
    sales_person_id: number | null,
    inventory_location_id: number | null,
    shipping_company_id: number | null,
    exchange_rate: number | null,
    deliver_to: string | null,
    delivery_address: DocumentDeliveryAddress,
    customer_ref: string | null,
    remarks: string | null,
    einvoice_submission_mode: "S" | "I" | "H" | null,
    lines: SalesLineRequest[],
    // amount applied per open invoice
    pay: (number | null)[],
};

type DirectCreditNoteFormProps = {
    backTo: string,
    onSubmit: (data: CreditNoteRequest) => Promise<void>,
    onSuccess?: () => Promise<void>,
};

/**
 * A credit note not tied to one invoice — goodwill, a price adjustment, or goods returned
 * without their invoice to hand. It can be applied to any of the customer's open invoices;
 * whatever isn't applied stays as customer credit.
 */
export function DirectCreditNoteForm({backTo, onSubmit, onSuccess}: DirectCreditNoteFormProps) {
    const {t} = useSmartTranslation();
    const {data: locations} = useGetInventoryLocationOptions();

    const {control, setValue, getValues, setError, submitting, handleSubmitRequest} = useRequestForm<DirectCreditValues>({
        formOptions: {
            defaultValues: {
                reference_no: "", trans_date: today(), credit_type: "write_off",
                customer_id: null, branch_id: null, sales_type_id: null, payment_term_id: null, sales_person_id: null,
                inventory_location_id: null, shipping_company_id: null, exchange_rate: null, deliver_to: null,
                delivery_address: {...EMPTY_DELIVERY_ADDRESS},
                customer_ref: "", remarks: "", einvoice_submission_mode: "S",
                lines: [{...EMPTY_LINE}],
                pay: [],
            },
        },
    });

    const [customerId, date, lines, creditType, pay] = useWatch({control, name: ["customer_id", "trans_date", "lines", "credit_type", "pay"]});
    const pricing = useDocumentPricing(control, date, lines);
    const {data: openItems} = useGetCustomerOpenItems(customerId, {revalidateOnFocus: false});
    const rows = useMemo(() => openItems?.invoices ?? [], [openItems]);

    // a new customer's invoices start with nothing applied
    useEffect(() => {
        setValue("pay", rows.map(() => 0));
    }, [rows, setValue]);

    const hasStock = (lines ?? []).some(l => ["stock", "manufactured"].includes(pricing.byId.get(l.item_id ?? 0)?.item_type ?? ""));
    const available = pricing.totals.grand_total;
    const applied = appliedTotal(pay);
    const party = useCustomerChecks(control, {creditCheck: "none", total: available});
    const lineCheck = lineChecks(lines, t);
    const errorCheck = useErrorCheck(control);

    const submit = async (values: DirectCreditValues) => {
        if (applied > available + 0.005) {
            setError("pay", {type: "manual", message: t('appliedMoreThanCredit')});
            throw new Error(t('appliedMoreThanCredit'));
        }
        try {
            await onSubmit({
                reference_no: values.reference_no.trim(),
                source_trans_id: null,
                trans_date: values.trans_date,
                customer_id: values.customer_id,
                branch_id: values.branch_id,
                sales_type_id: values.sales_type_id,
                // stock goods either come back or are written off; services carry no credit type
                credit_type: hasStock ? values.credit_type : null,
                inventory_location_id: hasStock && values.credit_type === "return" ? values.inventory_location_id : null,
                customer_ref: blankToNull(values.customer_ref),
                remarks: blankToNull(values.remarks),
                einvoice_submission_mode: values.einvoice_submission_mode,
                allocations: toAllocations(rows, values.pay),
                lines: values.lines.map(l => ({item_id: l.item_id, description: (l.description ?? "").trim(), quantity: l.quantity, unit_price: l.unit_price, discount_percent: l.discount_percent ?? 0})),
            });
        } catch (e) {
            applyServerErrors(e, setError, ["reference_no", "customer_id", "branch_id", "trans_date", "inventory_location_id", "lines", "accounts"]);
            throw e;
        }
    };

    const locationOptions = (locations ?? []).filter(l => l.status === "active").map(l => ({value: l.id, label: `${l.code} - ${l.name}`}));

    return (
        <SettingsFormPage onSubmit={handleSubmitRequest({request: submit, onSuccess})} submitting={submitting} isEditing={false}
            backTo={backTo} submitLabel={t('saveCreditNote')} stickyActions documentLayout
            actionsSummary={<DocTotal label={t('creditTotal')} amount={available} currencyCode={pricing.currency?.code} details={totalDetails(pricing.totals, lineCheck.filled, t)} />}>
            <EntryChecks issues={[errorCheck, ...party.issues, ...lineCheck.issues]} ready={[...party.ready, t('lineCount', {count: lineCheck.filled})]} />

            <DocPair>
                <DocCard title={t('whoYouAreCrediting')}>
                    <PartySection control={control} setValue={setValue} getValues={getValues} creditCheck="none" showSalesPerson={false} />
                </DocCard>

                <DocCard title={t('creditNoteDetails')} hint={t('directCreditHint')}>
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
                        <ExchangeRateField control={control} pricing={pricing} />
                    </Row>
                </DocCard>
            </DocPair>

            <DocCard title={t('itemsToCredit')} hint={pricing.taxIncluded ? t('pricesIncludeTax') : undefined} flush>
                <SalesLinesTable control={control} setValue={setValue} items={pricing.items} byId={pricing.byId} priceList={pricing.priceList}
                    defaultDiscount={0} taxIncluded={pricing.taxIncluded} lineTotals={pricing.totals.lines}
                    totals={<TotalsPanel totals={pricing.totals} taxIncluded={pricing.taxIncluded} currencyCode={pricing.currency?.code} totalLabel={t('creditTotal')} />} />
            </DocCard>

            {hasStock && <ReturnedGoodsCard control={control} creditType={creditType} locationOptions={locationOptions} />}

            <AllocationTable control={control} setValue={setValue} rows={rows} available={available} pay={pay}
                sources={[{label: t('creditTotal'), amount: available}]}
                hint={t('applyCreditHint')} emptyText={customerId ? t('noOpenInvoicesCredit') : t('pickCustomerFirst')} />

            <EinvoiceSection control={control} transType="customer_credit_note" />

            <DocCard title={t('reasonForCredit')}>
                <TextAreaField control={control} name="remarks" label={t('printedOnCreditNote')} rows={3} placeholder={t('reasonForCreditPlaceholder')} />
            </DocCard>
        </SettingsFormPage>
    );
}
