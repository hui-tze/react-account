import {useCallback, useRef, useState} from "react";
import {Badge, Button, Col, Form, Row, Table} from "react-bootstrap";
import {Plus, Trash2, XCircle} from "react-feather";
import {Link, useNavigate, useParams} from "react-router-dom";
import {Controller, useFieldArray, useFormState, useWatch} from "react-hook-form";
import Swal from "sweetalert2";
import type {Journal} from "@/apis/models/ledger";
import {journalApi, JournalRequest} from "@/apis/requests/ledger-api";
import {ConditionalError} from "@/components/Display/ErrorBoundary";
import {TextAreaField, TextField} from "@/components/FormField/FormFields";
import {useRequestForm} from "@/hooks/use-request-handler";
import {useNotification} from "@/hooks/notification";
import {useSmartTranslation} from "@/hooks/use-translation";
import SettingsListPage from "@/views/Settings/shared/SettingsListPage";
import SettingsFormPage, {FormSectionTitle} from "@/views/Settings/shared/SettingsFormPage";
import {useAccountOptions} from "@/views/Settings/shared/options";
import {SearchBox} from "@/views/Sales/shared/SearchBox";
import {DocCard, DocTotal, FactsGrid} from "@/views/Sales/shared/DocCard";
import {applyServerErrors} from "@/views/Inventory/shared/document";
import {blankToNull} from "@/views/Settings/Organization/Profile/profile-form";
import {accountLedgerPath, GL_JOURNALS_PATH} from "../gl-menu";
import {money, today} from "../shared/report-ui";

const Loading = () => <div className="loader-pendulums mt-10" />;

function JournalStatusBadge({status}: {status: string}) {
    const {t} = useSmartTranslation();
    return status === "Voided"
        ? <Badge bg="light" className="badge-soft-danger">{t('salesState_voided')}</Badge>
        : <Badge bg="light" className="badge-soft-success">{t('journalPosted')}</Badge>;
}

/** All journal entries. */
export function Journals() {
    const {t} = useSmartTranslation();
    const [q, setQ] = useState("");
    const [status, setStatus] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const useFetcher = useCallback((params: URLSearchParams) => {
        const query = new URLSearchParams(params);
        Object.entries({q, status, date_from: dateFrom, date_to: dateTo}).forEach(([k, v]) => {
            if (v) {
                query.set(k, v);
            }
        });
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return journalApi.useGetAll(query);
    }, [q, status, dateFrom, dateTo]);

    return (
        <SettingsListPage<Journal>
            useFetcher={useFetcher}
            editPath={(row) => `${GL_JOURNALS_PATH}/${row.id}`}
            rowClassName={(row) => row.status === "Voided" ? "gl-row-voided" : undefined}
            toolbar={(
                <Row className="g-2 py-3 align-items-center">
                    <Col md={4}><SearchBox value={q} onChange={setQ} placeholder={t('glSearchJournals')} /></Col>
                    <Col md="auto">
                        <Form.Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label={t('status')}>
                            <option value="">{t('allStatuses')}</option>
                            <option value="Posted">{t('journalPosted')}</option>
                            <option value="Voided">{t('salesState_voided')}</option>
                        </Form.Select>
                    </Col>
                    <Col md="auto" className="d-flex align-items-center gap-2">
                        <Form.Control type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} aria-label={t('dateFrom')} />
                        <span className="text-muted">–</span>
                        <Form.Control type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} aria-label={t('dateTo')} />
                    </Col>
                </Row>
            )}
            columns={[
                {accessor: "reference_no", title: t('referenceNo'), render: (row) => <span className="fw-semibold text-dark">{row.reference_no}</span>},
                {accessor: "journal_date", title: t('date'), render: (row) => row.journal_date?.slice(0, 10)},
                {accessor: "remarks", title: t('description'), render: (row) => (
                    <>
                        <span className="text-dark">{row.remarks}</span>
                        {row.source_reference && <div className="small text-muted">{row.source_reference}</div>}
                    </>
                )},
                {accessor: "total_amount", title: t('total'), tdClasses: "text-end", render: (row) => money(row.total_amount, false)},
                {accessor: "status", title: t('status'), render: (row) => <JournalStatusBadge status={row.status} />},
            ]}
        />
    );
}

type LineValues = {account_id: number | null, memo: string, debit: number | null, credit: number | null};
type JournalValues = Omit<JournalRequest, "lines"> & {lines: LineValues[]};

const EMPTY_LINE: LineValues = {account_id: null, memo: "", debit: null, credit: null};

