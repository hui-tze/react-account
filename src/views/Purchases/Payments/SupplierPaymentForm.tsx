import {ReactNode, useEffect} from "react";
import {Col, Row} from "react-bootstrap";
import {CreditCard, MessageSquare, Truck} from "react-feather";
import {useWatch} from "react-hook-form";
import {useRequestForm} from "@/hooks/use-request-handler";
import {SupplierTransDocument} from "@/apis/models/purchase-document";
import {SupplierPaymentRequest} from "@/apis/requests/purchase-api";
import {useGetBankAccountOptions} from "@/apis/requests/bank-account-api";
import {useGetSupplierOptions} from "@/apis/requests/supplier-api";
import {useGetCurrencyOptions} from "@/apis/requests/currency-api";
import {SelectField, TextAreaField, TextField} from "@/components/FormField/FormFields";
import SettingsFormPage from "@/views/Settings/shared/SettingsFormPage";
import {applyServerErrors, today} from "@/views/Inventory/shared/document";
import {formatDecimal} from "@/views/Inventory/shared/options";
import {blankToNull} from "@/views/Settings/Organization/Profile/profile-form";
import {useSmartTranslation} from "@/hooks/use-translation";
import {roundMoney} from "@/views/Sales/shared/tax";
import {AllocationTable, appliedTotal, toAllocations} from "@/views/Sales/shared/AllocationTable";
import {DocCard, DocTotal} from "@/views/Sales/shared/DocCard";
import {SupplierPicker} from "../shared/SupplierSection";
import {useBillRows} from "../shared/ApplySupplierCredit";

type SupplierPaymentFormProps = {
    record?: SupplierTransDocument,
    // ?bill=ID — pay this bill
    forBill?: SupplierTransDocument,
    backTo: string,
    onSubmit: (data: SupplierPaymentRequest) => Promise<void>,
    onSuccess?: () => Promise<void>,
    banner?: ReactNode,
};

type PaymentValues = Omit<SupplierPaymentRequest, "allocations"> & {
    // amount to apply per open bill, in the order of the rows shown
    pay: (number | null)[],
};

