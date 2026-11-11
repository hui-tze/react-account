import {useRef} from "react";
import {ActionButton, Can} from "@/components/Access/Guarded";
import {DocRef} from "@/views/Documents/DocumentPreview";
import {Button} from "react-bootstrap";
import {XCircle} from "react-feather";
import {useNavigate, useParams, useSearchParams} from "react-router-dom";
import {CustomerTransDocument} from "@/apis/models/sales-document";
import {creditNoteApi, CreditNoteRequest, invoiceApi} from "@/apis/requests/sales-billing-api";
import {ConditionalError} from "@/components/Display/ErrorBoundary";
import {useConfirmAction} from "@/hooks/use-confirmation-action";
import {useNotification} from "@/hooks/notification";
import {formatDecimal} from "@/views/Inventory/shared/options";
import {useSmartTranslation} from "@/hooks/use-translation";
import {CREDIT_NOTES_PATH, INVOICES_PATH} from "../sales-menu";
import {DocumentBanner} from "../shared/DocumentBanner";
import {useEinvoiceVoidCheck} from "@/views/Einvoice/shared/einvoice-ui";
import {DocumentSummary} from "../shared/DocumentSummary";
import {SalesListPage} from "../shared/SalesListPage";
import {SalesStateBadge} from "../shared/SalesStateBadge";
import {CreditNoteForm} from "./CreditNoteForm";
import {DirectCreditNoteForm} from "./DirectCreditNoteForm";
import {ApplyCreditPanel} from "./ApplyCreditPanel";

const Loading = () => <div className="loader-pendulums mt-10" />;

export function CreditNotes() {
    const {t} = useSmartTranslation();

    return (
        <SalesListPage<CustomerTransDocument>
            useGetAll={creditNoteApi.useGetAll}
            editPath={(row) => `${CREDIT_NOTES_PATH}/${row.id}`}
            states={["unallocated", "partially_allocated", "allocated", "voided"]}
            searchPlaceholder={t('searchSalesDocuments')}
            columns={[
                {accessor: "trans_date", title: t('date')},
                {accessor: "reference_no", title: t('referenceNo'), render: (row) => <DocRef type={row.trans_type} id={row.id} reference={row.reference_no} />},
                {accessor: "source_trans_id", title: t('invoice'), render: (row) => row.source_transaction?.reference_no ?? "-"},
                {accessor: "customer_id", title: t('customer'), render: (row) => row.customer?.name ?? "-"},
                {accessor: "grand_total", title: t('total'), tdClasses: "text-end", render: (row) => <span>{formatDecimal(row.grand_total)} <span className="text-muted small">{row.currency?.code}</span></span>},
                {accessor: "state", title: t('status'), render: (row) => <SalesStateBadge state={row.state} />},
            ]}
        />
    );
}

/** /sales/credit-notes/create — direct credit note; ?from_invoice=ID credits that invoice. */
export function CreateCreditNote() {
    const navigate = useNavigate();
    const [search] = useSearchParams();
    const createdId = useRef<number>();
    const invoiceId = search.get("from_invoice");
    const {data: invoice, error} = invoiceApi.useGetOne(invoiceId, {revalidateOnFocus: false});

    const onSubmit = async (data: CreditNoteRequest) => {
        createdId.current = (await creditNoteApi.add(data)).id;
    };
    const onSuccess = async () => navigate(`${CREDIT_NOTES_PATH}/${createdId.current}`);

    if (!invoiceId) {
        return <DirectCreditNoteForm backTo={CREDIT_NOTES_PATH} onSubmit={onSubmit} onSuccess={onSuccess} />;
    }
    if (error) {
        return <ConditionalError error={error} />;
    }
    if (!invoice) {
        return <Loading />;
    }

    return (
        <CreditNoteForm
            invoice={invoice}
            backTo={`${INVOICES_PATH}/${invoice.id}`}
            onSubmit={onSubmit}
            onSuccess={onSuccess}
        />
    );
}

export function ViewCreditNote() {
    const {t} = useSmartTranslation();
    const {id = ""} = useParams();
    const {confirmAndExecute} = useConfirmAction();
    const notify = useNotification();
    const {data: note, mutate, error} = creditNoteApi.useGetOne(id, {revalidateOnFocus: false});
    const einvoice = useEinvoiceVoidCheck("customer_credit_note", id);

    if (error) {
        return <ConditionalError error={error} />;
    }
    if (!note) {
        return <Loading />;
    }

    const canApply = note.status === "active" && (note.unallocated ?? 0) > 0;

    return (
        <DocumentSummary
            document={note}
            currencyCode={note.currency?.code}
            showLines
            // an unapplied balance gets the apply editor instead of the read-only list
            allocations={canApply ? undefined : note.allocations}
            facts={[
                {label: t('referenceNo'), value: note.reference_no},
                {label: t('creditNoteDate'), value: note.trans_date},
                {label: t('customer'), value: note.customer?.name},
                {label: t('returnedGoods'), value: note.credit_type ? t(note.credit_type === "return" ? 'creditTypeReturn' : 'creditTypeWriteOff') : t('noGoods')},
                {label: t('reasonForCredit'), value: note.remarks},
            ]}
            banner={(
                <DocumentBanner
                    state={note.state}
                    progress={note.status === "active" && (note.unallocated ?? 0) > 0 ? t('unappliedAmount', {amount: formatDecimal(note.unallocated ?? 0)}) : undefined}
                    einvoice={{transType: "customer_credit_note", transId: note.id, live: note.status === "active"}}
                    source={note.source_transaction ? {type: "sales_invoice", id: note.source_transaction.id, reference_no: note.source_transaction.reference_no} : null}
                    actions={note.status === "active" ? (
                        <ActionButton variant="outline-danger" size="sm" onClick={() => einvoice.guard(() => confirmAndExecute(async () => {
                            try {
                                await creditNoteApi.void(note.id, null);
                                notify.success(t('creditNoteVoided'));
                                await mutate();
                                await einvoice.refresh();
                            } catch (err) {
                                notify.error(err);
                            }
                        }, {text: einvoice.confirmText(t('voidCreditNoteText', {ref: note.reference_no}))}))}>
                            <XCircle size={14} className="me-1" />{t('void')}
                        </ActionButton>
                    ) : undefined}
                />
            )}
        >
            {canApply && <Can module="customer_payments" action="create"><ApplyCreditPanel credit={note} onApplied={async () => { await mutate(); }} /></Can>}
        </DocumentSummary>
    );
}