/** Manual journal: balanced debit and credit lines posted straight to the ledger. */
export function CreateJournal() {
    const {t} = useSmartTranslation();
    const navigate = useNavigate();
    const accounts = useAccountOptions();
    const createdId = useRef<number | null>(null);

    const {control, setError, setValue, submitting, handleSubmitRequest} = useRequestForm<JournalValues>({
        formOptions: {
            defaultValues: {reference_no: "", journal_date: today(), source_reference: "", remarks: "", lines: [{...EMPTY_LINE}, {...EMPTY_LINE}]},
        },
    });
    const {fields, append, remove} = useFieldArray({control, name: "lines", keyName: "fieldKey"});
    const lines = useWatch({control, name: "lines"});
    const {errors} = useFormState({control});
    const linesError = (errors.lines as {message?: string} | undefined)?.message ?? (errors.lines as {root?: {message?: string}} | undefined)?.root?.message;

    const debit = (lines ?? []).reduce((s, l) => s + (Number(l?.debit) || 0), 0);
    const credit = (lines ?? []).reduce((s, l) => s + (Number(l?.credit) || 0), 0);
    const difference = Math.round((debit - credit) * 100) / 100;

    const submit = async (values: JournalValues) => {
        try {
            const saved = await journalApi.add({
                reference_no: blankToNull(values.reference_no),
                journal_date: values.journal_date,
                source_reference: blankToNull(values.source_reference),
                remarks: blankToNull(values.remarks),
                lines: values.lines
                    .filter(l => l.account_id && ((Number(l.debit) || 0) > 0 || (Number(l.credit) || 0) > 0))
                    .map(l => ({account_id: l.account_id, memo: blankToNull(l.memo), debit: Number(l.debit) || 0, credit: Number(l.credit) || 0})),
            });
            createdId.current = saved.id;
        } catch (e) {
            applyServerErrors(e, setError, ["reference_no", "journal_date", "lines"]);
            throw e;
        }
    };

    // typing a debit clears the credit on the same line and vice versa
    const amountField = (index: number, side: "debit" | "credit") => (
        <Controller
            control={control}
            name={`lines.${index}.${side}`}
            render={({field, fieldState}) => (
                <Form.Control type="number" min={0} step="0.01" className="text-end" value={field.value ?? ""} isInvalid={!!fieldState.error}
                    onChange={(e) => {
                        const value = e.target.value === "" ? null : Number(e.target.value);
                        field.onChange(value);
                        if (value) {
                            setValue(`lines.${index}.${side === "debit" ? "credit" : "debit"}`, null);
                        }
                    }} />
            )}
        />
    );

    return (
        <SettingsFormPage
            onSubmit={handleSubmitRequest({request: submit, onSuccess: async () => navigate(`${GL_JOURNALS_PATH}/${createdId.current}`)})}
            submitting={submitting}
            isEditing={false}
            backTo={GL_JOURNALS_PATH}
            submitLabel={t('postJournal')}
            stickyActions
            actionsSummary={<DocTotal label={difference === 0 ? t('glBalanced') : t('glOutBy')} amount={Math.abs(difference)} />}
        >
            <FormSectionTitle title={t('documentDetails')} />
            <Row className="gx-3">
                <Col md={3}><TextField control={control} name="reference_no" label={t('referenceNo')} maxLength={50} placeholder={t('autoGenerated')} /></Col>
                <Col md={3}><TextField control={control} name="journal_date" label={t('date')} type="date" required /></Col>
                <Col md={6}><TextField control={control} name="source_reference" label={t('glSourceReference')} maxLength={255} /></Col>
                <Col md={12}><TextAreaField control={control} name="remarks" label={t('description')} rows={2} /></Col>
            </Row>

            <DocCard title={t('glJournalLines')} hint={t('glJournalLinesHint')} className="mt-2">
                {linesError && <div className="text-danger small mb-2">{linesError}</div>}
                <div className="table-responsive">
                    <Table className="mb-0 sales-lines">
                        <thead className="table-light">
                            <tr>
                                <th style={{minWidth: 260}}>{t('account')}</th>
                                <th>{t('memo')}</th>
                                <th style={{width: 160}} className="text-end">{t('debit')}</th>
                                <th style={{width: 160}} className="text-end">{t('credit')}</th>
                                <th style={{width: 48}} />
                            </tr>
                        </thead>
                        <tbody>
                            {fields.map((field, index) => (
                                <tr key={field.fieldKey}>
                                    <td>
                                        <Controller
                                            control={control}
                                            name={`lines.${index}.account_id`}
                                            render={({field: f, fieldState}) => (
                                                <>
                                                    <Form.Select value={f.value ?? ""} isInvalid={!!fieldState.error}
                                                        onChange={(e) => f.onChange(e.target.value ? Number(e.target.value) : null)}>
                                                        <option value="">{t('pleaseSelect')}</option>
                                                        {accounts.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                                    </Form.Select>
                                                    <Form.Control.Feedback type="invalid">{fieldState.error?.message}</Form.Control.Feedback>
                                                </>
                                            )}
                                        />
                                    </td>
                                    <td>
                                        <Controller control={control} name={`lines.${index}.memo`}
                                            render={({field: f}) => <Form.Control value={f.value ?? ""} onChange={f.onChange} maxLength={255} />} />
                                    </td>
                                    <td>{amountField(index, "debit")}</td>
                                    <td>{amountField(index, "credit")}</td>
                                    <td className="text-end">
                                        <Button variant="flush-danger" size="sm" className="btn-icon btn-rounded" disabled={fields.length <= 2}
                                            onClick={() => remove(index)} title={t('delete')}>
                                            <Trash2 size={16} />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="fw-semibold">
                                <td colSpan={2}>
                                    <Button variant="link" size="sm" className="p-0" onClick={() => append({...EMPTY_LINE})}>
                                        <Plus size={14} className="me-1" />{t('addLine')}
                                    </Button>
                                </td>
                                <td className="text-end">{money(debit, false)}</td>
                                <td className="text-end">{money(credit, false)}</td>
                                <td />
                            </tr>
                            {difference !== 0 && (
                                <tr>
                                    <td colSpan={5} className="text-end text-danger small">
                                        {t('glDifference', {amount: money(Math.abs(difference), false), side: difference > 0 ? t('credit') : t('debit')})}
                                    </td>
                                </tr>
                            )}
                        </tfoot>
                    </Table>
                </div>
            </DocCard>
        </SettingsFormPage>
    );
}

/** A posted (or voided) journal and its lines. */
export function ViewJournal() {
    const {t} = useSmartTranslation();
    const {id = ""} = useParams();
    const notify = useNotification();
    const {data: journal, error, mutate} = journalApi.useGetOne(id, {revalidateOnFocus: false});

    if (error) {
        return <ConditionalError error={error} />;
    }
    if (!journal) {
        return <Loading />;
    }

    const voidJournal = async () => {
        const {value: reason, isConfirmed} = await Swal.fire({
            title: t('voidJournalTitle'),
            text: t('voidJournalText', {ref: journal.reference_no}),
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
            await journalApi.void(journal.id, reason?.trim() || null);
            notify.success(t('journalVoided'));
            await mutate();
        } catch (err) {
            notify.error(err);
        }
    };

    const debit = journal.lines.reduce((s, l) => s + l.debit, 0);
    const credit = journal.lines.reduce((s, l) => s + l.credit, 0);

    return (
        <div className="app-body">
            <div className="container-fluid py-3">
                <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                    <JournalStatusBadge status={journal.status} />
                    {journal.void_reason && <span className="small text-muted">{t('voidReason')}: {journal.void_reason}</span>}
                    <div className="ms-auto d-flex gap-2">
                        <Link to={GL_JOURNALS_PATH} className="btn btn-sm btn-outline-secondary">{t('back')}</Link>
                        {journal.status !== "Voided" && (
                            <Button variant="outline-danger" size="sm" onClick={voidJournal}><XCircle size={14} className="me-1" />{t('void')}</Button>
                        )}
                    </div>
                </div>

                <DocCard title={journal.reference_no} className="mb-3">
                    <FactsGrid facts={[
                        {label: t('date'), value: journal.journal_date},
                        {label: t('glSourceReference'), value: journal.source_reference},
                        {label: t('description'), value: journal.remarks},
                        {label: t('total'), value: `${journal.currency_code} ${money(journal.total_amount, false)}`},
                    ]} />
                </DocCard>

                <DocCard title={t('glJournalLines')}>
                    <div className="table-responsive">
                        <Table className="mb-0 sales-lines">
                            <thead className="table-light">
                                <tr>
                                    <th>{t('account')}</th>
                                    <th>{t('memo')}</th>
                                    <th className="text-end">{t('debit')}</th>
                                    <th className="text-end">{t('credit')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {journal.lines.map(line => (
                                    <tr key={line.id}>
                                        <td>
                                            <Link to={accountLedgerPath(line.account_id)} className="text-reset">
                                                <span className="text-muted small me-2">{line.account_code}</span>{line.account_name}
                                            </Link>
                                        </td>
                                        <td className="text-muted">{line.memo}</td>
                                        <td className="text-end">{money(line.debit)}</td>
                                        <td className="text-end">{money(line.credit)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="fw-semibold">
                                    <td colSpan={2}>{t('total')}</td>
                                    <td className="text-end">{money(debit, false)}</td>
                                    <td className="text-end">{money(credit, false)}</td>
                                </tr>
                            </tfoot>
                        </Table>
                    </div>
                </DocCard>
            </div>
        </div>
    );
}
