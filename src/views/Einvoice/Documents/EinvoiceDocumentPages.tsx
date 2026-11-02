import {createContext, useCallback, useContext, useState} from "react";
import {Alert, Badge, Button, Card, Col, Form, Row, Spinner, Table} from "react-bootstrap";
import {Code, ExternalLink, RefreshCw, Send, XCircle} from "react-feather";
import {Link, useNavigate, useParams} from "react-router-dom";
import SimpleBar from "simplebar-react";
import {useSWRConfig} from "swr";
import type {EinvoiceDocument, EinvoiceOutstanding, EinvoiceProcessStatus, EinvoiceTransType} from "@/apis/models/einvoice";
import {einvoiceDocumentApi} from "@/apis/requests/einvoice-api";
import {ConditionalError} from "@/components/Display/ErrorBoundary";
import SettingsListPage from "@/views/Settings/shared/SettingsListPage";
import {SearchBox} from "@/views/Sales/shared/SearchBox";
import {FactsGrid} from "@/views/Sales/shared/DocCard";
import {formatDecimal} from "@/views/Inventory/shared/options";
import {useNotification} from "@/hooks/notification";
import {useSmartTranslation} from "@/hooks/use-translation";
import {EINVOICE_DOCUMENTS_PATH, einvoiceSourcePath} from "../einvoice-menu";
import {EinvoiceStatusBadge, formatDateTime, useEinvoiceActions} from "../shared/einvoice-ui";

const Loading = () => <div className="loader-pendulums mt-10" />;

const TRANS_TYPES: EinvoiceTransType[] = ["sales_invoice", "customer_credit_note", "self_billed_invoice", "self_billed_credit_note"];
const STATUSES: EinvoiceProcessStatus[] = ["SUBMITTED", "VALID", "INVALID", "FAILED", "CANCELLED", "PENDING"];

// refresh every e-invoice listing / panel after an action
function useRefreshEinvoiceLists() {
    const {mutate} = useSWRConfig();
    return () => mutate((key) => typeof key === "string" && key.includes("/einvoice/"), undefined, {revalidate: true});
}

type Filters = {q: string, status: string, trans_type: string, date_from: string, date_to: string};

function FilterBar({filters, onChange, statuses, searchPlaceholder}: {
    filters: Filters, onChange: (f: Filters) => void, statuses?: EinvoiceProcessStatus[], searchPlaceholder: string,
}) {
    const {t} = useSmartTranslation();
    const set = (key: keyof Filters) => (value: string) => onChange({...filters, [key]: value});

    return (
        <Row className="g-2 py-3 align-items-center">
            <Col md={4}>
                <SearchBox value={filters.q} onChange={set("q")} placeholder={searchPlaceholder} />
            </Col>
            <Col md="auto">
                <Form.Select value={filters.trans_type} onChange={(e) => set("trans_type")(e.target.value)} aria-label={t('documentType')}>
                    <option value="">{t('einvAllTypes')}</option>
                    {TRANS_TYPES.map(type => <option key={type} value={type}>{t(`docType_${type}`)}</option>)}
                </Form.Select>
            </Col>
            {statuses && (
                <Col md="auto">
                    <Form.Select value={filters.status} onChange={(e) => set("status")(e.target.value)} aria-label={t('status')}>
                        <option value="">{t('allStatuses')}</option>
                        {statuses.map(s => <option key={s} value={s}>{t(`einvStatus_${s}`)}</option>)}
                    </Form.Select>
                </Col>
            )}
            <Col md="auto" className="d-flex align-items-center gap-2">
                <Form.Control type="date" value={filters.date_from} onChange={(e) => set("date_from")(e.target.value)} aria-label={t('dateFrom')} />
                <span className="text-muted">–</span>
                <Form.Control type="date" value={filters.date_to} onChange={(e) => set("date_to")(e.target.value)} aria-label={t('dateTo')} />
            </Col>
        </Row>
    );
}

const NO_FILTERS: Filters = {q: "", status: "", trans_type: "", date_from: "", date_to: ""};

