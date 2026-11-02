import {useRef} from "react";
import {Button} from "react-bootstrap";
import {CreditCard, CornerUpLeft, XCircle} from "react-feather";
import {Link, useNavigate, useParams, useSearchParams} from "react-router-dom";
import {CustomerTransDocument} from "@/apis/models/sales-document";
import {invoiceApi, InvoiceRequest} from "@/apis/requests/sales-billing-api";
import {useGetOneDeliveryNote} from "@/apis/requests/delivery-note-api";
import {ConditionalError} from "@/components/Display/ErrorBoundary";
import {useConfirmAction} from "@/hooks/use-confirmation-action";
import {useNotification} from "@/hooks/notification";
import {formatDecimal} from "@/views/Inventory/shared/options";
import {useSmartTranslation} from "@/hooks/use-translation";
import {CREDIT_NOTES_PATH, INVOICES_PATH, PAYMENTS_PATH} from "../sales-menu";
import {DocumentBanner} from "../shared/DocumentBanner";
import {useEinvoiceVoidCheck} from "@/views/Einvoice/shared/einvoice-ui";
import {SalesListPage} from "../shared/SalesListPage";
import {SalesStateBadge} from "../shared/SalesStateBadge";
import {sendWithCreditLimitCheck} from "../shared/billing";
import {DirectInvoiceForm, InvoiceFromDeliveryForm} from "./InvoiceForms";

const Loading = () => <div className="loader-pendulums mt-10" />;

export function Invoices() {
    const {t} = useSmartTranslation();

    return (
        <SalesListPage<CustomerTransDocument>
            useGetAll={invoiceApi.useGetAll}
            editPath={(row) => `${INVOICES_PATH}/${row.id}`}
            states={["outstanding", "unpaid", "overdue", "partially_paid", "paid", "voided"]}
            searchPlaceholder={t('searchSalesDocuments')}
            columns={[
                {accessor: "trans_date", title: t('date')},
                {accessor: "reference_no", title: t('referenceNo'), render: (row) => <span className="fw-semibold text-dark">{row.reference_no}</span>},
                {accessor: "customer_id", title: t('customer'), render: (row) => row.customer?.name ?? "-"},
                {accessor: "due_date", title: t('dueDate'), render: (row) => <span className={row.state === "overdue" ? "text-danger fw-semibold" : ""}>{row.due_date ?? "-"}</span>},
                {accessor: "grand_total", title: t('total'), tdClasses: "text-end", render: (row) => <span>{formatDecimal(row.grand_total)} <span className="text-muted small">{row.currency?.code}</span></span>},
                {accessor: "balance", title: t('balanceDue'), tdClasses: "text-end", render: (row) => row.status === "active" ? formatDecimal(row.balance ?? 0) : "-"},
                {accessor: "state", title: t('status'), render: (row) => <SalesStateBadge state={row.state} />},
            ]}
        />
    );
}

/** Saves through the credit-limit check (asks before going over the limit). */
function useSave() {
    const {t} = useSmartTranslation();
    const labels = {title: t('overCreditLimit'), confirm: t('invoiceAnyway'), cancel: t('cancel')};

    return (send: (data: InvoiceRequest) => Promise<CustomerTransDocument>, data: InvoiceRequest) =>
        sendWithCreditLimitCheck((confirm) => send({...data, confirm_over_limit: confirm}), labels);
}