/** Money paid to a supplier, applied to their open bills; the rest stays as credit with the supplier. */
export function SupplierPaymentForm({record, forBill, backTo, onSubmit, onSuccess, banner}: SupplierPaymentFormProps) {
    const {t} = useSmartTranslation();
    const readOnly = !!record && record.status !== "active";

    const {control, setValue, setError, submitting, handleSubmitRequest} = useRequestForm<PaymentValues>({
        formOptions: {
            defaultValues: {
                reference_no: record?.reference_no ?? "",
                supplier_id: record?.supplier_id ?? forBill?.supplier_id ?? null,
                bank_account_id: record?.bank_account_id ?? null,
                trans_date: record?.trans_date ?? today(),
                amount: record ? Number(record.grand_total) : (forBill?.balance ?? null),
                bank_charge: Number(record?.bank_charge ?? 0),
                discount: Number(record?.discount_total ?? 0),
                exchange_rate: record && Number(record.exchange_rate) !== 1 ? Number(record.exchange_rate) : null,
                payment_ref: record?.supplier_invoice_no ?? "",
                remarks: record?.remarks ?? "",
                pay: [],
            },
        },
    });

    const [supplierId, amount, discount, pay] = useWatch({control, name: ["supplier_id", "amount", "discount", "pay"]});
    const {data: suppliers} = useGetSupplierOptions();
    const {data: banks} = useGetBankAccountOptions();
    const {data: currencies} = useGetCurrencyOptions();
    const {rows, openItems} = useBillRows(supplierId, record);

    const supplier = suppliers?.find(s => s.id === supplierId);
    const currency = currencies?.find(c => c.id === supplier?.currency_id);

    // (re)fill the pay column when the supplier's bills arrive
    useEffect(() => {
        const own = new Map((record?.allocations ?? []).map(a => [a.id, Number(a.amount)]));
        setValue("pay", rows.map(row => {
            if (record) return own.get(row.id) ?? 0;
            if (forBill && row.id === forBill.id) return row.open;
            return 0;
        }));
    }, [rows, record, forBill, setValue]);

    const available = roundMoney((Number(amount) || 0) + (Number(discount) || 0));
    const applied = appliedTotal(pay);

    const bankOptions = (banks ?? [])
        .filter(b => (b.status === "active" && (!supplier?.currency_id || !b.currency_id || b.currency_id === supplier.currency_id)) || b.id === record?.bank_account_id)
        .map(b => ({value: b.id, label: b.account_name ?? `#${b.id}`}));

    const submit = async (values: PaymentValues) => {
        if (applied > available + 0.005) {
            setError("amount", {type: "manual", message: t('appliedMoreThanPaid')});
            throw new Error(t('appliedMoreThanPaid'));
        }
        const {pay: payColumn, ...rest} = values;
        try {
            await onSubmit({
                ...rest,
                reference_no: values.reference_no.trim(),
                payment_ref: blankToNull(values.payment_ref),
                remarks: blankToNull(values.remarks),
                allocations: toAllocations(rows, payColumn),
            });
        } catch (e) {
            applyServerErrors(e, setError, ["reference_no", "supplier_id", "bank_account_id", "trans_date", "amount", "bank_charge", "discount", "exchange_rate", "accounts"]);
            throw e;
        }
    };

    return (
        <SettingsFormPage onSubmit={handleSubmitRequest({request: submit, onSuccess})} submitting={submitting} isEditing={!!record}
            backTo={backTo} readOnly={readOnly} submitLabel={record ? undefined : t('savePayment')}
            stickyActions actionsSummary={<DocTotal label={t('amountPaid')} amount={Number(amount) || 0} currencyCode={currency?.code} />}>
            {banner}

            <Row className="g-3">
                <Col xl={6}>
                    <DocCard icon={Truck} title={t('paidTo')} className="h-100 mb-0">
                        <SupplierPicker control={control} name="supplier_id" suppliers={suppliers ?? []} label={t('supplier')} disabled={readOnly || !!record} />
                        {openItems && (
                            <div className="sales-credit-strip mb-0">
                                <span><span className="label">{t('outstandingBills')}</span><span className="fw-semibold">{formatDecimal(openItems.invoices.reduce((sum, i) => sum + i.open, 0))}</span></span>
                                <span><span className="label">{t('overdue')}</span><span className={openItems.overdue > 0 ? "text-danger fw-semibold" : ""}>{formatDecimal(openItems.overdue)}</span></span>
                                <span><span className="label">{t('unappliedCredit')}</span>{formatDecimal(openItems.unallocated)}</span>
                            </div>
                        )}
                    </DocCard>
                </Col>
                <Col xl={6}>
                    <DocCard icon={CreditCard} title={t('paymentDetails')} className="h-100 mb-0">
                        <Row className="gx-3">
                            <Col sm={6}>
                                <SelectField control={control} name="bank_account_id" label={t('payFrom')} options={bankOptions} numeric required placeholder="" disabled={readOnly} />
                            </Col>
                            <Col sm={6}>
                                <TextField control={control} name="trans_date" label={t('paymentDate')} type="date" required disabled={readOnly} />
                            </Col>
                            <Col sm={6}>
                                <TextField control={control} name="amount" label={currency?.code ? t('amountPaidIn', {code: currency.code}) : t('amountPaid')} type="number" numeric required step="0.01" min={0} disabled={readOnly}
                                    rules={{validate: (v) => Number(v) > 0 || t('valueMustBePositive')}} />
                            </Col>
                            <Col sm={6}>
                                <TextField control={control} name="reference_no" label={t('paymentVoucherNo')} maxLength={255} disabled={readOnly} placeholder={record ? undefined : t('autoGenerated')} />
                            </Col>
                            <Col sm={6}>
                                <TextField control={control} name="bank_charge" label={t('bankCharge')} type="number" numeric step="0.01" min={0} disabled={readOnly} hint={t('supplierBankChargeHint')} />
                            </Col>
                            <Col sm={6}>
                                <TextField control={control} name="discount" label={t('discountReceived')} type="number" numeric step="0.01" min={0} disabled={readOnly} hint={t('discountReceivedHint')} />
                            </Col>
                            <Col sm={12}>
                                <TextField control={control} name="payment_ref" label={t('chequeOrTransferRef')} maxLength={255} disabled={readOnly} />
                            </Col>
                        </Row>
                    </DocCard>
                </Col>
            </Row>

            <AllocationTable control={control} setValue={setValue} rows={rows} available={available} party="supplier" readOnly={readOnly} pay={pay}
                sources={[
                    {label: t('amountPaid'), amount: Number(amount) || 0},
                    ...((Number(discount) || 0) > 0 ? [{label: t('discountReceived'), amount: Number(discount)}] : []),
                ]}
                className="mt-3"
                hint={t('applyToBillsHint')} emptyText={supplierId ? t('noOpenBills') : t('pickSupplierFirst')} />

            <DocCard icon={MessageSquare} title={t('notes')} className="mb-0">
                <TextAreaField control={control} name="remarks" label={t('notes')} rows={2} disabled={readOnly} />
            </DocCard>
        </SettingsFormPage>
    );
}
