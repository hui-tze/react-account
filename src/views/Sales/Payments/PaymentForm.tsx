import {ReactNode, useEffect, useMemo} from "react";
import {Col, Row} from "react-bootstrap";
import {CreditCard, MessageSquare, User} from "react-feather";
import {useWatch} from "react-hook-form";
import {useRequestForm} from "@/hooks/use-request-handler";
import {CustomerTransDocument, OpenItem} from "@/apis/models/sales-document";
import {PaymentRequest, useGetCustomerOpenItems} from "@/apis/requests/sales-billing-api";
import {useGetCustomerOptions} from "@/apis/requests/customer-api";
import {useGetCustomerBranches} from "@/apis/requests/customer-branch-api";
import {useGetBankAccountOptions} from "@/apis/requests/bank-account-api";
import {useGetCurrencyOptions} from "@/apis/requests/currency-api";
import {SelectField, TextAreaField, TextField} from "@/components/FormField/FormFields";
import SettingsFormPage from "@/views/Settings/shared/SettingsFormPage";
import {applyServerErrors, today} from "@/views/Inventory/shared/document";
import {formatDecimal} from "@/views/Inventory/shared/options";
import {blankToNull} from "@/views/Settings/Organization/Profile/profile-form";
import {useSmartTranslation} from "@/hooks/use-translation";
import {CustomerPicker} from "../shared/CustomerPicker";
import {roundMoney} from "../shared/tax";
import {AllocationTable, appliedTotal, toAllocations} from "../shared/AllocationTable";
import {DocCard, DocTotal} from "../shared/DocCard";

type PaymentFormProps = {
    record?: CustomerTransDocument,
    // ?invoice=ID — pay this invoice
    forInvoice?: CustomerTransDocument,
    backTo: string,
    onSubmit: (data: PaymentRequest) => Promise<void>,
    onSuccess?: () => Promise<void>,
    banner?: ReactNode,
};

type PaymentValues = Omit<PaymentRequest, "allocations"> & {
    // amount to apply per open invoice, in the order of the rows shown
    pay: (number | null)[],
};