/** /sales/invoices/create — direct, or ?from_delivery=ID to invoice a delivery note. */
export function CreateInvoice() {
    const navigate = useNavigate();
    const [search] = useSearchParams();
    const save = useSave();
    const createdId = useRef<number>();
    const noteId = search.get("from_delivery");
    const {data: note, error} = useGetOneDeliveryNote(noteId, {revalidateOnFocus: false});

    const onSubmit = async (data: InvoiceRequest) => {
        createdId.current = (await save(invoiceApi.add, data)).id;
    };
    const onSuccess = async () => navigate(`${INVOICES_PATH}/${createdId.current}`);

    if (noteId && error) {
        return <ConditionalError error={error} />;
    }
    if (noteId && !note) {
        return <Loading />;
    }

    return note
        ? <InvoiceFromDeliveryForm note={note} backTo={INVOICES_PATH} onSubmit={onSubmit} onSuccess={onSuccess} />
        : <DirectInvoiceForm backTo={INVOICES_PATH} onSubmit={onSubmit} onSuccess={onSuccess} />;
}

export function EditInvoice() {
    const {t} = useSmartTranslation();
    const {id = ""} = useParams();
    const save = useSave();
    const {confirmAndExecute} = useConfirmAction();
    const notify = useNotification();
    const {data: invoice, mutate, error} = invoiceApi.useGetOne(id, {revalidateOnFocus: false});
    const einvoice = useEinvoiceVoidCheck("sales_invoice", id);
    const {data: note} = useGetOneDeliveryNote(invoice?.source_trans_id, {revalidateOnFocus: false});

    if (error) {
        return <ConditionalError error={error} />;
    }
    if (!invoice || (invoice.source_trans_id && !note)) {
        return <Loading />;
    }

    const live = invoice.status === "active";
    const owing = (invoice.balance ?? 0) > 0;
    const creditable = (invoice.lines ?? []).some(l => Number(l.quantity) > Number(l.quantity_done));
    const locked = Number(invoice.allocated_total) > 0 || (invoice.lines ?? []).some(l => Number(l.quantity_done) > 0);

    const banner = (
        <DocumentBanner
            state={invoice.state}
            progress={invoice.status === "active" ? t('balanceOf', {balance: formatDecimal(invoice.balance ?? 0), code: invoice.currency?.code ?? ""}) : undefined}
            source={invoice.source_transaction ? {type: invoice.source_transaction.trans_type ?? "delivery_note", id: invoice.source_transaction.id, reference_no: invoice.source_transaction.reference_no} : null}
            related={invoice.related}
            einvoice={{transType: "sales_invoice", transId: invoice.id, live}}
            actions={live ? (
                <>
                    {owing && (
                        <Link to={`${PAYMENTS_PATH}/create?invoice=${invoice.id}`} className="btn btn-primary btn-sm">
                            <CreditCard size={14} className="me-1" />{t('receivePayment')}
                        </Link>
                    )}
                    {creditable && (
                        <Link to={`${CREDIT_NOTES_PATH}/create?from_invoice=${invoice.id}`} className="btn btn-outline-primary btn-sm">
                            <CornerUpLeft size={14} className="me-1" />{t('creditNote')}
                        </Link>
                    )}
                    {!locked && (
                        <Button variant="outline-danger" size="sm" onClick={() => einvoice.guard(() => confirmAndExecute(async () => {
                            try {
                                await invoiceApi.void(invoice.id, null);
                                notify.success(t('invoiceVoided'));
                                await mutate();
                                await einvoice.refresh();
                            } catch (err) {
                                notify.error(err);
                            }
                        }, {text: einvoice.confirmText(t('voidInvoiceText', {ref: invoice.reference_no}))}))}>
                            <XCircle size={14} className="me-1" />{t('void')}
                        </Button>
                    )}
                </>
            ) : undefined}
        />
    );

    const onSubmit = async (data: InvoiceRequest) => {
        await save((body) => invoiceApi.update(invoice.id, body), data);
        await mutate();
    };
    const key = `${invoice.id}-${invoice.state}-${invoice.allocated_total}`;

    return note
        ? <InvoiceFromDeliveryForm key={key} note={note} record={invoice} backTo={INVOICES_PATH} onSubmit={onSubmit} banner={banner} />
        : <DirectInvoiceForm key={key} record={invoice} backTo={INVOICES_PATH} onSubmit={onSubmit} banner={banner} />;
}