function withFilters(params: URLSearchParams, filters: Filters) {
    const query = new URLSearchParams(params);
    Object.entries(filters).forEach(([key, value]) => {
        if (value) {
            query.set(key, value);
        }
    });
    return query;
}

/** Every document sent (or attempted) to MyInvois. */
export function EinvoiceDocuments() {
    const {t} = useSmartTranslation();
    const [filters, setFilters] = useState<Filters>(NO_FILTERS);

    const useFetcher = useCallback((params: URLSearchParams) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return einvoiceDocumentApi.useGetAll(withFilters(params, filters));
    }, [filters]);

    return (
        <SettingsListPage<EinvoiceDocument>
            useFetcher={useFetcher}
            editPath={(row) => `${EINVOICE_DOCUMENTS_PATH}/${row.id}`}
            toolbar={<FilterBar filters={filters} onChange={setFilters} statuses={STATUSES} searchPlaceholder={t('einvSearchDocuments')} />}
            columns={[
                {accessor: "doc_number", title: t('referenceNo'), render: (row) => (
                    <span className="fw-semibold text-dark">{row.doc_number}{row.revision_no > 0 && <span className="text-muted small"> · r{row.revision_no}</span>}</span>
                )},
                {accessor: "trans_type", title: t('documentType'), render: (row) => t(`docType_${row.trans_type}`)},
                {accessor: "doc_date", title: t('date')},
                {accessor: "buyer_name", title: t('einvCounterparty')},
                {accessor: "total_payable", title: t('total'), tdClasses: "text-end", render: (row) => `${row.currency_code} ${formatDecimal(row.total_payable)}`},
                {accessor: "process_status", title: t('status'), render: (row) => <EinvoiceStatusBadge status={row.process_status} />},
                {accessor: "uuid", title: t('einvUuid'), render: (row) => row.uuid
                    ? <span className="small font-monospace">{row.uuid}</span>
                    : <span className="small text-danger text-truncate d-inline-block" style={{maxWidth: 260}} title={row.last_error_message ?? ""}>{row.last_error_message}</span>},
                {accessor: "updated_at", title: t('einvLastUpdate'), render: (row) => <span className="small text-muted">{formatDateTime(row.updated_at)}</span>},
            ]}
        />
    );
}

type Selection = {
    selected: Map<number, {trans_type: EinvoiceTransType, trans_id: number}>,
    toggle: (row: EinvoiceOutstanding) => void,
};

// the listing table only re-renders for a new fetcher, so checkboxes read the selection from context
const SelectionContext = createContext<Selection>({selected: new Map(), toggle: () => {}});

function RowCheckbox({row}: {row: EinvoiceOutstanding}) {
    const {selected, toggle} = useContext(SelectionContext);
    return (
        <Form.Check
            type="checkbox"
            aria-label={row.reference_no}
            checked={selected.has(row.id)}
            onClick={(e) => e.stopPropagation()}
            onChange={() => toggle(row)}
        />
    );
}

