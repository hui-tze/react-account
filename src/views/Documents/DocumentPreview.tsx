import {MouseEvent, ReactNode, useState} from "react";
import {Button, Modal, Spinner, Table} from "react-bootstrap";
import {
    BookOpen, Calendar, CheckCircle, Clock, CreditCard, ExternalLink, FileText, MapPin, Printer, Repeat, ShieldOff, ShoppingCart, Truck, User, X,
} from "react-feather";
import {Link} from "@/components/Access/Guarded";
import classNames from "classnames";
import {formatDate, formatPercent, formatQuantity, formatRate, isIsoDate} from "@/utils/display-format";
import type {EinvoiceProcessStatus} from "@/apis/models/einvoice";
import {documentViewApi, DocumentView, DocumentViewLine, PREVIEWABLE_TYPES} from "@/apis/requests/document-view-api";
import {ConditionalError} from "@/components/Display/ErrorBoundary";
import {useNotification} from "@/hooks/notification";
import {useSmartTranslation} from "@/hooks/use-translation";
import {formatDecimal} from "@/views/Inventory/shared/options";
import {EinvoiceStatusBadge, EnvironmentBadge, formatDateTime} from "@/views/Einvoice/shared/einvoice-ui";
import {EINVOICE_DOCUMENTS_PATH} from "@/views/Einvoice/einvoice-menu";
import {ledgerDocumentPath} from "@/views/GeneralLedger/gl-menu";
import {DimensionTagsText} from "@/views/Dimensions/shared/DimensionFields";
import {useAccess} from "@/providers/access";
import {DOCUMENT_TYPE_MODULES} from "@/constants/permissions";

// translation key of each field / column / total the backend names
const LABEL_KEYS: Record<string, string> = {
    date: 'date', due_date: 'dueDate', valid_until: 'validUntil', required_by: 'requiredBy', expected_delivery: 'expectedDelivery',
    customer_po_no: 'customerPoNo', source: 'docSourceDocument', salesperson: 'salesPerson', warehouse: 'warehouse',
    currency: 'currency', exchange_rate: 'exchangeRate', tax_included: 'pricesIncludeTax', supplier_invoice_no: 'supplierInvoiceNo',
    purchase_order: 'purchaseOrder', bank_account: 'bankAccount', from_bank_account: 'fromBankAccount', to_bank_account: 'toBankAccount',
    payment_reference: 'docPaymentReference', source_reference: 'sourceReference',
    remarks: 'remarks', internal_notes: 'internalNoteNotPrinted', memo: 'memo',
    subtotal: 'subtotal', discount: 'discount', tax: 'tax', total: 'total', paid: 'paid', balance_due: 'balanceDue',
    amount_paid: 'amount', bank_charge: 'bankCharge', unallocated: 'unallocated', amount: 'amount', amount_received: 'amountReceived',
    total_debit: 'totalDebit', total_credit: 'totalCredit',
    pos: 'posCounter', payment_method: 'posPaymentMethod', tendered: 'posCashReceived', change: 'posChangeLabel',
    no: '#', item: 'item', description: 'description', quantity: 'qty', uom: 'uom', unit_price: 'unitPrice',
    account: 'account', dimensions: 'dimensions', debit: 'debit', credit: 'credit',
};
const NUMERIC = ["quantity", "unit_price", "discount", "tax", "amount", "debit", "credit"];
// shown in the header strip instead of the details grid
const HEADLINE_DATES = ["date", "due_date"];

/** Look of a document family: icon and accent colour of the header. */
function familyOf(type: string): {icon: ReactNode, tone: string} {
    if (type === "journal_entry") {
        return {icon: <BookOpen size={20} />, tone: "journal"};
    }
    if (["bank_payment", "bank_deposit", "funds_transfer"].includes(type)) {
        return {icon: type === "funds_transfer" ? <Repeat size={20} /> : <CreditCard size={20} />, tone: "bank"};
    }
    if (type === "delivery_note" || type === "purchase_order_delivery") {
        return {icon: <Truck size={20} />, tone: type === "delivery_note" ? "sales" : "purchase"};
    }
    if (["purchase_order", "supplier_bill", "self_billed_invoice", "supplier_credit_note", "self_billed_credit_note", "supplier_payment"].includes(type)) {
        return {icon: <ShoppingCart size={20} />, tone: "purchase"};
    }
    return {icon: <FileText size={20} />, tone: "sales"};
}

