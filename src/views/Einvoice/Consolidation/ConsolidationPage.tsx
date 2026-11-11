import {useState} from "react";
import {Alert, Badge, Button, Card, Col, Form, Modal, Row, Spinner, Table} from "react-bootstrap";
import {AlertTriangle, ExternalLink, Layers, RefreshCw, Send, XCircle} from "react-feather";
import {useSearchParams} from "react-router-dom";
import SimpleBar from "simplebar-react";
import moment from "moment";
import {useSWRConfig} from "swr";
import {ActionButton, Link} from "@/components/Access/Guarded";
import type {ConsolidationBatch, ConsolidationMonth, ConsolidationSource} from "@/apis/models/pos";
import {consolidationApi} from "@/apis/requests/pos-api";
import {ConditionalError} from "@/components/Display/ErrorBoundary";
import {DocRef} from "@/views/Documents/DocumentPreview";
import {formatDecimal} from "@/views/Inventory/shared/options";
import {formatDate} from "@/utils/display-format";
import {useConfirmAction} from "@/hooks/use-confirmation-action";
import {useNotification} from "@/hooks/notification";
import {useSmartTranslation} from "@/hooks/use-translation";
import {EINVOICE_DOCUMENTS_PATH} from "../einvoice-menu";
import {EinvoiceStatusBadge} from "../shared/einvoice-ui";
import type {EinvoiceProcessStatus} from "@/apis/models/einvoice";

const SOURCES: ConsolidationSource[] = ["pos_receipt", "pos_credit_note"];

// refresh the overview and anything e-invoice after an action
function useRefresh() {
    const {mutate} = useSWRConfig();
    return () => mutate((key) => typeof key === "string" && (key.includes("/einvoice/") || key.includes("/pos-")), undefined, {revalidate: true});
}

/**
 * Monthly consolidated e-invoices of POS sales (LHDN MyInvois): receipts whose buyer didn't ask
 * for an e-invoice go into one consolidated invoice per month, refunds into one consolidated
 * credit note, due within 7 days after the month ends.
 */
export function ConsolidationPage() {
    const {t} = useSmartTranslation();
    const [search, setSearch] = useSearchParams();
    const year = Number(search.get("year")) || moment().year();
    const batchId = Number(search.get("batch")) || null;
    const {data, error, isLoading} = consolidationApi.useOverview(year);
    const [preview, setPreview] = useState<{period: string, source: ConsolidationSource} | null>(null);

    const setParam = (key: string, value: string | null) => setSearch(prev => {
        const next = new URLSearchParams(prev);
        value ? next.set(key, value) : next.delete(key);
        return next;
    });

    if (error) {
        return <ConditionalError error={error} />;
    }

    const months = (data?.months ?? []).filter(m => m.has_activity || m.period === moment().subtract(1, "month").format("YYYY-MM"));

    return (
        <div className="hk-pg-body">
            <SimpleBar className="nicescroll-bar">
                <div className="container-xxl py-4">
                    <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                        <div>
                            <h5 className="mb-1">{t('consTitle')}</h5>
                            <div className="small text-muted">{t('consIntro')}</div>
                        </div>
                        <Form.Select value={year} onChange={(e) => setParam("year", e.target.value)} className="ms-auto" style={{width: 120}} aria-label={t('year')}>
                            {[0, 1, 2].map(n => moment().year() - n).map(y => <option key={y} value={y}>{y}</option>)}
                        </Form.Select>
                    </div>

                    <Alert variant="light" className="border small">
                        <div className="fw-semibold mb-1">{t('consRulesTitle')}</div>
                        <ul className="mb-0 ps-3">
                            <li>{t('consRuleMonthly')}</li>
                            <li>{t('consRuleOverLimit')}</li>
                            <li>{t('consRuleAuto')}</li>
                        </ul>
                    </Alert>

                    {isLoading && !data ? <div className="loader-pendulums my-5" /> : months.length === 0 ? (
                        <Card className="card-border"><Card.Body className="text-center text-muted py-5">{t('consNothing', {year})}</Card.Body></Card>
                    ) : months.map(month => (
                        <MonthCard key={month.period} month={month} onConsolidate={(source) => setPreview({period: month.period, source})} onOpenBatch={(id) => setParam("batch", String(id))} />
                    ))}
                </div>
            </SimpleBar>

            {preview && <PreviewModal period={preview.period} source={preview.source} onClose={() => setPreview(null)} />}
            {batchId && <BatchModal id={batchId} onClose={() => setParam("batch", null)} />}
        </div>
    );
}

function monthLabel(period: string): string {
    return moment(`${period}-01`).format("MMMM YYYY");
}

