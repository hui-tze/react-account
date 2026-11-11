import {useRef} from "react";
import {ActionButton} from "@/components/Access/Guarded";
import {DocRef} from "@/views/Documents/DocumentPreview";
import {Button} from "react-bootstrap";
import {XCircle} from "react-feather";
import {useNavigate, useParams, useSearchParams} from "react-router-dom";
import {SupplierTransDocument} from "@/apis/models/purchase-document";
import {BillKind, billApis, supplierPaymentApi} from "@/apis/requests/purchase-api";
import {ConditionalError} from "@/components/Display/ErrorBoundary";
import {formatDecimal} from "@/views/Inventory/shared/options";
import {useSmartTranslation} from "@/hooks/use-translation";
import {DocumentBanner} from "@/views/Sales/shared/DocumentBanner";
import {SalesListPage} from "@/views/Sales/shared/SalesListPage";
import {SalesStateBadge} from "@/views/Sales/shared/SalesStateBadge";
import {purchaseDocumentPath, SUPPLIER_PAYMENTS_PATH} from "../purchases-menu";
import {Loading, refreshPurchaseLists, useDocumentAction, useSupplierFilter} from "../shared/page-helpers";
import {SupplierPaymentForm} from "./SupplierPaymentForm";

export function SupplierPayments() {
    const {t} = useSmartTranslation();

    return (
        <SalesListPage<SupplierTransDocument>
            useGetAll={supplierPaymentApi.useGetAll}
            editPath={(row) => `${SUPPLIER_PAYMENTS_PATH}/${row.id}`}
            states={["unallocated", "partially_allocated", "allocated", "voided"]}
            searchPlaceholder={t('searchPurchaseDocuments')}
            partyFilter={useSupplierFilter()}
            columns={[
                {accessor: "trans_date", title: t('date')},
                {accessor: "reference_no", title: t('paymentVoucherNo'), render: (row) => <DocRef type={row.trans_type} id={row.id} reference={row.reference_no} />},
                {accessor: "supplier_id", title: t('supplier'), render: (row) => row.supplier?.name ?? "-"},
                {accessor: "bank_account_id", title: t('payFrom'), render: (row) => row.bank_account?.account_name ?? "-"},
                {accessor: "supplier_invoice_no", title: t('chequeOrTransferRef'), render: (row) => row.supplier_invoice_no || "-"},
                {accessor: "grand_total", title: t('amount'), tdClasses: "text-end", render: (row) => <span>{formatDecimal(row.grand_total)} <span className="text-muted small">{row.currency}</span></span>},
                {accessor: "unallocated", title: t('unapplied'), tdClasses: "text-end", render: (row) => row.status === "active" ? formatDecimal(row.unallocated ?? 0) : "-"},
                {accessor: "state", title: t('status'), render: (row) => <SalesStateBadge state={row.state} />},
            ]}
        />
    );
}

/** /purchases/payments/create, or ?bill=ID(&kind=self_billed) to pay that bill. */
export function CreateSupplierPayment() {
    const navigate = useNavigate();
    const [search] = useSearchParams();
    const createdId = useRef<number>();
    const billId = search.get("bill");
    const kind: BillKind = search.get("kind") === "self_billed" ? "self_billed" : "bill";
    const {data: bill, error} = billApis[kind].useGetOne(billId, {revalidateOnFocus: false});

    if (billId && error) {
        return <ConditionalError error={error} />;
    }
    if (billId && !bill) {
        return <Loading />;
    }

    return (
        <SupplierPaymentForm
            forBill={bill}
            backTo={SUPPLIER_PAYMENTS_PATH}
            onSubmit={async (data) => {
                createdId.current = (await supplierPaymentApi.add(data)).id;
                await refreshPurchaseLists();
            }}
            onSuccess={async () => navigate(`${SUPPLIER_PAYMENTS_PATH}/${createdId.current}`)}
        />
    );
}

export function EditSupplierPayment() {
    const {t} = useSmartTranslation();
    const {id = ""} = useParams();
    const {data: payment, mutate, error} = supplierPaymentApi.useGetOne(id, {revalidateOnFocus: false});
    const run = useDocumentAction(() => mutate());

    if (error) {
        return <ConditionalError error={error} />;
    }
    if (!payment) {
        return <Loading />;
    }

    return (
        <SupplierPaymentForm
            key={`${payment.id}-${payment.state}-${payment.allocated_total}`}
            record={payment}
            backTo={SUPPLIER_PAYMENTS_PATH}
            onSubmit={async (data) => {
                await supplierPaymentApi.update(payment.id, data);
                await refreshPurchaseLists();
                await mutate();
            }}
            banner={(
                <DocumentBanner
                    state={payment.state}
                    progress={payment.status === "active" && (payment.unallocated ?? 0) > 0 ? t('unappliedAmount', {amount: formatDecimal(payment.unallocated ?? 0)}) : undefined}
                    related={(payment.allocations ?? []).map(a => ({type: a.type, id: a.id, reference_no: a.reference_no, date: a.date, status: a.status, amount: a.amount}))}
                    pathOf={purchaseDocumentPath}
                    actions={payment.status === "active" ? (
                        <ActionButton variant="outline-danger" size="sm" onClick={() => run(() => supplierPaymentApi.void(payment.id, null), t('voidPaymentText', {ref: payment.reference_no}), t('paymentVoided'))}>
                            <XCircle size={14} className="me-1" />{t('void')}
                        </ActionButton>
                    ) : undefined}
                />
            )}
        />
    );
}
