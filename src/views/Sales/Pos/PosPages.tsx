import {useRef} from "react";
import {CornerUpLeft, XCircle} from "react-feather";
import {useNavigate, useParams, useSearchParams} from "react-router-dom";
import {ActionButton, Link} from "@/components/Access/Guarded";
import {DocRef} from "@/views/Documents/DocumentPreview";
import type {PosDocument} from "@/apis/models/pos";
import {posCreditNoteApi, PosCreditNoteRequest, posReceiptApi, PosReceiptRequest} from "@/apis/requests/pos-api";
import {useGetPosSettingOptions} from "@/apis/requests/pos-setting-api";
import {ConditionalError} from "@/components/Display/ErrorBoundary";
import {useConfirmAction} from "@/hooks/use-confirmation-action";
import {useNotification} from "@/hooks/notification";
import {formatDecimal} from "@/views/Inventory/shared/options";
import {useSmartTranslation} from "@/hooks/use-translation";
import {useEinvoiceVoidCheck} from "@/views/Einvoice/shared/einvoice-ui";
import {POS_CREDIT_NOTES_PATH, POS_RECEIPTS_PATH} from "../sales-menu";
import {DocumentBanner} from "../shared/DocumentBanner";
import {DocumentSummary} from "../shared/DocumentSummary";
import {SalesListPage} from "../shared/SalesListPage";
import {SalesStateBadge} from "../shared/SalesStateBadge";
import {PosReceiptForm} from "./PosReceiptForm";
import {PosCreditNoteForm} from "./PosCreditNoteForm";
import {EinvoiceTreatmentBadge, PosEinvoiceStrip} from "./pos-ui";

const Loading = () => <div className="loader-pendulums mt-10" />;

/** Receipts and refunds list alike: buyer, counter, total, e-invoice treatment. */
function PosList({type}: {type: "pos_receipt" | "pos_credit_note"}) {
    const {t} = useSmartTranslation();
    const {data: posList} = useGetPosSettingOptions();
    const receipts = type === "pos_receipt";

    return (
        <SalesListPage<PosDocument>
            useGetAll={receipts ? posReceiptApi.useGetAll : posCreditNoteApi.useGetAll}
            editPath={(row) => `${receipts ? POS_RECEIPTS_PATH : POS_CREDIT_NOTES_PATH}/${row.id}`}
            states={["completed", "voided"]}
            searchPlaceholder={t('posSearchPlaceholder')}
            tableKey={type}
            partyFilter={{param: "pos_setting_id", placeholder: t('posAllCounters'), options: (posList ?? []).map(p => ({value: p.id, label: p.name}))}}
            columns={[
                {accessor: "trans_date", title: t('date')},
                {accessor: "reference_no", title: t('referenceNo'), render: (row) => <DocRef type={row.trans_type} id={row.id} reference={row.reference_no} />},
                ...(receipts ? [] : [{accessor: "source_trans_id", title: t('docType_pos_receipt'), render: (row: PosDocument) => row.source_transaction?.reference_no ?? "-"}]),
                {accessor: "customer_id", title: t('posBuyer'), render: (row) => row.buyer_name},
                {accessor: "pos_setting_id", title: t('posCounter'), render: (row) => row.pos_setting?.name ?? "-"},
                {accessor: "grand_total", title: t('total'), tdClasses: "text-end", render: (row) => <span>{formatDecimal(row.grand_total)} <span className="text-muted small">{row.currency?.code}</span></span>},
                {accessor: "einvoice_submission_mode", title: t('myInvois'), render: (row) => <EinvoiceTreatmentBadge doc={row} />},
                {accessor: "state", title: t('status'), render: (row) => <SalesStateBadge state={row.state} />},
            ]}
        />
    );
}

export const PosReceipts = () => <PosList type="pos_receipt" />;
export const PosCreditNotes = () => <PosList type="pos_credit_note" />;

export function CreatePosReceipt() {
    const navigate = useNavigate();
    const createdId = useRef<number>();

    const onSubmit = async (data: PosReceiptRequest) => {
        createdId.current = (await posReceiptApi.add(data)).id;
    };
    const onSuccess = async () => navigate(`${POS_RECEIPTS_PATH}/${createdId.current}`);

    return <PosReceiptForm backTo={POS_RECEIPTS_PATH} onSubmit={onSubmit} onSuccess={onSuccess} />;
}

/** /sales/pos-credit-notes/create?from_receipt=ID — refunds are always against a receipt. */
export function CreatePosCreditNote() {
    const {t} = useSmartTranslation();
    const navigate = useNavigate();
    const [search] = useSearchParams();
    const createdId = useRef<number>();
    const receiptId = search.get("from_receipt");
    const {data: receipt, error} = posReceiptApi.useGetOne(receiptId, {revalidateOnFocus: false});

    const onSubmit = async (data: PosCreditNoteRequest) => {
        createdId.current = (await posCreditNoteApi.add(data)).id;
    };
    const onSuccess = async () => navigate(`${POS_CREDIT_NOTES_PATH}/${createdId.current}`);

    if (!receiptId) {
        return (
            <div className="container-xxl py-5 text-center text-muted">
                <p>{t('posPickReceiptFirst')}</p>
                <Link to={POS_RECEIPTS_PATH} className="btn btn-primary btn-sm">{t('menu_POSReceipts')}</Link>
            </div>
        );
    }
    if (error) {
        return <ConditionalError error={error} />;
    }
    if (!receipt) {
        return <Loading />;
    }

    return <PosCreditNoteForm receipt={receipt} backTo={`${POS_RECEIPTS_PATH}/${receipt.id}`} onSubmit={onSubmit} onSuccess={onSuccess} />;
}