/** Sales / self-billed documents that LHDN hasn't accepted yet, with bulk submit. */
export function OutstandingEinvoices() {
    const {t} = useSmartTranslation();
    const navigate = useNavigate();
    const refreshLists = useRefreshEinvoiceLists();
    const actions = useEinvoiceActions(refreshLists);
    const [filters, setFilters] = useState<Filters>(NO_FILTERS);
    // selected rows by synthetic id, with what to submit
    const [selected, setSelected] = useState<Map<number, {trans_type: EinvoiceTransType, trans_id: number}>>(new Map());

    const useFetcher = useCallback((params: URLSearchParams) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return einvoiceDocumentApi.useOutstanding(withFilters(params, filters));
    }, [filters]);

    const toggle = (row: EinvoiceOutstanding) => setSelected(prev => {
        const next = new Map(prev);
        if (next.has(row.id)) {
            next.delete(row.id);
        } else {
            next.set(row.id, {trans_type: row.trans_type, trans_id: row.trans_id});
        }
        return next;
    });

    const submitSelected = async () => {
        await actions.submit([...selected.values()]);
        setSelected(new Map());
    };

    return (
        <SelectionContext.Provider value={{selected, toggle}}>
            <SettingsListPage<EinvoiceOutstanding>
                useFetcher={useFetcher}
                editPath={(row) => einvoiceSourcePath(row.trans_type, row.trans_id) ?? EINVOICE_DOCUMENTS_PATH}
                toolbar={(
                    <>
                        <FilterBar filters={filters} onChange={setFilters} searchPlaceholder={t('searchSalesDocuments')} />
                        <div className="d-flex align-items-center gap-2 pb-3">
                            <Button variant="primary" size="sm" disabled={!selected.size || actions.busy} onClick={submitSelected}>
                                {actions.busy ? <Spinner animation="border" size="sm" className="me-1" /> : <Send size={14} className="me-1" />}
                                {t('einvSubmitSelected', {count: selected.size})}
                            </Button>
                            {selected.size > 0 && <Button variant="link" size="sm" onClick={() => setSelected(new Map())}>{t('einvClearSelection')}</Button>}
                            <span className="small text-muted ms-2">{t('einvOutstandingHint')}</span>
                        </div>
                    </>
                )}
                columns={[
                    {accessor: undefined, title: "", width: 36, render: (row) => <RowCheckbox row={row} />},

                    {accessor: "reference_no", title: t('referenceNo'), render: (row) => <span className="fw-semibold text-dark">{row.reference_no}</span>},
                    {accessor: "trans_type", title: t('documentType'), render: (row) => t(`docType_${row.trans_type}`)},
                    {accessor: "trans_date", title: t('date')},
                    {accessor: "party_name", title: t('einvCounterparty')},
                    {accessor: "grand_total", title: t('total'), tdClasses: "text-end", render: (row) => formatDecimal(row.grand_total)},
                    {accessor: "einvoice_submission_mode", title: t('submissionMode'), render: (row) => row.einvoice_submission_mode
                        ? t(`submissionMode_${row.einvoice_submission_mode}`) : <span className="text-muted">{t('einvTypeDefault')}</span>},
                    {accessor: undefined, title: t('einvLastAttempt'), render: (row) => row.einvoice ? (
                        <div className="d-flex flex-column gap-1" onClick={(e) => { e.stopPropagation(); navigate(`${EINVOICE_DOCUMENTS_PATH}/${row.einvoice!.id}`); }}>
                            <EinvoiceStatusBadge status={row.einvoice.process_status} />
                            {row.einvoice.last_error_message && (
                                <span className="small text-danger text-truncate d-inline-block" style={{maxWidth: 280}} title={row.einvoice.last_error_message}>
                                    {row.einvoice.last_error_message}
                                </span>
                            )}
                        </div>
                    ) : <span className="text-muted small">{t('einvNeverSubmitted')}</span>},
                    {accessor: undefined, title: "", tdClasses: "text-end", render: (row) => (
                        <Button variant="outline-primary" size="sm" disabled={actions.busy} onClick={(e) => {
                            e.stopPropagation();
                            actions.submit([{trans_type: row.trans_type, trans_id: row.trans_id}]);
                        }}>
                            <Send size={14} className="me-1" />{t('einvSubmit')}
                        </Button>
                    )},
                ]}
            />
        </SelectionContext.Provider>
    );
}