function MonthCard({month, onConsolidate, onOpenBatch}: {month: ConsolidationMonth, onConsolidate: (source: ConsolidationSource) => void, onOpenBatch: (id: number) => void}) {
    const {t} = useSmartTranslation();
    const ended = moment(`${month.period}-01`).endOf("month").isBefore(moment().startOf("day"));

    return (
        <Card className="card-border mb-3">
            <Card.Header className="d-flex flex-wrap align-items-center gap-2">
                <span className="fw-semibold text-dark">{monthLabel(month.period)}</span>
                <span className="small text-muted">{t('consDueBy', {date: formatDate(month.deadline)})}</span>
                {!ended && <Badge bg="light" text="dark" className="border fw-normal">{t('consMonthOpen')}</Badge>}
                {month.overdue && <Badge bg="danger" className="fw-normal"><AlertTriangle size={12} className="me-1" />{t('consOverdue')}</Badge>}
            </Card.Header>
            <Card.Body>
                <Row className="g-4">
                    {SOURCES.map(source => {
                        const kind = month.kinds[source];
                        return (
                            <Col lg={6} key={source}>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <Layers size={15} className="text-muted" />
                                    <span className="fw-semibold">{t(source === "pos_receipt" ? 'consInvoiceKind' : 'consCreditKind')}</span>
                                </div>

                                {kind.pending_count > 0 ? (
                                    <div className="d-flex flex-wrap align-items-center gap-2 p-2 rounded bg-light mb-2">
                                        <span className="small">{t('consPending', {count: kind.pending_count, total: formatDecimal(kind.pending_total)})}</span>
                                        {ended ? (
                                            <ActionButton action="create" size="sm" className="ms-auto" onClick={() => onConsolidate(source)}>
                                                <Send size={13} className="me-1" />{t('consReview')}
                                            </ActionButton>
                                        ) : <span className="small text-muted ms-auto">{t('consAfterMonthEnds')}</span>}
                                    </div>
                                ) : !kind.batches.length && <div className="small text-muted mb-2">{t('consNoneThisMonth')}</div>}

                                {kind.batches.map(batch => <BatchRow key={batch.id} batch={batch} onOpen={() => onOpenBatch(batch.id)} />)}
                            </Col>
                        );
                    })}
                </Row>
            </Card.Body>
        </Card>
    );
}

/** One consolidated e-invoice: number, documents, total, LHDN state and what can be done with it. */
function BatchRow({batch, onOpen}: {batch: ConsolidationBatch, onOpen: () => void}) {
    const {t} = useSmartTranslation();
    const notify = useNotification();
    const refresh = useRefresh();
    const {confirmAndExecute} = useConfirmAction();
    const [busy, setBusy] = useState(false);
    const einv = batch.einvoice;

    const run = async (action: () => Promise<unknown>, done: string) => {
        setBusy(true);
        try {
            await action();
            notify.success(done);
        } catch (err) {
            notify.error(err);
        } finally {
            setBusy(false);
            await refresh();
        }
    };

    return (
        <div className="border rounded p-2 mb-2">
            <div className="d-flex flex-wrap align-items-center gap-2">
                <a href="#" role="button" className="fw-semibold" onClick={(e) => { e.preventDefault(); onOpen(); }}>{batch.doc_number}</a>
                {batch.supplementary && <Badge bg="light" text="dark" className="border fw-normal">{t('consSupplementary')}</Badge>}
                <EinvoiceStatusBadge status={(einv?.process_status ?? null) as EinvoiceProcessStatus | null} />
                <span className="small text-muted ms-auto">{t('consBatchSummary', {count: batch.count, total: formatDecimal(batch.total)})}</span>
            </div>
            {batch.from && <div className="small text-muted">{batch.from}{batch.to && batch.to !== batch.from ? ` – ${batch.to}` : ""}</div>}
            {einv?.last_error_message && batch.status === "OPEN" && <div className="small text-danger mt-1">{einv.last_error_message}</div>}
            <div className="d-flex flex-wrap gap-2 mt-2">
                {einv && <Link to={`${EINVOICE_DOCUMENTS_PATH}/${einv.id}`} className="btn btn-sm btn-outline-secondary">{t('einvOpenRecord')}</Link>}
                {einv?.validation_link && (
                    <a href={einv.validation_link} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-success"><ExternalLink size={13} className="me-1" />{t('einvValidationLink')}</a>
                )}
                {batch.status === "OPEN" && (
                    <>
                        <ActionButton action="edit" size="sm" variant="primary" disabled={busy}
                            onClick={() => run(() => consolidationApi.resubmit(batch.id), t('consSubmitted', {number: batch.doc_number}))}>
                            {busy ? <Spinner size="sm" className="me-1" /> : <RefreshCw size={13} className="me-1" />}{einv ? t('consResubmit') : t('consSubmit')}
                        </ActionButton>
                        <ActionButton action="edit" size="sm" variant="outline-danger" disabled={busy}
                            onClick={() => confirmAndExecute(() => run(() => consolidationApi.release(batch.id), t('consReleased')), {text: t('consReleaseText', {number: batch.doc_number})})}>
                            <XCircle size={13} className="me-1" />{t('consRelease')}
                        </ActionButton>
                    </>
                )}
            </div>
        </div>
    );
}

