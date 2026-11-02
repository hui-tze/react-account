import {useRef} from "react";
import {Button} from "react-bootstrap";
import {XCircle} from "react-feather";
import {useNavigate, useParams, useSearchParams} from "react-router-dom";
import {CustomerTransDocument} from "@/apis/models/sales-document";
import {invoiceApi, paymentApi} from "@/apis/requests/sales-billing-api";
import {ConditionalError} from "@/components/Display/ErrorBoundary";
import {useConfirmAction} from "@/hooks/use-confirmation-action";
import {useNotification} from "@/hooks/notification";
import {formatDecimal} from "@/views/Inventory/shared/options";
import {useSmartTranslation} from "@/hooks/use-translation";
import {PAYMENTS_PATH} from "../sales-menu";
import {DocumentBanner} from "../shared/DocumentBanner";
import {SalesListPage} from "../shared/SalesListPage";
import {SalesStateBadge} from "../shared/SalesStateBadge";
import {PaymentForm} from "./PaymentForm";

const Loading = () => <div className="loader-pendulums mt-10" />;

export function Payments() {
    const {t} = useSmartTranslation();

    return (
        <SalesListPage<CustomerTransDocument>
            useGetAll={paymentApi.useGetAll}
            editPath={(row) => `${PAYMENTS_PATH}/${row.id}`}
            states={["unallocated", "partially_allocated", "allocated", "voided"]}
            searchPlaceholder={t('searchSalesDocuments')}
            columns={[
                {accessor: "trans_date", title: t('date')},
                {accessor: "reference_no", title: t('receiptNo'), render: (row) => <span className="fw-semibold text-dark">{row.reference_no}</span>},
                {accessor: "customer_id", title: t('customer'), render: (row) => row.customer?.name ?? "-"},
                {accessor: "bank_account_id", title: t('depositTo'), render: (row) => row.bank_account?.account_name ?? "-"},
                {accessor: "grand_total", title: t('amount'), tdClasses: "text-end", render: (row) => <span>{formatDecimal(row.grand_total)} <span className="text-muted small">{row.currency?.code}</span></span>},
                {accessor: "unallocated", title: t('unapplied'), tdClasses: "text-end", render: (row) => row.status === "active" ? formatDecimal(row.unallocated ?? 0) : "-"},
                {accessor: "state", title: t('status'), render: (row) => <SalesStateBadge state={row.state} />},
            ]}
        />
    );
}

/** /sales/payments/create, or ?invoice=ID to pay that invoice. */
export function CreatePayment() {
    const navigate = useNavigate();
    const [search] = useSearchParams();
    const createdId = useRef<number>();
    const invoiceId = search.get("invoice");
    const {data: invoice, error} = invoiceApi.useGetOne(invoiceId, {revalidateOnFocus: false});

    if (invoiceId && error) {
        return <ConditionalError error={error} />;
    }
    if (invoiceId && !invoice) {
        return <Loading />;
    }

    return (
        <PaymentForm
            forInvoice={invoice}
            backTo={PAYMENTS_PATH}
            onSubmit={async (data) => {
                createdId.current = (await paymentApi.add(data)).id;
            }}
            onSuccess={async () => navigate(`${PAYMENTS_PATH}/${createdId.current}`)}
        />
    );
}

export function EditPayment() {
    const {t} = useSmartTranslation();
    const {id = ""} = useParams();
    const {confirmAndExecute} = useConfirmAction();
    const notify = useNotification();
    const {data: payment, mutate, error} = paymentApi.useGetOne(id, {revalidateOnFocus: false});

    if (error) {
        return <ConditionalError error={error} />;
    }
    if (!payment) {
        return <Loading />;
    }

    return (
        <PaymentForm
            key={`${payment.id}-${payment.state}-${payment.allocated_total}`}
            record={payment}
            backTo={PAYMENTS_PATH}
            onSubmit={async (data) => {
                await paymentApi.update(payment.id, data);
                await mutate();
            }}
            banner={(
                <DocumentBanner
                    state={payment.state}
                    progress={payment.status === "active" && (payment.unallocated ?? 0) > 0 ? t('unappliedAmount', {amount: formatDecimal(payment.unallocated ?? 0)}) : undefined}
                    related={(payment.allocations ?? []).map(a => ({type: a.type, id: a.id, reference_no: a.reference_no, date: a.date, status: a.status, amount: a.amount}))}
                    actions={payment.status === "active" ? (
                        <Button variant="outline-danger" size="sm" onClick={() => confirmAndExecute(async () => {
                            try {
                                await paymentApi.void(payment.id, null);
                                notify.success(t('paymentVoided'));
                                await mutate();
                            } catch (err) {
                                notify.error(err);
                            }
                        }, {text: t('voidPaymentText', {ref: payment.reference_no})})}>
                            <XCircle size={14} className="me-1" />{t('void')}
                        </Button>
                    ) : undefined}
                />
            )}
        />
    );
}
