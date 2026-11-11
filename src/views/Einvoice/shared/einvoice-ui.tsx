import {Badge, Button, Card, Spinner} from "react-bootstrap";
import {ExternalLink, RefreshCw, Send, XCircle} from "react-feather";
import {Link} from "@/components/Access/Guarded";
import moment from "moment";
import Swal from "sweetalert2";
import {useState} from "react";
import type {EinvoiceDocument, EinvoiceProcessStatus, EinvoiceTransType} from "@/apis/models/einvoice";
import {einvoiceDocumentApi} from "@/apis/requests/einvoice-api";
import {useNotification} from "@/hooks/notification";
import {useConfirmAction} from "@/hooks/use-confirmation-action";
import {useSmartTranslation} from "@/hooks/use-translation";
import {EINVOICE_DOCUMENTS_PATH} from "../einvoice-menu";
import {useAccess} from "@/providers/access";
import {formatDateTime as formatCompanyDateTime} from "@/utils/display-format";

const TINTS: Record<EinvoiceProcessStatus, string> = {
    PENDING: "badge-soft-secondary",
    SUBMITTING: "badge-soft-info",
    SUBMITTED: "badge-soft-info",
    VALID: "badge-soft-success",
    INVALID: "badge-soft-danger",
    CANCELLED: "badge-soft-secondary",
    FAILED: "badge-soft-danger",
    EXCLUDED: "badge-soft-secondary",
};

export function EinvoiceStatusBadge({status}: {status: EinvoiceProcessStatus | null | undefined}) {
    const {t} = useSmartTranslation();
    if (!status) {
        return <Badge bg="light" className="badge-soft-secondary">{t('einvStatus_NONE')}</Badge>;
    }
    return <Badge bg="light" className={TINTS[status] ?? "badge-soft-secondary"}>{t(`einvStatus_${status}`)}</Badge>;
}

export function EnvironmentBadge({environment}: {environment: string | null | undefined}) {
    const {t} = useSmartTranslation();
    if (!environment) {
        return null;
    }
    return environment === "PROD"
        ? <Badge bg="light" className="badge-soft-success">{t('einvEnvironment_PROD')}</Badge>
        : <Badge bg="light" className="badge-soft-warning">{t('einvEnvironment_SANDBOX')}</Badge>;
}

// stored in UTC; shown in the browser's time zone
export function formatDateTime(value: string | null | undefined): string {
    return value ? formatCompanyDateTime(moment.utc(value).toDate(), "") : "";
}

/** Submit / refresh / cancel with toasts; `after` reloads whatever shows the document. */
export function useEinvoiceActions(after: () => Promise<unknown>) {
    const {t} = useSmartTranslation();
    const notify = useNotification();
    const {confirmAndExecute} = useConfirmAction();
    const [busy, setBusy] = useState(false);

    const run = async (action: () => Promise<unknown>, done: (result: unknown) => string | null) => {
        setBusy(true);
        try {
            const result = await action();
            const message = done(result);
            if (message) {
                notify.success(message);
            }
            await after();
        } catch (err) {
            notify.error(err);
        } finally {
            setBusy(false);
        }
    };

    // the submit endpoint answers 200 even when a document failed preparation — report that instead
    const reportSubmitted = (docs: EinvoiceDocument[]) => {
        const failed = docs.filter(d => d.process_status === "FAILED" || d.process_status === "INVALID");
        if (failed.length) {
            notify.error(failed.map(d => `${d.doc_number}: ${d.last_error_message ?? t(`einvStatus_${d.process_status}`)}`).join("\n"));
            return null;
        }
        return t('einvSubmittedCount', {count: docs.length});
    };

    return {
        busy,
        submit: (documents: {trans_type: EinvoiceTransType, trans_id: number}[]) => confirmAndExecute(
            () => run(() => einvoiceDocumentApi.submit(documents), (r) => reportSubmitted(r as EinvoiceDocument[])),
            {text: t('einvSubmitConfirm', {count: documents.length}), icon: "question"},
        ),
        resubmit: (id: number) => confirmAndExecute(
            () => run(() => einvoiceDocumentApi.resubmit(id), (r) => reportSubmitted([r as EinvoiceDocument])),
            {text: t('einvResubmitConfirm'), icon: "question"},
        ),
        refresh: (id: number) => run(() => einvoiceDocumentApi.refresh(id), () => t('einvStatusRefreshed')),
        cancel: async (doc: EinvoiceDocument) => {
            // LHDN requires a reason; cancellation is only possible within 72 hours of validation
            const {value: reason, isConfirmed} = await Swal.fire({
                title: t('einvCancelTitle'),
                text: t('einvCancelText', {ref: doc.doc_number}),
                input: "text",
                inputPlaceholder: t('einvCancelReason'),
                inputAttributes: {maxlength: "300"},
                inputValidator: (value) => (!value?.trim() ? t('einvCancelReasonRequired') : null),
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#b00020",
                confirmButtonText: t('einvCancelConfirm'),
                cancelButtonText: t('close'),
            });
            if (isConfirmed && reason) {
                await run(() => einvoiceDocumentApi.cancel(doc.id, reason.trim()), () => t('einvCancelled'));
            }
        },
    };
}