/** What would go into the month's consolidated e-invoice, then build and submit it. */
function PreviewModal({period, source, onClose}: {period: string, source: ConsolidationSource, onClose: () => void}) {
    const {t} = useSmartTranslation();
    const notify = useNotification();
    const refresh = useRefresh();
    const {data, error} = consolidationApi.usePreview(period, source);
    const [busy, setBusy] = useState(false);

    const submit = async () => {
        setBusy(true);
        try {
            const batch = await consolidationApi.consolidate(period, source);
            if (batch.status === "SUBMITTED") {
                notify.success(t('consSubmitted', {number: batch.doc_number}));
            } else {
                notify.error(batch.einvoice?.last_error_message ?? t('consNotAccepted', {number: batch.doc_number}));
            }
            onClose();
        } catch (err) {
            notify.error(err);
        } finally {
            setBusy(false);
            await refresh();
        }
    };

    return (
        <Modal show onHide={onClose} size="lg" scrollable>
            <Modal.Header closeButton>
                <Modal.Title as="h6">{t(source === "pos_receipt" ? 'consInvoiceKind' : 'consCreditKind')} · {monthLabel(period)}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error ? <ConditionalError error={error} /> : !data ? <div className="loader-pendulums my-4" /> : (
                    <>
                        <Row className="g-3 mb-3">
                            <Col sm={4}><div className="small text-muted">{t('consDocuments')}</div><div className="fw-semibold fs-5">{data.count}</div></Col>
                            <Col sm={4}><div className="small text-muted">{t('tax')}</div><div className="fw-semibold fs-5">{formatDecimal(data.total_tax)}</div></Col>
                            <Col sm={4}><div className="small text-muted">{t('total')}</div><div className="fw-semibold fs-5">MYR {formatDecimal(data.total)}</div></Col>
                        </Row>
                        <div className="small text-muted mb-2">{t('consPreviewHint')}</div>
                        <DocumentsTable documents={data.documents} />
                    </>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="light" onClick={onClose}>{t('cancel')}</Button>
                <ActionButton action="create" onClick={submit} disabled={busy || !data?.count}>
                    {busy ? <Spinner size="sm" className="me-1" /> : <Send size={14} className="me-1" />}{t('consSubmitToLhdn')}
                </ActionButton>
            </Modal.Footer>
        </Modal>
    );
}

function BatchModal({id, onClose}: {id: number, onClose: () => void}) {
    const {t} = useSmartTranslation();
    const {data, error} = consolidationApi.useBatch(id);

    return (
        <Modal show onHide={onClose} size="lg" scrollable>
            <Modal.Header closeButton>
                <Modal.Title as="h6">{data ? `${data.doc_number} · ${monthLabel(data.period)}` : t('loading')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error ? <ConditionalError error={error} /> : !data ? <div className="loader-pendulums my-4" /> : (
                    <>
                        <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                            <EinvoiceStatusBadge status={(data.einvoice?.process_status ?? null) as EinvoiceProcessStatus | null} />
                            <span className="small text-muted">{t('consBatchSummary', {count: data.count, total: formatDecimal(data.total)})}</span>
                            {data.einvoice?.uuid && <span className="small text-muted text-truncate">{t('einvUuid')} {data.einvoice.uuid}</span>}
                        </div>
                        <DocumentsTable documents={data.documents ?? []} />
                    </>
                )}
            </Modal.Body>
        </Modal>
    );
}

function DocumentsTable({documents}: {documents: NonNullable<ConsolidationBatch["documents"]>}) {
    const {t} = useSmartTranslation();
    return (
        <div className="table-responsive">
            <Table size="sm" className="mb-0">
                <thead className="table-light">
                    <tr>
                        <th>{t('date')}</th>
                        <th>{t('referenceNo')}</th>
                        <th>{t('posCounter')}</th>
                        <th className="text-end">{t('tax')}</th>
                        <th className="text-end">{t('total')}</th>
                    </tr>
                </thead>
                <tbody>
                    {documents.map(doc => (
                        <tr key={`${doc.type}-${doc.id}`}>
                            <td>{formatDate(doc.date)}</td>
                            <td><DocRef type={doc.type} id={doc.id} reference={doc.reference_no} /></td>
                            <td className="text-muted">{doc.pos ?? "-"}</td>
                            <td className="text-end">{formatDecimal(doc.tax)}</td>
                            <td className="text-end">{formatDecimal(doc.total)}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}