/** Colour of a document state. */
function stateTone(state: string | null, voided: boolean): string {
    if (voided) {
        return "danger";
    }
    if (!state) {
        return "neutral";
    }
    if (/overdue|reject|cancel/.test(state)) {
        return "danger";
    }
    if (/partial|unallocated|pending/.test(state)) {
        return "warning";
    }
    if (/paid|complete|closed|billed|invoiced|delivered|received|converted|allocated|applied/.test(state)) {
        return "success";
    }
    return "info";
}

/** Colour of a MyInvois status. */
const einvoiceTone = (status: string | null) =>
    status === "VALID" ? "success" : status === "INVALID" || status === "FAILED" ? "danger" : status === "CANCELLED" ? "neutral" : "warning";

/** Opens the document's PDF in a new tab (or downloads it if the browser blocks the tab). */
export function usePrintDocument() {
    const notify = useNotification();
    const [printing, setPrinting] = useState(false);

    const print = async (type: string, id: number, reference: string | null) => {
        // open the tab inside the click, before the await, so popup blockers allow it
        const tab = window.open("", "_blank");
        setPrinting(true);
        try {
            const url = URL.createObjectURL(await documentViewApi.pdf(type, id));
            if (tab) {
                tab.location.href = url;
            } else {
                const a = document.createElement("a");
                a.href = url;
                a.download = `${reference ?? type}.pdf`;
                a.click();
            }
            // let the tab load it before the URL goes away
            setTimeout(() => URL.revokeObjectURL(url), 60_000);
        } catch (e) {
            tab?.close();
            notify.error(e);
        } finally {
            setPrinting(false);
        }
    };

    return {print, printing};
}

function Section({title, icon, children, className}: {title: string, icon?: ReactNode, children: ReactNode, className?: string}) {
    return (
        <section className={classNames("dp-section", className)}>
            <h6 className="dp-section-title">{icon}{title}</h6>
            {children}
        </section>
    );
}