/**
 * Void of an e-invoiced document: a validated e-invoice is cancelled at LHDN along with the void,
 * and once LHDN's cancellation window has closed the document can't be voided. The server enforces
 * this; the hook just tells the user before they confirm. Pass a null type for documents that aren't e-invoiced.
 */
export function useEinvoiceVoidCheck(transType: EinvoiceTransType | null, transId: number | string | null | undefined) {
    const {t} = useSmartTranslation();
    const notify = useNotification();
    const {data, mutate} = einvoiceDocumentApi.useForSource(transType, transId, {revalidateOnFocus: false});
    const doc = data?.document;

    let blocked: string | null = null;
    let note: string | null = null;
    if (doc?.process_status === "VALID") {
        if (doc.can_cancel) {
            note = t('einvVoidWillCancel', {at: formatDateTime(doc.cancel_deadline_at)});
        } else {
            blocked = t('einvVoidBlocked', {ref: doc.doc_number, at: formatDateTime(doc.cancel_deadline_at)});
        }
    } else if (doc?.process_status === "SUBMITTED" || doc?.process_status === "SUBMITTING") {
        note = t('einvVoidPending');
    }

    return {
        // runs the void flow unless the e-invoice can no longer be cancelled
        guard: (proceed: () => unknown) => {
            if (blocked) {
                notify.error(blocked);
                return;
            }
            proceed();
        },
        confirmText: (text: string) => (note ? `${text} ${note}` : text),
        // reload the e-invoice status (and the strip) after a void
        refresh: () => mutate(),
    };
}

/**
 * MyInvois strip under a saved sales / self-billed document: status, UUID, validation link
 * and the submit / refresh / cancel actions.
 */
export function EinvoiceStrip({transType, transId, live}: {transType: EinvoiceTransType, transId: number, live: boolean}) {
    const {t} = useSmartTranslation();
    const {data, mutate} = einvoiceDocumentApi.useForSource(transType, transId, {revalidateOnFocus: false});
    const actions = useEinvoiceActions(() => mutate());
    // submitting / refreshing and cancelling at LHDN are e-invoice permissions, whatever page shows the strip
    const {canModule} = useAccess();
    const mayAct = canModule("einvoice", "create");
    const mayRefresh = canModule("einvoice", "edit");
    const mayCancel = canModule("einvoice", "delete");

    // companies not on e-invoice see nothing; an existing e-invoice is still shown if it was later disabled
    if (!data || !data.supported || (!data.enabled && !data.document)) {
        return null;
    }

    const doc = data.document;
    const canSubmit = data.enabled && live && (!doc || doc.can_submit);

    return (
        <Card className="mb-3 border">
            <Card.Body className="py-2 px-3 d-flex flex-wrap align-items-center gap-3">
                <div className="d-flex align-items-center gap-2">
                    <span className="small fw-semibold text-dark">{t('myInvois')}</span>
                    <EinvoiceStatusBadge status={doc?.process_status} />
                    <EnvironmentBadge environment={data.environment} />
                </div>
                {doc?.uuid && (
                    <div className="small text-muted text-truncate">
                        {t('einvUuid')} <Link to={`${EINVOICE_DOCUMENTS_PATH}/${doc.id}`} className="fw-semibold">{doc.uuid}</Link>
                        {doc.date_time_validated && <> · {t('einvValidatedAt', {at: formatDateTime(doc.date_time_validated)})}</>}
                    </div>
                )}
                {doc && !doc.uuid && doc.last_error_message && (
                    <div className="small text-danger flex-grow-1" style={{minWidth: 0}}>
                        <Link to={`${EINVOICE_DOCUMENTS_PATH}/${doc.id}`} className="text-danger">{doc.last_error_message}</Link>
                    </div>
                )}
                {doc?.uuid && doc.last_error_message && doc.process_status === "INVALID" && (
                    <div className="small text-danger w-100">{doc.last_error_message}</div>
                )}
                <div className="ms-auto d-flex flex-wrap gap-2">
                    {actions.busy && <Spinner animation="border" size="sm" className="align-self-center" />}
                    {doc?.validation_link && (
                        <a href={doc.validation_link} target="_blank" rel="noreferrer" className="btn btn-outline-success btn-sm">
                            <ExternalLink size={14} className="me-1" />{t('einvValidationLink')}
                        </a>
                    )}
                    {mayRefresh && doc && (doc.process_status === "SUBMITTED" || doc.process_status === "VALID") && (
                        <Button variant="outline-secondary" size="sm" disabled={actions.busy} onClick={() => actions.refresh(doc.id)}>
                            <RefreshCw size={14} className="me-1" />{t('einvRefreshStatus')}
                        </Button>
                    )}
                    {mayCancel && doc?.can_cancel && (
                        <Button variant="outline-danger" size="sm" disabled={actions.busy} onClick={() => actions.cancel(doc)}>
                            <XCircle size={14} className="me-1" />{t('einvCancel')}
                        </Button>
                    )}
                    {mayAct && canSubmit && (
                        <Button variant="primary" size="sm" disabled={actions.busy}
                            onClick={() => actions.submit([{trans_type: transType, trans_id: transId}])}>
                            <Send size={14} className="me-1" />{doc ? t('einvResubmit') : t('einvSubmit')}
                        </Button>
                    )}
                </div>
            </Card.Body>
        </Card>
    );
}