/** Money received from a customer, applied to their open invoices; the rest stays as their credit. */
export function PaymentForm({record, forInvoice, backTo, onSubmit, onSuccess, banner}: PaymentFormProps) {
    const {t} = useSmartTranslation();
    const readOnly = !!record && record.status !== "active";

    const {control, setValue, getValues, setError, submitting, handleSubmitRequest} = useRequestForm<PaymentValues>({
        formOptions: {
            defaultValues: {
                reference_no: record?.reference_no ?? "",
                customer_id: record?.customer_id ?? forInvoice?.customer_id ?? null,
                branch_id: record?.branch_id ?? forInvoice?.branch_id ?? null,
                bank_account_id: record?.bank_account_id ?? null,
                trans_date: record?.trans_date ?? today(),
                amount: record ? Number(record.grand_total) : (forInvoice?.balance ?? null),
                bank_charge: Number(record?.bank_charge ?? 0),
                discount: Number(record?.discount_total ?? 0),
                exchange_rate: record && Number(record.exchange_rate) !== 1 ? Number(record.exchange_rate) : null,
                customer_ref: record?.customer_ref ?? "",
                remarks: record?.remarks ?? "",
                pay: [],
            },
        },
    });

    const [customerId, amount, discount, pay] = useWatch({control, name: ["customer_id", "amount", "discount", "pay"]});
    const {data: customers} = useGetCustomerOptions();
    const {data: branches} = useGetCustomerBranches(customerId);
    const {data: banks} = useGetBankAccountOptions();
    const {data: currencies} = useGetCurrencyOptions();
    const {data: openItems} = useGetCustomerOpenItems(customerId, {revalidateOnFocus: false});

    const customer = customers?.find(c => c.id === customerId);
    const currency = currencies?.find(c => c.id === customer?.currency_id);

    // open invoices, plus (edit) the ones this payment already settles — its own share counts as open
    const rows: OpenItem[] = useMemo(() => {
        const own = new Map((record?.allocations ?? []).map(a => [a.id, Number(a.amount)]));
        const list = (openItems?.invoices ?? []).map(item => ({...item, open: roundMoney(item.open + (own.get(item.id) ?? 0))}));
        (record?.allocations ?? []).forEach(a => {
            if (!list.some(item => item.id === a.id)) {
                list.push({id: a.id, trans_type: a.type, reference_no: a.reference_no, trans_date: a.date ?? "", due_date: a.due_date,
                    grand_total: Number(a.grand_total), allocated_total: 0, open: Number(a.amount)});
            }
        });
        return list;
    }, [openItems, record]);

    // (re)fill the pay column when the customer's invoices arrive
    useEffect(() => {
        const own = new Map((record?.allocations ?? []).map(a => [a.id, Number(a.amount)]));
        setValue("pay", rows.map(row => {
            if (record) return own.get(row.id) ?? 0;
            if (forInvoice && row.id === forInvoice.id) return row.open;
            return 0;
        }));
    }, [rows, record, forInvoice, setValue]);

    // a picked customer lands on its first active branch
    useEffect(() => {
        if (readOnly || !branches || getValues("branch_id")) return;
        const first = branches.find(b => b.status === "active");
        if (first) setValue("branch_id", first.id);
    }, [branches, readOnly, getValues, setValue]);

    const available = roundMoney((Number(amount) || 0) + (Number(discount) || 0));
    const applied = appliedTotal(pay);

    const bankOptions = (banks ?? [])
        .filter(b => (b.status === "active" && (!customer || b.currency_id === customer.currency_id)) || b.id === record?.bank_account_id)
        .map(b => ({value: b.id, label: b.account_name ?? `#${b.id}`}));

    const submit = async (values: PaymentValues) => {
        if (applied > available + 0.005) {
            setError("amount", {type: "manual", message: t('appliedMoreThanReceived')});
            throw new Error(t('appliedMoreThanReceived'));
        }
        const {pay: payColumn, ...rest} = values;
        try {
            await onSubmit({
                ...rest,
                reference_no: values.reference_no.trim(),
                customer_ref: blankToNull(values.customer_ref),
                remarks: blankToNull(values.remarks),
                allocations: toAllocations(rows, payColumn),
            });
        } catch (e) {
            applyServerErrors(e, setError, ["reference_no", "customer_id", "bank_account_id", "trans_date", "amount", "bank_charge", "discount", "exchange_rate", "accounts"]);
            throw e;
        }
    };

    return (
        <SettingsFormPage onSubmit={handleSubmitRequest({request: submit, onSuccess})} submitting={submitting} isEditing={!!record}
            backTo={backTo} readOnly={readOnly} submitLabel={record ? undefined : t('savePayment')}
            stickyActions actionsSummary={<DocTotal label={t('amountReceivedPlain')} amount={Number(amount) || 0} currencyCode={currency?.code} />}>
            {banner}

            <Row className="g-3">
                <Col xl={6}>
                    <DocCard icon={User} title={t('receivedFrom')} className="h-100 mb-0">
                        <Row className="gx-3">
                            <Col md={(branches?.length ?? 0) > 1 ? 7 : 12}>
                                <CustomerPicker control={control} name="customer_id" customers={customers ?? []} label={t('customer')} disabled={readOnly || !!record}
                                    onPicked={() => setValue("branch_id", null)} />
                            </Col>
                            {(branches?.length ?? 0) > 1 && (
                                <Col md={5}>
                                    <SelectField control={control} name="branch_id" label={t('branch')} numeric required placeholder="" disabled={readOnly}
                                        options={(branches ?? []).map(b => ({value: b.id, label: b.name}))} />
                                </Col>
                            )}
                        </Row>
                        {openItems && (
                            <div className="sales-credit-strip mb-0">
                                <span><span className="label">{t('outstandingInvoices')}</span><span className="fw-semibold">{formatDecimal(openItems.invoices.reduce((sum, i) => sum + i.open, 0))}</span></span>
                                <span><span className="label">{t('overdue')}</span><span className={openItems.overdue > 0 ? "text-danger fw-semibold" : ""}>{formatDecimal(openItems.overdue)}</span></span>
                                <span><span className="label">{t('unappliedCredit')}</span>{formatDecimal(openItems.unallocated)}</span>
                            </div>
                        )}
                    </DocCard>
                </Col>
                <Col xl={6}>
                    <DocCard icon={CreditCard} title={t('receiptDetails')} className="h-100 mb-0">
                        <Row className="gx-3">
                            <Col sm={6}>
                                <SelectField control={control} name="bank_account_id" label={t('depositTo')} options={bankOptions} numeric required placeholder="" disabled={readOnly} />
                            </Col>
                            <Col sm={6}>
                                <TextField control={control} name="trans_date" label={t('paymentDate')} type="date" required disabled={readOnly} />
                            </Col>
                            <Col sm={6}>
                                <TextField control={control} name="amount" label={currency?.code ? t('amountReceived', {code: currency.code}) : t('amountReceivedPlain')} type="number" numeric required step="0.01" min={0} disabled={readOnly}
                                    rules={{validate: (v) => Number(v) > 0 || t('valueMustBePositive')}} />
                            </Col>
                            <Col sm={6}>
                                <TextField control={control} name="reference_no" label={t('receiptNo')} maxLength={255} disabled={readOnly} placeholder={record ? undefined : t('autoGenerated')} />
                            </Col>
                            <Col sm={6}>
                                <TextField control={control} name="bank_charge" label={t('bankCharge')} type="number" numeric step="0.01" min={0} disabled={readOnly} hint={t('bankChargeHint')} />
                            </Col>
                            <Col sm={6}>
                                <TextField control={control} name="discount" label={t('promptPaymentDiscount')} type="number" numeric step="0.01" min={0} disabled={readOnly}
                                    hint={customer && Number(customer.payment_discount) > 0 ? t('customerOffersDiscount', {rate: formatDecimal(customer.payment_discount)}) : undefined} />
                            </Col>
                            <Col sm={12}>
                                <TextField control={control} name="customer_ref" label={t('chequeOrTransferRef')} maxLength={255} disabled={readOnly} />
                            </Col>
                        </Row>
                    </DocCard>
                </Col>
            </Row>

            <AllocationTable control={control} setValue={setValue} rows={rows} available={available} readOnly={readOnly} pay={pay}
                sources={[
                    {label: t('amountReceivedPlain'), amount: Number(amount) || 0},
                    ...((Number(discount) || 0) > 0 ? [{label: t('promptPaymentDiscount'), amount: Number(discount)}] : []),
                ]}
                className="mt-3"
                hint={t('applyToInvoicesHint')} emptyText={customerId ? t('noOpenInvoices') : t('pickCustomerFirst')} />

            <DocCard icon={MessageSquare} title={t('notes')} className="mb-0">
                <TextAreaField control={control} name="remarks" label={t('notes')} rows={2} disabled={readOnly} />
            </DocCard>
        </SettingsFormPage>
    );
}
