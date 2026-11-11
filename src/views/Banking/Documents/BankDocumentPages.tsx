import {useCallback, useMemo, useRef, useState} from "react";
import {DocRef} from "@/views/Documents/DocumentPreview";
import {Alert, Badge, Button, Col, Form, Row, Table} from "react-bootstrap";
import {Plus, Trash2, XCircle} from "react-feather";
import {useNavigate, useParams, useSearchParams} from "react-router-dom";
import {ActionButton, Link} from "@/components/Access/Guarded";
import {Controller, useFieldArray, useFormState, useWatch} from "react-hook-form";
import Select from "react-select";
import Swal from "sweetalert2";
import type {BankDocument, BankDocumentType} from "@/apis/models/banking";
import {bankingApi, BankMoneyRequest, FundsTransferRequest} from "@/apis/requests/banking-api";
import {useGetAllAccount} from "@/apis/requests/account-api";
import {useGetCustomerOptions} from "@/apis/requests/customer-api";
import {useGetSupplierOptions} from "@/apis/requests/supplier-api";
import {ConditionalError} from "@/components/Display/ErrorBoundary";
import {SelectField, SelectOption, TextAreaField, TextField} from "@/components/FormField/FormFields";
import {useRequestForm} from "@/hooks/use-request-handler";
import {useNotification} from "@/hooks/notification";
import {useSmartTranslation} from "@/hooks/use-translation";
import SettingsListPage from "@/views/Settings/shared/SettingsListPage";
import SettingsFormPage, {FormSectionTitle} from "@/views/Settings/shared/SettingsFormPage";
import {SearchBox} from "@/views/Sales/shared/SearchBox";
import {DocCard, DocTotal, FactsGrid} from "@/views/Sales/shared/DocCard";
import {applyServerErrors} from "@/views/Inventory/shared/document";
import {blankToNull} from "@/views/Settings/Organization/Profile/profile-form";
import {accountLedgerPath} from "@/views/GeneralLedger/gl-menu";
import {money, today} from "@/views/GeneralLedger/shared/report-ui";
import {reactSelectCustomStyles} from "@/utils/ReactSelect";
import {BANK_TRANSACTIONS_PATH, bankRegisterPath} from "../banking-menu";
import type {DimensionTag} from "@/apis/models/dimension";
import {
    applyDimensionDefaults, DimensionFields, DimensionHeaderCells, DimensionLineCells, DimensionTagsText, useActiveDimensions,
} from "@/views/Dimensions/shared/DimensionFields";

const Loading = () => <div className="loader-pendulums mt-10" />;
const TYPES: BankDocumentType[] = ["bank_payment", "bank_deposit", "funds_transfer"];

function TypeBadge({type, label}: {type: string, label: string}) {
    const tint = type === "bank_payment" ? "badge-soft-danger" : type === "bank_deposit" ? "badge-soft-success" : "badge-soft-info";
    return <Badge bg="light" className={tint}>{label}</Badge>;
}

/** Bank accounts as select options, with their currency. */
function useBankOptions() {
    const {data: accounts} = bankingApi.useAccounts({revalidateOnFocus: false});
    return useMemo(() => {
        const active = (accounts ?? []).filter(a => a.status === "active");
        return {
            accounts: active,
            options: active.map(a => ({value: a.id, label: `${a.account_name ?? ""}${a.account_number ? ` · ${a.account_number}` : ""} (${a.currency_code})`})),
            byId: new Map(active.map(a => [a.id, a])),
            glIds: new Set((accounts ?? []).map(a => a.gl_account_id)),
        };
    }, [accounts]);
}