/** Coloured header: what the document is, its state and its headline amount. */
function Hero({doc, onClose}: {doc: DocumentView, onClose: () => void}) {
    const {t} = useSmartTranslation();
    const family = familyOf(doc.type);
    const voided = doc.status === "inactive";
    const grand = doc.totals.find(r => r.key === "total" || r.key === "amount" || r.key === "amount_paid" || r.key === "total_credit");
    const balance = doc.totals.find(r => r.key === "balance_due");
    const date = doc.dates.find(d => d.key === "date")?.value;
    const due = doc.dates.find(d => d.key === "due_date")?.value;
    const overdue = !!due && !!balance && balance.amount > 0 && due < new Date().toISOString().slice(0, 10);

    return (
        <div className={`dp-hero dp-hero-${family.tone}`}>
            <button type="button" className="dp-hero-close" onClick={onClose} aria-label={t('close')}><X size={18} /></button>
            <div className="dp-hero-main">
                <div className="dp-hero-icon">{family.icon}</div>
                <div className="min-w-0">
                    <div className="dp-hero-type">{doc.type_label}</div>
                    <div className="dp-hero-ref">{doc.reference_no ?? "—"}</div>
                    <div className="d-flex flex-wrap gap-2 mt-2">
                        <span className={`dp-pill dp-pill-${stateTone(doc.state, voided)}`}>
                            {voided ? <ShieldOff size={12} /> : <CheckCircle size={12} />}
                            {voided ? t('voided') : doc.state ? t(`salesState_${doc.state}`, {defaultValue: doc.state.replace(/_/g, " ")}) : t('active')}
                        </span>
                        {doc.einvoice?.process_status && (
                            <span className={`dp-pill dp-pill-${einvoiceTone(doc.einvoice.process_status)}`}>MyInvois · {doc.einvoice.process_status}</span>
                        )}
                    </div>
                </div>
                {grand && (
                    <div className="dp-hero-amount">
                        <div className="dp-hero-amount-label">{LABEL_KEYS[grand.key] ? t(LABEL_KEYS[grand.key]) : grand.key}</div>
                        <div className="dp-hero-amount-value">
                            <span className="dp-hero-currency">{grand.currency ?? doc.currency}</span> {formatDecimal(grand.amount)}
                        </div>
                        {balance && (
                            <div className={classNames("dp-hero-balance", {"is-clear": balance.amount === 0})}>
                                {balance.amount === 0 ? t('fullyPaid') : `${t('balanceDue')} ${formatDecimal(balance.amount)}`}
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="dp-hero-meta">
                {date && <span><Calendar size={13} />{formatDate(date)}</span>}
                {due && <span className={classNames({"is-overdue": overdue})}><Clock size={13} />{t('dueDate')} {formatDate(due)}</span>}
                {doc.party?.name && <span><User size={13} />{doc.party.name}</span>}
            </div>
        </div>
    );
}

/** One line as a card (small screens). */
function LineCard({line, columns, money}: {line: DocumentViewLine, columns: string[], money: (v: number | null | undefined) => string}) {
    const {t} = useSmartTranslation();
    const isJournal = columns.includes("debit");
    const title = line.description ?? line.account ?? line.memo ?? "";

    return (
        <div className="dp-line-card">
            <div className="d-flex gap-2">
                <span className="dp-line-no">{line.no}</span>
                <div className="flex-grow-1 min-w-0">
                    <div className="fw-semibold text-dark text-break">{title}</div>
                    <div className="small text-muted">
                        {[line.item, line.description && line.account, line.description ? null : line.memo !== title ? line.memo : null].filter(Boolean).join(" · ")}
                    </div>
                    {columns.includes("quantity") && (
                        <div className="small mt-1">
                            {formatQuantity(line.quantity ?? 0)} {line.uom ?? ""}
                            {columns.includes("unit_price") && <> × {money(line.unit_price)}</>}
                            {!!line.discount && <span className="text-danger"> − {money(line.discount)}</span>}
                            {!!line.tax && <span className="text-muted"> · {t('tax')} {money(line.tax)}</span>}
                        </div>
                    )}
                    {line.dimensions && line.dimensions.length > 0 && <div className="small mt-1"><DimensionTagsText tags={line.dimensions} empty="" /></div>}
                </div>
                <div className="text-end fw-semibold text-dark text-nowrap">
                    {isJournal
                        ? (line.debit ? <>{money(line.debit)}<div className="small text-muted fw-normal">{t('debit')}</div></> : <>{money(line.credit)}<div className="small text-muted fw-normal">{t('credit')}</div></>)
                        : columns.includes("amount") ? money(line.amount) : null}
                </div>
            </div>
        </div>
    );
}

function Body({doc}: {doc: DocumentView}) {
    const {t} = useSmartTranslation();
    const label = (key: string, fallback?: string) => fallback ?? (LABEL_KEYS[key] ? t(LABEL_KEYS[key]) : key);
    const show = (key: string, value: string) => isIsoDate(value) ? formatDate(value) : key === "exchange_rate" ? formatRate(value) : value;
    const money = (v: number | null | undefined) => (v === null || v === undefined ? "" : formatDecimal(v));
    // optional columns only when some line uses them
    const columns = doc.line_columns.filter(c => !["discount", "tax", "uom", "dimensions"].includes(c)
        || doc.lines.some(l => {
            const v = l[c as keyof typeof l];
            return Array.isArray(v) ? v.length > 0 : !!v;
        }));
    const partyTitle = doc.party?.role === "customer" ? t('billTo') : doc.party?.role === "supplier" ? t('supplier') : t('payee');
    const facts = [...doc.dates.filter(d => !HEADLINE_DATES.includes(d.key)), ...doc.facts];
    const einv = doc.einvoice;

    return (
        <>
            {doc.status === "inactive" && (
                <div className="dp-void"><ShieldOff size={16} /><span>{t('docVoided')}{doc.void_reason && <> — {doc.void_reason}</>}</span></div>
            )}

            {(doc.party || doc.ship_to) && (
                <div className="dp-parties">
                    {doc.party && (
                        <div className="dp-card">
                            <div className="dp-card-label"><User size={13} />{partyTitle}</div>
                            <div className="dp-card-title">{doc.party.name}</div>
                            {doc.party.branch && <div className="small">{doc.party.branch}</div>}
                            {doc.party.address.length > 0 && <div className="small text-muted mt-1">{doc.party.address.join(", ")}</div>}
                            {(doc.party.tin || doc.party.registration_no) && (
                                <div className="d-flex flex-wrap gap-2 mt-2">
                                    {doc.party.tin && <span className="dp-tag">{t('tin')} {doc.party.tin}</span>}
                                    {doc.party.registration_no && <span className="dp-tag">{t('registrationNo')} {doc.party.registration_no}</span>}
                                </div>
                            )}
                        </div>
                    )}
                    {doc.ship_to && (
                        <div className="dp-card">
                            <div className="dp-card-label"><MapPin size={13} />{t('deliverTo')}</div>
                            {doc.ship_to.name && <div className="dp-card-title">{doc.ship_to.name}</div>}
                            {doc.ship_to.attention && <div className="small">{t('attention')}: {doc.ship_to.attention}</div>}
                            {doc.ship_to.address.length > 0 && <div className="small text-muted mt-1">{doc.ship_to.address.join(", ")}</div>}
                            {doc.ship_to.contact && <div className="small text-muted">{doc.ship_to.contact}</div>}
                        </div>
                    )}
                </div>
            )}

            {(facts.length > 0 || doc.dimensions.length > 0) && (
                <div className="dp-facts">
                    {facts.map(f => (
                        <div key={f.key} className="dp-fact">
                            <div className="dp-fact-label">{label(f.key)}</div>
                            <div className="dp-fact-value">{show(f.key, f.value)}</div>
                        </div>
                    ))}
                    {doc.dimensions.map(d => (
                        <div key={d.dimension} className="dp-fact">
                            <div className="dp-fact-label">{d.dimension}</div>
                            <div className="dp-fact-value"><span className="dp-dim" title={d.name}>{d.code}</span> <span className="small text-muted">{d.name}</span></div>
                        </div>
                    ))}
                </div>
            )}

            {columns.length > 0 && doc.lines.length > 0 && (
                <Section title={`${t('lineItems')} · ${doc.lines.length}`}>
                    {/* table on wide screens */}
                    <div className="table-responsive d-none d-md-block dp-lines">
                        <Table size="sm" className="mb-0">
                            <thead>
                                <tr>{columns.map(c => <th key={c} className={NUMERIC.includes(c) ? "text-end" : undefined}>{label(c)}</th>)}</tr>
                            </thead>
                            <tbody>
                                {doc.lines.map(line => (
                                    <tr key={line.no}>
                                        {columns.map(c => {
                                            const v = line[c as keyof typeof line];
                                            return (
                                                <td key={c} className={classNames({"text-end text-nowrap": NUMERIC.includes(c), "text-muted": c === "no", "fw-semibold text-dark": c === "amount"})}>
                                                    {c === "quantity" ? formatQuantity(v as number)
                                                        : c === "dimensions" ? <span className="small"><DimensionTagsText tags={line.dimensions} empty="" /></span>
                                                            : NUMERIC.includes(c) ? money(v as number | null)
                                                                : (v as ReactNode) ?? ""}
                                                    {c === "discount" && line.discount_percent ? <div className="small text-muted">{formatPercent(line.discount_percent)}%</div> : null}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                    {/* cards on phones */}
                    <div className="d-md-none dp-line-cards">
                        {doc.lines.map(line => <LineCard key={line.no} line={line} columns={columns} money={money} />)}
                    </div>
                </Section>
            )}

            <div className="dp-bottom">
                <div className="dp-bottom-side">
                    {doc.payments.length > 0 && (
                        <Section title={doc.party?.role === "supplier" ? t('paymentsMade') : t('paymentsReceived')} icon={<CreditCard size={13} />}>
                            <div className="dp-list">
                                {doc.payments.map(p => (
                                    <div key={`${p.type}-${p.id}`} className={classNames("dp-list-row dp-payment", {"is-voided": p.voided})}>
                                        <div className="dp-payment-date">
                                            <div className="fw-semibold text-dark">{formatDate(p.date)}</div>
                                            {p.applied_on && p.applied_on !== p.date && <div className="small text-muted">{t('appliedOn', {date: formatDate(p.applied_on)})}</div>}
                                        </div>
                                        <div className="flex-grow-1 min-w-0">
                                            <DocRef type={p.type} id={p.id} reference={p.reference_no} />
                                            <span className="dp-tag ms-2">{p.type_label}</span>
                                            {(p.payment_ref || p.bank_account) && (
                                                <div className="small text-muted text-truncate">{[p.payment_ref && `${t('refShort')} ${p.payment_ref}`, p.bank_account].filter(Boolean).join(" · ")}</div>
                                            )}
                                        </div>
                                        <div className="fw-semibold text-success text-nowrap">{formatDecimal(p.amount)}</div>
                                    </div>
                                ))}
                                {doc.payments.length > 1 && (
                                    <div className="dp-list-row dp-payment-total">
                                        <span>{t('totalPaid')}</span>
                                        <span>{doc.currency} {formatDecimal(doc.payments.filter(p => !p.voided).reduce((s, p) => s + p.amount, 0))}</span>
                                    </div>
                                )}
                            </div>
                        </Section>
                    )}
                    {doc.allocations.length > 0 && (
                        <Section title={t('appliedTo')}>
                            <div className="dp-list">
                                {doc.allocations.map((a, i) => (
                                    <div key={i} className="dp-list-row">
                                        <div className="min-w-0">
                                            {a.type && a.id ? <DocRef type={a.type} id={a.id} reference={a.reference_no} /> : <span className="fw-semibold">{a.reference_no}</span>}
                                            <div className="small text-muted">{formatDate(a.date)}</div>
                                        </div>
                                        <div className="fw-semibold text-dark">{formatDecimal(a.amount)}</div>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )}
                    {doc.notes.map(note => (
                        <div key={note.key} className="dp-note">
                            <div className="dp-card-label">{label(note.key)}</div>
                            <div className="small" style={{whiteSpace: "pre-line"}}>{note.value}</div>
                        </div>
                    ))}
                </div>

                {doc.totals.length > 0 && (
                    <div className="dp-totals">
                        {doc.totals.map((row, i) => (
                            <div key={`${row.key}-${i}`} className={classNames("dp-total-row", {"is-grand": row.strong, "is-negative": row.amount < 0})}>
                                <span>{label(row.key, row.label)}</span>
                                <span>{row.strong && <small>{row.currency ?? doc.currency ?? ""} </small>}{formatDecimal(row.amount)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {einv && (
                <div className={`dp-einvoice dp-einvoice-${einvoiceTone(einv.process_status)}`}>
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                        <span className="dp-einvoice-mark">e</span>
                        <span className="fw-semibold text-dark">{t('myInvois')}</span>
                        <EinvoiceStatusBadge status={einv.process_status as EinvoiceProcessStatus} />
                        <EnvironmentBadge environment={einv.environment} />
                        {einv.revision_no > 1 && <span className="dp-tag">{t('einvRevision', {no: einv.revision_no})}</span>}
                        {einv.consolidated && <span className="dp-tag">{t('posInConsolidated')} {einv.doc_number}</span>}
                        <Link to={`${EINVOICE_DOCUMENTS_PATH}/${einv.id}`} className="small ms-auto">{t('einvOpenRecord')} →</Link>
                    </div>
                    <div className="dp-facts dp-facts-compact">
                        {einv.uuid && <div className="dp-fact dp-fact-wide"><div className="dp-fact-label">{t('einvUuid')}</div><div className="dp-fact-value dp-mono">{einv.uuid}</div></div>}
                        {einv.long_id && <div className="dp-fact dp-fact-wide"><div className="dp-fact-label">{t('einvLongId')}</div><div className="dp-fact-value dp-mono">{einv.long_id}</div></div>}
                        {einv.submission_uid && <div className="dp-fact dp-fact-wide"><div className="dp-fact-label">{t('einvSubmissionUid')}</div><div className="dp-fact-value dp-mono">{einv.submission_uid}</div></div>}
                        {einv.date_time_received && <div className="dp-fact"><div className="dp-fact-label">{t('einvReceivedAt')}</div><div className="dp-fact-value">{formatDateTime(einv.date_time_received)}</div></div>}
                        {einv.date_time_validated && <div className="dp-fact"><div className="dp-fact-label">{t('einvValidatedAtLabel')}</div><div className="dp-fact-value">{formatDateTime(einv.date_time_validated)}</div></div>}
                        {einv.cancel_deadline_at && !einv.cancelled_at && <div className="dp-fact"><div className="dp-fact-label">{t('einvCancelBy')}</div><div className="dp-fact-value">{formatDateTime(einv.cancel_deadline_at)}</div></div>}
                        {einv.cancelled_at && <div className="dp-fact"><div className="dp-fact-label">{t('einvCancelledAt')}</div><div className="dp-fact-value">{formatDateTime(einv.cancelled_at)}</div></div>}
                    </div>
                    {einv.last_error_message && <div className="dp-einvoice-error">{einv.last_error_message}</div>}
                    {einv.validation_link && (
                        <a href={einv.validation_link} target="_blank" rel="noreferrer" className="btn btn-success btn-sm mt-3">
                            <ExternalLink size={14} className="me-1" />{t('einvValidationLink')}
                        </a>
                    )}
                </div>
            )}
        </>
    );
}

/** Popup with everything about a document (lines, totals, dimensions, MyInvois) and a Print → PDF button. */
export function DocumentPreviewModal({type, id, onClose}: {type: string, id: number, onClose: () => void}) {
    const {t} = useSmartTranslation();
    const {data, error} = documentViewApi.useView(type, id);
    const {print, printing} = usePrintDocument();
    const openPath = ledgerDocumentPath(type, id);

    return (
        <Modal show onHide={onClose} size="xl" centered scrollable fullscreen="md-down" className="dp-modal">
            {data ? <Hero doc={data} onClose={onClose} /> : (
                <Modal.Header closeButton><Modal.Title as="h5">{t('loading')}</Modal.Title></Modal.Header>
            )}
            <Modal.Body>
                {error ? <ConditionalError error={error} /> : !data ? <div className="loader-pendulums my-5" /> : <Body doc={data} />}
            </Modal.Body>
            <Modal.Footer className="dp-footer">
                {openPath && <Link to={openPath} className="btn btn-outline-secondary dp-footer-open" onClick={onClose}>{t('openDocument')}</Link>}
                <Button variant="light" className="d-none d-md-inline-block" onClick={onClose}>{t('close')}</Button>
                <Button className="dp-footer-print" onClick={() => void print(type, id, data?.reference_no ?? null)} disabled={printing || !data}>
                    {printing ? <Spinner size="sm" className="me-2" /> : <Printer size={15} className="me-2" />}{t('printPdf')}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

/**
 * A document's reference number that opens its preview. Inside clickable list rows it stops
 * the row's own click. Types the preview can't show stay plain text.
 */
export function DocRef({type, id, reference, className}: {type: string | null | undefined, id: number | null | undefined, reference: ReactNode, className?: string}) {
    const [open, setOpen] = useState(false);
    const {canModule} = useAccess();
    // documents the user's role can't open stay plain text
    if (!type || !id || !PREVIEWABLE_TYPES.includes(type) || (DOCUMENT_TYPE_MODULES[type] && !canModule(DOCUMENT_TYPE_MODULES[type]))) {
        return <span className={className ?? "fw-semibold text-dark"}>{reference}</span>;
    }
    const click = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setOpen(true);
    };
    return (
        <>
            <a href="#" role="button" className={className ?? "fw-semibold doc-ref-link"} onClick={click}>{reference}</a>
            {open && (
                // keep clicks inside the popup from reaching the row underneath (React bubbles through portals)
                <span onClick={(e) => e.stopPropagation()}>
                    <DocumentPreviewModal type={type} id={id} onClose={() => setOpen(false)} />
                </span>
            )}
        </>
    );
}