/** Void with the e-invoice rules: an own e-invoice is cancelled at LHDN; a reported consolidated one blocks it (server says why). */
function useVoid(doc: PosDocument | undefined, onDone: () => Promise<unknown>) {
    const {t} = useSmartTranslation();
    const {confirmAndExecute} = useConfirmAction();
    const notify = useNotification();
    const einvoice = useEinvoiceVoidCheck(doc?.einvoice_treatment === "individual" ? doc.trans_type : null, doc?.id);
    const api = doc?.trans_type === "pos_credit_note" ? posCreditNoteApi : posReceiptApi;

    return () => doc && einvoice.guard(() => confirmAndExecute(async () => {
        try {
            await api.void(doc.id, null);
            notify.success(t('posVoided', {ref: doc.reference_no}));
            await onDone();
            await einvoice.refresh();
        } catch (err) {
            notify.error(err);
        }
    }, {text: einvoice.confirmText(t(doc.trans_type === "pos_receipt" ? 'posVoidReceiptText' : 'posVoidRefundText', {ref: doc.reference_no}))}));
}

function PosFacts(doc: PosDocument, t: (key: string, options?: Record<string, unknown>) => string) {
    return [
        {label: t('referenceNo'), value: doc.reference_no},
        {label: t('date'), value: doc.trans_date},
        {label: t('posBuyer'), value: [doc.buyer_name, doc.identity_no, doc.contact_no].filter(Boolean).join(" · ")},
        {label: t('posCounter'), value: doc.pos_setting?.name},
        {label: t('posPaymentMethod'), value: doc.payment_method ? t(`posMethod_${doc.payment_method}`) : null},
        ...(doc.trans_type === "pos_receipt" && doc.tendered_amount !== null
            ? [{label: t('posCashReceived'), value: `${formatDecimal(doc.tendered_amount)} · ${t('posChange', {amount: formatDecimal(doc.change_amount ?? 0)})}`}]
            : []),
        ...(doc.trans_type === "pos_credit_note"
            ? [{label: t('returnedGoods'), value: doc.credit_type ? t(doc.credit_type === "return" ? 'creditTypeReturn' : 'creditTypeWriteOff') : t('noGoods')}]
            : []),
        {label: t('remarks'), value: doc.remarks},
    ];
}

export function ViewPosReceipt() {
    const {t} = useSmartTranslation();
    const {id = ""} = useParams();
    const {data: receipt, mutate, error} = posReceiptApi.useGetOne(id, {revalidateOnFocus: false});
    const voidIt = useVoid(receipt, () => mutate());

    if (error) {
        return <ConditionalError error={error} />;
    }
    if (!receipt) {
        return <Loading />;
    }

    const live = receipt.status === "active";
    const refundable = (receipt.lines ?? []).some(l => Number(l.quantity) > Number(l.quantity_done));
    const liveRefunds = (receipt.credit_notes ?? []).some(n => n.status === "active");

    return (
        <DocumentSummary
            document={receipt}
            currencyCode={receipt.currency?.code}
            showLines
            pathOf={posDocumentPath}
            facts={PosFacts(receipt, t)}
            banner={(
                <>
                    <DocumentBanner
                        state={receipt.state}
                        pathOf={posDocumentPath}
                        related={(receipt.credit_notes ?? []).map(n => ({type: n.type, id: n.id, reference_no: n.reference_no, date: n.date, status: n.status, amount: n.grand_total}))}
                        actions={live ? (
                            <>
                                {refundable && (
                                    <Link to={`${POS_CREDIT_NOTES_PATH}/create?from_receipt=${receipt.id}`} className="btn btn-outline-primary btn-sm">
                                        <CornerUpLeft size={14} className="me-1" />{t('posRefund')}
                                    </Link>
                                )}
                                {!liveRefunds && (
                                    <ActionButton variant="outline-danger" size="sm" onClick={voidIt}>
                                        <XCircle size={14} className="me-1" />{t('void')}
                                    </ActionButton>
                                )}
                            </>
                        ) : undefined}
                    />
                    <PosEinvoiceStrip doc={receipt} />
                </>
            )}
        />
    );
}

export function ViewPosCreditNote() {
    const {t} = useSmartTranslation();
    const {id = ""} = useParams();
    const {data: note, mutate, error} = posCreditNoteApi.useGetOne(id, {revalidateOnFocus: false});
    const voidIt = useVoid(note, () => mutate());

    if (error) {
        return <ConditionalError error={error} />;
    }
    if (!note) {
        return <Loading />;
    }

    return (
        <DocumentSummary
            document={note}
            currencyCode={note.currency?.code}
            showLines
            pathOf={posDocumentPath}
            facts={PosFacts(note, t)}
            banner={(
                <>
                    <DocumentBanner
                        state={note.state}
                        pathOf={posDocumentPath}
                        source={note.source_transaction ? {type: "pos_receipt", id: note.source_transaction.id, reference_no: note.source_transaction.reference_no} : null}
                        actions={note.status === "active" ? (
                            <ActionButton variant="outline-danger" size="sm" onClick={voidIt}>
                                <XCircle size={14} className="me-1" />{t('void')}
                            </ActionButton>
                        ) : undefined}
                    />
                    <PosEinvoiceStrip doc={note} />
                </>
            )}
        />
    );
}

function posDocumentPath(type: string, id: number): string | null {
    return type === "pos_receipt" ? `${POS_RECEIPTS_PATH}/${id}` : type === "pos_credit_note" ? `${POS_CREDIT_NOTES_PATH}/${id}` : null;
}