/** Payments, deposits and transfers. */
export function BankTransactions() {
    const {t} = useSmartTranslation();
    const [search] = useSearchParams();
    const banks = useBankOptions();
    const [filters, setFilters] = useState({q: "", trans_type: search.get("type") ?? "", bank_account_id: "", status: "", date_from: "", date_to: ""});
    const set = (key: keyof typeof filters) => (value: string) => setFilters(f => ({...f, [key]: value}));

    const useFetcher = useCallback((params: URLSearchParams) => {
        const query = new URLSearchParams(params);
        Object.entries(filters).forEach(([k, v]) => {
            if (v) {
                query.set(k, v);
            }
        });
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return bankingApi.useDocuments(query);
    }, [filters]);

    return (
        <SettingsListPage<BankDocument>
            useFetcher={useFetcher}
            editPath={(row) => `${BANK_TRANSACTIONS_PATH}/${row.id}`}
            rowClassName={(row) => row.status === "voided" ? "gl-row-voided" : undefined}
            toolbar={(
                <Row className="g-2 py-3 align-items-center">
                    <Col md={3}><SearchBox value={filters.q} onChange={set("q")} placeholder={t('bankSearchDocuments')} /></Col>
                    <Col md="auto">
                        <Form.Select value={filters.trans_type} onChange={(e) => set("trans_type")(e.target.value)} aria-label={t('documentType')}>
                            <option value="">{t('einvAllTypes')}</option>
                            {TYPES.map(type => <option key={type} value={type}>{t(`docType_${type}`)}</option>)}
                        </Form.Select>
                    </Col>
                    <Col md="auto">
                        <Form.Select value={filters.bank_account_id} onChange={(e) => set("bank_account_id")(e.target.value)} aria-label={t('bankAccount')}>
                            <option value="">{t('bankAllAccounts')}</option>
                            {banks.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </Form.Select>
                    </Col>
                    <Col md="auto" className="d-flex align-items-center gap-2">
                        <Form.Control type="date" value={filters.date_from} onChange={(e) => set("date_from")(e.target.value)} aria-label={t('dateFrom')} />
                        <span className="text-muted">–</span>
                        <Form.Control type="date" value={filters.date_to} onChange={(e) => set("date_to")(e.target.value)} aria-label={t('dateTo')} />
                    </Col>
                </Row>
            )}
            columns={[
                {accessor: "trans_date", title: t('date'), width: 110},
                {accessor: "reference_no", title: t('referenceNo'), render: (row) => (
                    <>
                        <DocRef type={row.trans_type} id={row.id} reference={row.reference_no} />
                        <div><TypeBadge type={row.trans_type} label={t(`docType_${row.trans_type}`)} /></div>
                    </>
                )},
                {accessor: "bank_account_name", title: t('bankAccount'), render: (row) => (
                    <>
                        {row.bank_account_name}
                        {row.to_bank_account_name && <div className="small text-muted">→ {row.to_bank_account_name}</div>}
                    </>
                )},
                {accessor: "party_name", title: t('bankPartyOrPayee'), render: (row) => (
                    <>
                        {row.party_name}
                        {row.memo && <div className="small text-muted text-truncate" style={{maxWidth: 260}}>{row.memo}</div>}
                    </>
                )},
                {accessor: "amount", title: t('amount'), tdClasses: "text-end fw-semibold", render: (row) => money(row.amount, false)},
                {accessor: "status", title: t('status'), render: (row) => row.status === "voided"
                    ? <Badge bg="light" className="badge-soft-danger">{t('salesState_voided')}</Badge>
                    : <Badge bg="light" className="badge-soft-success">{t('journalPosted')}</Badge>},
            ]}
        />
    );
}

type LineValues = {account_id: number | null, memo: string, amount: number | null, dimensions: DimensionTag[]};
type MoneyValues = Omit<BankMoneyRequest, "lines"> & {lines: LineValues[]};
const EMPTY_LINE: LineValues = {account_id: null, memo: "", amount: null, dimensions: []};

/** Bank payment (money out) or deposit (money in) to / from GL accounts. */
function BankMoneyForm({type}: {type: "bank_payment" | "bank_deposit"}) {
    const {t} = useSmartTranslation();
    const navigate = useNavigate();
    const [search] = useSearchParams();
    const out = type === "bank_payment";
    const banks = useBankOptions();
    const {data: allAccounts} = useGetAllAccount();
    const {data: customers} = useGetCustomerOptions();
    const {data: suppliers} = useGetSupplierOptions();
    const createdId = useRef<number | null>(null);
    const {dimensions} = useActiveDimensions();

    // ordinary postable accounts: not receivable / payable control accounts, not a bank's own account
    const accountOptions: SelectOption[] = useMemo(() => [...(allAccounts ?? [])]
        .filter(a => a.status === "active" && a.allow_transaction && !a.is_control_account && !banks.glIds.has(a.id))
        .sort((a, b) => a.account_code.localeCompare(b.account_code))
        .map(a => ({value: a.id, label: `${a.account_code} - ${a.account_name}`})), [allAccounts, banks.glIds]);

    const defaultBank = Number(search.get("account")) || banks.accounts.find(a => a.is_default)?.id || null;
    const {control, setError, setValue, getValues, submitting, handleSubmitRequest} = useRequestForm<MoneyValues>({
        formOptions: {
            defaultValues: {
                reference_no: "", trans_date: today(), bank_account_id: defaultBank, party_type: "other", party_id: null, payee_name: "",
                exchange_rate: null, bank_charge: null, memo: "", lines: [{...EMPTY_LINE, dimensions: []}],
            },
        },
    });
    const {fields, append, remove} = useFieldArray({control, name: "lines", keyName: "fieldKey"});
    const [lines, partyType, bankId, charge] = useWatch({control, name: ["lines", "party_type", "bank_account_id", "bank_charge"]});
    const {errors} = useFormState({control});
    const linesError = (errors.lines as {message?: string} | undefined)?.message;
    const currency = bankId ? banks.byId.get(Number(bankId))?.currency_code : undefined;

    const total = (lines ?? []).reduce((s, l) => s + (Number(l?.amount) || 0), 0);
    const bankEffect = out ? total + (Number(charge) || 0) : total - (Number(charge) || 0);

    const submit = async (values: MoneyValues) => {
        const body: BankMoneyRequest = {
            ...values,
            reference_no: blankToNull(values.reference_no),
            party_id: values.party_type === "other" ? null : values.party_id,
            payee_name: blankToNull(values.payee_name),
            memo: blankToNull(values.memo),
            lines: values.lines.filter(l => l.account_id && Number(l.amount) > 0)
                .map(l => ({account_id: l.account_id, memo: blankToNull(l.memo), amount: Number(l.amount), dimensions: l.dimensions ?? []})),
        };
        try {
            const saved = await (out ? bankingApi.addPayment(body) : bankingApi.addDeposit(body));
            createdId.current = saved.id;
        } catch (e) {
            applyServerErrors(e, setError, ["reference_no", "trans_date", "bank_account_id", "party_id", "exchange_rate", "bank_charge", "lines"]);
            throw e;
        }
    };

    const partyOptions = partyType === "customer"
        ? (customers ?? []).filter(c => c.status === "active").map(c => ({value: c.id, label: c.name}))
        : (suppliers ?? []).filter(s => s.status === "active").map(s => ({value: s.id, label: s.name}));

    return (
        <SettingsFormPage
            onSubmit={handleSubmitRequest({request: submit, onSuccess: async () => navigate(`${BANK_TRANSACTIONS_PATH}/${createdId.current}`)})}
            submitting={submitting}
            isEditing={false}
            backTo={BANK_TRANSACTIONS_PATH}
            submitLabel={out ? t('bankSavePayment') : t('bankSaveDeposit')}
            stickyActions
            actionsSummary={<DocTotal label={out ? t('bankMoneyOut') : t('bankMoneyIn')} amount={bankEffect} currencyCode={currency ?? undefined} />}
        >
            <FormSectionTitle title={out ? t('docType_bank_payment') : t('docType_bank_deposit')} hint={out ? t('bankPaymentHint') : t('bankDepositHint')} />
            <Row className="gx-3">
                <Col md={6}><SelectField control={control} name="bank_account_id" label={out ? t('bankPayFrom') : t('bankDepositTo')} options={banks.options} numeric required /></Col>
                <Col md={3}><TextField control={control} name="trans_date" label={t('date')} type="date" required /></Col>
                <Col md={3}><TextField control={control} name="reference_no" label={t('referenceNo')} maxLength={100} placeholder={t('autoGenerated')} /></Col>
                <Col md={4}>
                    <SelectField control={control} name="party_type" label={out ? t('bankPaidTo') : t('bankReceivedFrom')} options={[
                        {value: "other", label: t('bankPartyOther')},
                        {value: "customer", label: t('customer')},
                        {value: "supplier", label: t('supplier')},
                    ]} />
                </Col>
                <Col md={8}>
                    {partyType === "other"
                        ? <TextField control={control} name="payee_name" label={t('bankPayeeName')} maxLength={255} />
                        : <SelectField control={control} name="party_id" label={partyType === "customer" ? t('customer') : t('supplier')} options={partyOptions} numeric required placeholder="" />}
                </Col>
                <Col md={4}><TextField control={control} name="bank_charge" label={t('bankCharge')} type="number" numeric min={0} step="0.01" /></Col>
                <Col md={4}><TextField control={control} name="exchange_rate" label={t('exchangeRate')} type="number" numeric min={0} step="0.000001" hint={t('bankRateHint')} /></Col>
                <Col md={12}><TextAreaField control={control} name="memo" label={t('memo')} rows={2} /></Col>
            </Row>

            <DocCard title={t('bankLines')} hint={out ? t('bankPaymentLinesHint') : t('bankDepositLinesHint')} className="mt-2">
                {linesError && <div className="text-danger small mb-2">{linesError}</div>}
                <div className="table-responsive">
                    <Table className="mb-0 sales-lines">
                        <thead className="table-light">
                            <tr>
                                <th style={{minWidth: 280}}>{t('account')}</th>
                                <th>{t('memo')}</th>
                                <DimensionHeaderCells />
                                <th style={{width: 180}} className="text-end">{t('amount')}{currency ? ` (${currency})` : ""}</th>
                                <th style={{width: 48}} />
                            </tr>
                        </thead>
                        <tbody>
                            {fields.map((field, index) => (
                                <tr key={field.fieldKey}>
                                    <td>
                                        <Controller control={control} name={`lines.${index}.account_id`} render={({field: f, fieldState}) => (
                                            <>
                                                <Select<SelectOption, false>
                                                    options={accountOptions}
                                                    value={accountOptions.find(o => o.value === f.value) ?? null}
                                                    onChange={(o) => {
                                                        const accountId = o ? Number(o.value) : null;
                                                        f.onChange(accountId);
                                                        // the account's default dimension values
                                                        void applyDimensionDefaults(getValues, setValue, [["account", accountId]], `lines.${index}.dimensions`);
                                                    }}
                                                    placeholder={t('pleaseSelect')}
                                                    styles={reactSelectCustomStyles as never}
                                                    menuPortalTarget={document.body}
                                                    classNamePrefix="select"
                                                />
                                                {fieldState.error?.message && <div className="invalid-feedback d-block">{fieldState.error.message}</div>}
                                            </>
                                        )} />
                                    </td>
                                    <td>
                                        <Controller control={control} name={`lines.${index}.memo`}
                                            render={({field: f}) => <Form.Control value={f.value ?? ""} onChange={f.onChange} maxLength={255} />} />
                                    </td>
                                    <DimensionLineCells control={control} name={`lines.${index}.dimensions`} skipCheck={!lines?.[index]?.account_id} />
                                    <td>
                                        <Controller control={control} name={`lines.${index}.amount`} render={({field: f, fieldState}) => (
                                            <Form.Control type="number" min={0} step="0.01" className="text-end" value={f.value ?? ""} isInvalid={!!fieldState.error}
                                                onChange={(e) => f.onChange(e.target.value === "" ? null : Number(e.target.value))} />
                                        )} />
                                    </td>
                                    <td className="text-end">
                                        <Button variant="flush-danger" size="sm" className="btn-icon btn-rounded" disabled={fields.length <= 1}
                                            onClick={() => remove(index)} title={t('delete')}><Trash2 size={16} /></Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="fw-semibold">
                                <td colSpan={2 + dimensions.length}>
                                    <Button variant="link" size="sm" className="p-0" onClick={() => append({...EMPTY_LINE, dimensions: []})}><Plus size={14} className="me-1" />{t('addLine')}</Button>
                                </td>
                                <td className="text-end">{money(total, false)}</td>
                                <td />
                            </tr>
                        </tfoot>
                    </Table>
                </div>
            </DocCard>
        </SettingsFormPage>
    );
}

export const CreateBankPayment = () => <BankMoneyForm type="bank_payment" />;
export const CreateBankDeposit = () => <BankMoneyForm type="bank_deposit" />;

/** Move money between two bank accounts. */
export function CreateBankTransfer() {
    const {t} = useSmartTranslation();
    const navigate = useNavigate();
    const [search] = useSearchParams();
    const banks = useBankOptions();
    const createdId = useRef<number | null>(null);
    const {control, setError, submitting, handleSubmitRequest} = useRequestForm<FundsTransferRequest>({
        formOptions: {
            defaultValues: {reference_no: "", trans_date: today(), bank_account_id: Number(search.get("account")) || null, to_bank_account_id: null,
                amount: null, to_amount: null, bank_charge: null, exchange_rate: null, memo: "", dimensions: []},
        },
    });
    const [fromId, toId, amount] = useWatch({control, name: ["bank_account_id", "to_bank_account_id", "amount"]});
    const from = fromId ? banks.byId.get(Number(fromId)) : undefined;
    const to = toId ? banks.byId.get(Number(toId)) : undefined;
    const crossCurrency = !!from && !!to && from.currency_code !== to.currency_code;

    const submit = async (values: FundsTransferRequest) => {
        try {
            const saved = await bankingApi.addTransfer({
                ...values,
                reference_no: blankToNull(values.reference_no),
                to_amount: crossCurrency ? values.to_amount : null,
                memo: blankToNull(values.memo),
            });
            createdId.current = saved.id;
        } catch (e) {
            applyServerErrors(e, setError, ["reference_no", "trans_date", "bank_account_id", "to_bank_account_id", "amount", "to_amount", "exchange_rate", "bank_charge", "dimensions"]);
            throw e;
        }
    };

    return (
        <SettingsFormPage
            onSubmit={handleSubmitRequest({request: submit, onSuccess: async () => navigate(`${BANK_TRANSACTIONS_PATH}/${createdId.current}`)})}
            submitting={submitting}
            isEditing={false}
            backTo={BANK_TRANSACTIONS_PATH}
            submitLabel={t('bankSaveTransfer')}
            actionsSummary={amount ? <DocTotal label={t('amount')} amount={Number(amount)} currencyCode={from?.currency_code ?? undefined} /> : undefined}
        >
            <FormSectionTitle title={t('docType_funds_transfer')} hint={t('bankTransferHint')} />
            <Row className="gx-3">
                <Col md={6}><SelectField control={control} name="bank_account_id" label={t('bankTransferFrom')} options={banks.options} numeric required /></Col>
                <Col md={6}>
                    <SelectField control={control} name="to_bank_account_id" label={t('bankTransferTo')} numeric required
                        options={banks.options.filter(o => o.value !== Number(fromId))} />
                </Col>
                <Col md={3}><TextField control={control} name="trans_date" label={t('date')} type="date" required /></Col>
                <Col md={3}><TextField control={control} name="reference_no" label={t('referenceNo')} maxLength={100} placeholder={t('autoGenerated')} /></Col>
                <Col md={3}>
                    <TextField control={control} name="amount" label={`${t('amount')}${from ? ` (${from.currency_code})` : ""}`} type="number" numeric min={0} step="0.01" required />
                </Col>
                <Col md={3}><TextField control={control} name="bank_charge" label={t('bankCharge')} type="number" numeric min={0} step="0.01" hint={t('bankTransferChargeHint')} /></Col>
                {crossCurrency && (
                    <>
                        <Col md={3}>
                            <TextField control={control} name="to_amount" label={t('bankAmountReceived', {currency: to?.currency_code ?? ""})} type="number" numeric min={0} step="0.01" required />
                        </Col>
                        <Col md={3}>
                            <TextField control={control} name="exchange_rate" label={t('exchangeRate')} type="number" numeric min={0} step="0.000001" hint={t('bankRateHint')} />
                        </Col>
                    </>
                )}
                <DimensionFields control={control} />
                <Col md={12}><TextAreaField control={control} name="memo" label={t('memo')} rows={2} /></Col>
            </Row>
            {crossCurrency && <Alert variant="info" className="small py-2">{t('bankCrossCurrencyNote')}</Alert>}
        </SettingsFormPage>
    );
}

/** A posted (or voided) payment, deposit or transfer. */
export function ViewBankDocument() {
    const {t} = useSmartTranslation();
    const {id = ""} = useParams();
    const notify = useNotification();
    const {data: doc, error, mutate} = bankingApi.useDocument(id, {revalidateOnFocus: false});

    if (error) {
        return <ConditionalError error={error} />;
    }
    if (!doc) {
        return <Loading />;
    }

    const voidDoc = async () => {
        const {value: reason, isConfirmed} = await Swal.fire({
            title: t('bankVoidTitle'),
            text: t('bankVoidText', {ref: doc.reference_no}),
            input: "text",
            inputPlaceholder: t('reason'),
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#b00020",
            confirmButtonText: t('void'),
            cancelButtonText: t('close'),
        });
        if (!isConfirmed) {
            return;
        }
        try {
            await bankingApi.void(doc.id, reason?.trim() || null);
            notify.success(t('bankVoided'));
            await mutate();
        } catch (err) {
            notify.error(err);
        }
    };

    const transfer = doc.trans_type === "funds_transfer";
    const code = doc.bank_currency ?? "";

    return (
        <div className="app-body">
            <div className="container-fluid py-3">
                <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                    <TypeBadge type={doc.trans_type} label={t(`docType_${doc.trans_type}`)} />
                    {doc.status === "voided"
                        ? <Badge bg="light" className="badge-soft-danger">{t('salesState_voided')}</Badge>
                        : <Badge bg="light" className="badge-soft-success">{t('journalPosted')}</Badge>}
                    {doc.reconciled && <Badge bg="light" className="badge-soft-info">{t('bankReconciled')}</Badge>}
                    {doc.void_reason && <span className="small text-muted">{t('voidReason')}: {doc.void_reason}</span>}
                    <div className="ms-auto d-flex gap-2">
                        <Link to={BANK_TRANSACTIONS_PATH} className="btn btn-sm btn-outline-secondary">{t('back')}</Link>
                        {doc.status !== "voided" && (
                            <ActionButton variant="outline-danger" size="sm" onClick={voidDoc} disabled={doc.reconciled} title={doc.reconciled ? t('bankVoidReconciled') : undefined}>
                                <XCircle size={14} className="me-1" />{t('void')}
                            </ActionButton>
                        )}
                    </div>
                </div>
                {doc.reconciled && doc.status !== "voided" && <Alert variant="info" className="small py-2">{t('bankVoidReconciled')}</Alert>}

                <DocCard title={doc.reference_no} className="mb-3">
                    <FactsGrid facts={[
                        {label: t('date'), value: doc.trans_date},
                        {label: transfer ? t('bankTransferFrom') : t('bankAccount'), value: <Link to={bankRegisterPath(doc.bank_account_id)}>{doc.bank_account_name}</Link>},
                        {label: t('bankTransferTo'), value: transfer && doc.to_bank_account_id ? <Link to={bankRegisterPath(doc.to_bank_account_id)}>{doc.to_bank_account_name}</Link> : null},
                        {label: doc.trans_type === "bank_payment" ? t('bankPaidTo') : t('bankReceivedFrom'), value: transfer ? null : doc.party_name},
                        {label: t('amount'), value: `${code} ${money(doc.amount, false)}`},
                        {label: t('bankAmountReceived', {currency: doc.to_bank_currency ?? ""}),
                            value: transfer && doc.to_amount !== null && doc.to_bank_currency !== doc.bank_currency ? `${doc.to_bank_currency} ${money(doc.to_amount, false)}` : null},
                        {label: t('bankCharge'), value: doc.bank_charge ? `${code} ${money(doc.bank_charge, false)}` : null},
                        {label: t('exchangeRate'), value: doc.exchange_rate !== 1 ? String(doc.exchange_rate) : null},
                        {label: t('memo'), value: doc.memo},
                        {label: t('dimensions'), value: transfer && doc.dimensions?.length ? <DimensionTagsText tags={doc.dimensions} /> : null},
                    ]} />
                </DocCard>

                {!transfer && (
                    <DocCard title={t('bankLines')}>
                        <div className="table-responsive">
                            <Table className="mb-0 sales-lines">
                                <thead className="table-light">
                                    <tr><th>{t('account')}</th><th>{t('memo')}</th><th className="text-end">{t('amount')}</th></tr>
                                </thead>
                                <tbody>
                                    {doc.lines.map(line => (
                                        <tr key={line.id}>
                                            <td><Link to={accountLedgerPath(line.account_id)} className="text-reset"><span className="text-muted small me-2">{line.account_code}</span>{line.account_name}</Link></td>
                                            <td className="text-muted">
                                                {line.memo}
                                                {!!line.dimensions?.length && <div className="small"><DimensionTagsText tags={line.dimensions} /></div>}
                                            </td>
                                            <td className="text-end">{money(line.amount, false)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="fw-semibold"><td colSpan={2}>{t('total')}</td><td className="text-end">{code} {money(doc.amount, false)}</td></tr>
                                </tfoot>
                            </Table>
                        </div>
                    </DocCard>
                )}
            </div>
        </div>
    );
}
