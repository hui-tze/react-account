import {useRef} from "react";
import {formatQuantity} from "@/utils/display-format";
import {DocRef} from "@/views/Documents/DocumentPreview";
import {Button} from "react-bootstrap";
import {Package, RotateCcw, Slash, XCircle} from "react-feather";
import {useNavigate, useParams} from "react-router-dom";
import {ActionButton, Link} from "@/components/Access/Guarded";
import {PurchaseOrderDocument} from "@/apis/models/purchase-document";
import {purchaseOrderApi} from "@/apis/requests/purchase-api";
import {ConditionalError} from "@/components/Display/ErrorBoundary";
import {formatDecimal} from "@/views/Inventory/shared/options";
import {useSmartTranslation} from "@/hooks/use-translation";
import {DocumentBanner} from "@/views/Sales/shared/DocumentBanner";
import {SalesListPage} from "@/views/Sales/shared/SalesListPage";
import {SalesStateBadge} from "@/views/Sales/shared/SalesStateBadge";
import {PURCHASE_ORDERS_PATH, purchaseDocumentPath, RECEIPTS_PATH} from "../purchases-menu";
import {Loading, refreshPurchaseLists, useDocumentAction, useSupplierFilter} from "../shared/page-helpers";
import {PurchaseOrderForm} from "./PurchaseOrderForm";

const sum = (order: PurchaseOrderDocument, field: "quantity" | "received_qty") => (order.details ?? []).reduce((total, line) => total + Number(line[field]), 0);

export function PurchaseOrders() {
    const {t} = useSmartTranslation();

    return (
        <SalesListPage<PurchaseOrderDocument>
            useGetAll={purchaseOrderApi.useGetAll}
            editPath={(row) => `${PURCHASE_ORDERS_PATH}/${row.id}`}
            states={["outstanding", "partially_received", "received", "completed", "closed", "cancelled"]}
            searchPlaceholder={t('searchPurchaseDocuments')}
            partyFilter={useSupplierFilter()}
            columns={[
                {accessor: "order_date", title: t('date')},
                {accessor: "reference_no", title: t('referenceNo'), render: (row) => <DocRef type={row.trans_type} id={row.id} reference={row.reference_no} />},
                {accessor: "supplier_id", title: t('supplier'), render: (row) => row.supplier?.name ?? "-"},
                {accessor: "expected_delivery", title: t('expectedDelivery'), render: (row) => row.expected_delivery ?? "-"},
                {accessor: "grand_total", title: t('total'), tdClasses: "text-end", render: (row) => <span>{formatDecimal(row.grand_total)} <span className="text-muted small">{row.currency}</span></span>},
                {
                    accessor: "state",
                    title: t('status'),
                    render: (row) => (
                        <div>
                            <SalesStateBadge state={row.state} />
                            {row.state === "partially_received" && <div className="small text-muted">{formatQuantity(sum(row, "received_qty"))} / {formatQuantity(sum(row, "quantity"))}</div>}
                        </div>
                    ),
                },
            ]}
        />
    );
}

export function CreatePurchaseOrder() {
    const navigate = useNavigate();
    const createdId = useRef<number>();

    return (
        <PurchaseOrderForm
            backTo={PURCHASE_ORDERS_PATH}
            onSubmit={async (data) => {
                createdId.current = (await purchaseOrderApi.add(data)).id;
                await refreshPurchaseLists();
            }}
            onSuccess={async () => navigate(`${PURCHASE_ORDERS_PATH}/${createdId.current}`)}
        />
    );
}

export function EditPurchaseOrder() {
    const {t} = useSmartTranslation();
    const {id = ""} = useParams();
    const {data: record, mutate, error} = purchaseOrderApi.useGetOne(id, {revalidateOnFocus: false});
    const run = useDocumentAction(() => mutate());

    if (error) {
        return <ConditionalError error={error} />;
    }
    if (!record) {
        return <Loading />;
    }

    const ordered = sum(record, "quantity");
    const received = sum(record, "received_qty");
    const outstanding = received < ordered;

    return (
        <PurchaseOrderForm
            // remount after actions so the form shows the refreshed record
            key={`${record.id}-${record.status}-${record.state}`}
            record={record}
            backTo={PURCHASE_ORDERS_PATH}
            onSubmit={async (data) => {
                await purchaseOrderApi.update(record.id, data);
                await refreshPurchaseLists();
                await mutate();
            }}
            banner={(
                <DocumentBanner
                    state={record.state}
                    progress={received > 0 ? t('receivedOf', {done: formatDecimal(received), total: formatDecimal(ordered)}) : undefined}
                    related={record.related}
                    pathOf={purchaseDocumentPath}
                    actions={(
                        <>
                            {record.status === "active" && outstanding && (
                                <Link to={`${RECEIPTS_PATH}/create?from_order=${record.id}`} className="btn btn-primary btn-sm">
                                    <Package size={14} className="me-1" />{t('receiveGoods')}
                                </Link>
                            )}
                            {record.status === "active" && received > 0 && outstanding && (
                                <ActionButton action="edit" variant="outline-secondary" size="sm" onClick={() => run(() => purchaseOrderApi.close(record.id), t('closePurchaseOrderText', {ref: record.reference_no}), t('orderClosed'))}>
                                    <Slash size={14} className="me-1" />{t('closeOrder')}
                                </ActionButton>
                            )}
                            {record.status === "active" && received === 0 && (
                                <ActionButton variant="outline-danger" size="sm" onClick={() => run(() => purchaseOrderApi.cancel(record.id), t('cancelOrderText', {ref: record.reference_no}), t('orderCancelled'))}>
                                    <XCircle size={14} className="me-1" />{t('cancelOrder')}
                                </ActionButton>
                            )}
                            {record.status === "closed" && (
                                <ActionButton action="edit" variant="outline-secondary" size="sm" onClick={() => run(() => purchaseOrderApi.reopen(record.id), t('reopenOrderText', {ref: record.reference_no}), t('orderReopened'))}>
                                    <RotateCcw size={14} className="me-1" />{t('reopenOrder')}
                                </ActionButton>
                            )}
                        </>
                    )}
                />
            )}
        />
    );
}