/** One e-invoice: LHDN status, validation results, history and actions. */
export function ViewEinvoiceDocument() {
    const {t} = useSmartTranslation();
    const {id = ""} = useParams();
    const notify = useNotification();
    const {data: doc, error, mutate} = einvoiceDocumentApi.useGetOne(id, {revalidateOnFocus: false});
    const refreshLists = useRefreshEinvoiceLists();
    const actions = useEinvoiceActions(async () => { await mutate(); await refreshLists(); });
    const [payload, setPayload] = useState<string | null>(null);

    if (error) {
        return <ConditionalError error={error} />;
    }
    if (!doc) {
        return <Loading />;
    }

    const sourcePath = einvoiceSourcePath(doc.trans_type, doc.trans_id);
    const invalidSteps = doc.validations.filter(v => v.step_status === "Invalid");

    const showPayload = async () => {
        if (payload) {
            setPayload(null);
            return;
        }
        try {
            const result = await einvoiceDocumentApi.payload(doc.id);
            setPayload(JSON.stringify(result.payload, null, 2));
        } catch (err) {
            notify.error(err);
        }
    };

    return (
        <div className="app-body">
            <SimpleBar className="nicescroll-bar">
                <div className="container-fluid py-3">
                    <Card className="mb-3 border-0 bg-light">
                        <Card.Body className="py-2 px-3 d-flex flex-wrap align-items-center gap-3">
                            <div className="d-flex align-items-center gap-2">
                                <EinvoiceStatusBadge status={doc.process_status} />
                                {doc.lhdn_status && <span className="small text-muted">{t('einvLhdnStatus', {status: doc.lhdn_status})}</span>}
                                {doc.rejection_state === "REQUESTED" && <Badge bg="light" className="badge-soft-danger">{t('einvRejectionRequested')}</Badge>}
                            </div>
                            {sourcePath && (
                                <Link to={sourcePath} className="badge bg-light text-dark border fw-normal text-decoration-none">
                                    {t(`docType_${doc.trans_type}`)} <span className="fw-semibold">{doc.doc_number}</span>
                                </Link>
                            )}
                            <div className="ms-auto d-flex flex-wrap gap-2">
                                {actions.busy && <Spinner animation="border" size="sm" className="align-self-center" />}
                                {doc.validation_link && (
                                    <a href={doc.validation_link} target="_blank" rel="noreferrer" className="btn btn-outline-success btn-sm">
                                        <ExternalLink size={14} className="me-1" />{t('einvValidationLink')}
                                    </a>
                                )}
                                {doc.uuid && (
                                    <Button variant="outline-secondary" size="sm" disabled={actions.busy} onClick={() => actions.refresh(doc.id)}>
                                        <RefreshCw size={14} className="me-1" />{t('einvRefreshStatus')}
                                    </Button>
                                )}
                                {doc.can_cancel && (
                                    <Button variant="outline-danger" size="sm" disabled={actions.busy} onClick={() => actions.cancel(doc)}>
                                        <XCircle size={14} className="me-1" />{t('einvCancel')}
                                    </Button>
                                )}
                                {doc.can_submit && (
                                    <Button variant="primary" size="sm" disabled={actions.busy} onClick={() => actions.resubmit(doc.id)}>
                                        <Send size={14} className="me-1" />{t('einvResubmit')}
                                    </Button>
                                )}
                            </div>
                        </Card.Body>
                    </Card>

                    {doc.last_error_message && (doc.process_status === "FAILED" || doc.process_status === "INVALID") && (
                        <Alert variant="danger" className="small">
                            <div className="fw-semibold mb-1">{doc.process_status === "FAILED" ? t('einvFailedTitle') : t('einvInvalidTitle')}</div>
                            {doc.last_error_message}
                        </Alert>
                    )}
                    {doc.can_cancel && doc.cancel_deadline_at && (
                        <Alert variant="info" className="small py-2">{t('einvCancelDeadline', {at: formatDateTime(doc.cancel_deadline_at)})}</Alert>
                    )}

                    <Row className="g-3">
                        <Col lg={7}>
                            <Card className="card-border mb-3">
                                <Card.Body>
                                    <FactsGrid facts={[
                                        {label: t('referenceNo'), value: doc.doc_number},
                                        {label: t('documentType'), value: `${t(`docType_${doc.trans_type}`)} (${doc.einv_type_code}, v${doc.einv_type_version})`},
                                        {label: t('date'), value: doc.doc_date},
                                        {label: t('einvCounterparty'), value: doc.buyer_name},
                                        {label: t('tin'), value: doc.buyer_tin},
                                        {label: t('einvIdValue'), value: doc.buyer_id_value ? `${doc.buyer_id_type} ${doc.buyer_id_value}` : null},
                                        {label: t('einvTotalExclTax'), value: `${doc.currency_code} ${formatDecimal(doc.total_excl_tax)}`},
                                        {label: t('einvTaxAmount'), value: `${doc.currency_code} ${formatDecimal(doc.total_tax_amount)}`},
                                        {label: t('total'), value: `${doc.currency_code} ${formatDecimal(doc.total_payable)}`},
                                        {label: t('einvUuid'), value: doc.uuid && <span className="font-monospace">{doc.uuid}</span>},
                                        {label: t('einvSubmissionUid'), value: doc.submission_uid && <span className="font-monospace">{doc.submission_uid}</span>},
                                        {label: t('einvReceivedAt'), value: formatDateTime(doc.date_time_received)},
                                        {label: t('einvValidatedAtLabel'), value: formatDateTime(doc.date_time_validated)},
                                        {label: t('einvCancelledAt'), value: formatDateTime(doc.cancelled_at)},
                                        {label: t('einvOriginal'), value: doc.references.map(r => r.ref_doc_number + (r.ref_uuid && r.ref_uuid !== "NA" ? ` (${r.ref_uuid})` : "")).join(", ")},
                                    ]} />
                                </Card.Body>
                            </Card>

                            <Card className="card-border mb-3">
                                <Card.Header className="fw-semibold">{t('einvValidation')}</Card.Header>
                                <Card.Body className="p-0">
                                    {doc.validations.length === 0
                                        ? <p className="text-muted small p-3 mb-0">{t('einvNoValidationYet')}</p>
                                        : (
                                            <Table size="sm" className="mb-0">
                                                <tbody>
                                                    {(invalidSteps.length ? invalidSteps : doc.validations).map(step => (
                                                        <tr key={step.id}>
                                                            <td className="ps-3">{step.step_name}</td>
                                                            <td><Badge bg="light" className={step.step_status === "Valid" ? "badge-soft-success" : "badge-soft-danger"}>{step.step_status}</Badge></td>
                                                            <td className="small text-danger pe-3">{step.error_message}{step.error_target && <span className="text-muted"> · {step.error_target}</span>}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        )}
                                </Card.Body>
                            </Card>

                            {doc.doc_hash && (
                                <div className="mb-3">
                                    <Button variant="link" size="sm" className="px-0" onClick={showPayload}>
                                        <Code size={14} className="me-1" />{payload ? t('einvHidePayload') : t('einvShowPayload')}
                                    </Button>
                                    {payload && <pre className="bg-light border rounded p-2 small" style={{maxHeight: 420, overflow: "auto"}}>{payload}</pre>}
                                </div>
                            )}
                        </Col>
                        <Col lg={5}>
                            <Card className="card-border mb-3">
                                <Card.Header className="fw-semibold">{t('einvHistory')}</Card.Header>
                                <Card.Body className="p-0">
                                    <Table size="sm" className="mb-0">
                                        <tbody>
                                            {doc.status_logs.map(log => (
                                                <tr key={log.id}>
                                                    <td className="ps-3 small text-muted text-nowrap">{formatDateTime(log.created_at)}</td>
                                                    <td className="small">
                                                        <span className="fw-semibold">{log.event_type}</span>
                                                        {log.to_status && <> → {t(`einvStatus_${log.to_status}`)}</>}
                                                        {log.actor && <span className="text-muted"> · {log.actor}</span>}
                                                        {log.remarks && <div className="text-muted text-break">{log.remarks}</div>}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>

                            {doc.revisions.length > 1 && (
                                <Card className="card-border mb-3">
                                    <Card.Header className="fw-semibold">{t('einvRevisions')}</Card.Header>
                                    <Card.Body className="p-0">
                                        <Table size="sm" className="mb-0">
                                            <tbody>
                                                {doc.revisions.map(r => (
                                                    <tr key={r.id} className={r.id === doc.id ? "table-active" : undefined}>
                                                        <td className="ps-3"><Link to={`${EINVOICE_DOCUMENTS_PATH}/${r.id}`}>r{r.revision_no}</Link></td>
                                                        <td><EinvoiceStatusBadge status={r.process_status} /></td>
                                                        <td className="small font-monospace">{r.uuid}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </Card.Body>
                                </Card>
                            )}
                        </Col>
                    </Row>
                </div>
            </SimpleBar>
        </div>
    );
}
