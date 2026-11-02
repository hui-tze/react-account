import {useRef} from "react";
import {Button} from "react-bootstrap";
import {FileText, XCircle} from "react-feather";
import {Link, useNavigate, useParams, useSearchParams} from "react-router-dom";
import {GoodsReceiptDocument} from "@/apis/models/purchase-document";
import {goodsReceiptApi, GoodsReceiptRequest, purchaseOrderApi} from "@/apis/requests/purchase-api";
import {ConditionalError} from "@/components/Display/ErrorBoundary";
import {formatDecimal} from "@/views/Inventory/shared/options";
import {useSmartTranslation} from "@/hooks/use-translation";
import {DocumentBanner} from "@/views/Sales/shared/DocumentBanner";
import {SalesListPage} from "@/views/Sales/shared/SalesListPage";
import {SalesStateBadge} from "@/views/Sales/shared/SalesStateBadge";
import {BILLS_PATH, purchaseDocumentPath, RECEIPTS_PATH} from "../purchases-menu";
import {Loading, refreshPurchaseLists, useDocumentAction, useSupplierFilter} from "../shared/page-helpers";
import {DirectReceiptForm, OrderReceiptForm} from "./ReceiptForms";

export function GoodsReceipts() {
    const {t} = useSmartTranslation();

    return (
        <SalesListPage<GoodsReceiptDocument>
            useGetAll={goodsReceiptApi.useGetAll}
            editPath={(row) => `${RECEIPTS_PATH}/${row.id}`}
            states={["unbilled", "partially_billed", "billed", "voided"]}
            searchPlaceholder={t('searchPurchaseDocuments')}
            partyFilter={useSupplierFilter()}
            columns={[
                {accessor: "receipt_date", title: t('date')},
                {accessor: "reference_no", title: t('grnNo'), render: (row) => <span className="fw-semibold text-dark">{row.reference_no}</span>},
                {accessor: "purchase_order_id", title: t('purchaseOrder'), render: (row) => row.purchase_order?.trans_type === "purchase_order" ? row.purchase_order.reference_no : <span className="text-muted">{t('directReceipt')}</span>},
                {accessor: "supplier_id", title: t('supplier'), render: (row) => row.supplier?.name ?? "-"},
                {accessor: "warehouse_id", title: t('receiveInto'), render: (row) => row.warehouse?.name ?? "-"},
                {accessor: "total", title: t('valueReceived'), tdClasses: "text-end", render: (row) => <span>{formatDecimal(row.total)} <span className="text-muted small">{row.purchase_order?.currency}</span></span>},
                {accessor: "state", title: t('status'), render: (row) => <SalesStateBadge state={row.state} />},
            ]}
        />
    );
}

/** /purchases/receipts/create — against an order (?from_order=ID pre-picks it) or ?direct=1. */
export function CreateGoodsReceipt() {
    const navigate = useNavigate();
    const [search] = useSearchParams();
    const createdId = useRef<number>();
    const orderId = search.get("from_order");
    const {data: order, error} = purchaseOrderApi.useGetOne(orderId, {revalidateOnFocus: false});

    const onSubmit = async (data: GoodsReceiptRequest) => {
        createdId.current = (await goodsReceiptApi.add(data)).id;
        await refreshPurchaseLists();
    };
    const onSuccess = async () => navigate(`${RECEIPTS_PATH}/${createdId.current}`);

    if (search.get("direct")) {
        return <DirectReceiptForm backTo={RECEIPTS_PATH} onSubmit={onSubmit} onSuccess={onSuccess} />;
    }
    if (orderId && error) {
        return <ConditionalError error={error} />;
    }
    if (orderId && !order) {
        return <Loading />;
    }

    return <OrderReceiptForm key={orderId ?? "new"} order={order} backTo={orderId ? `/purchases/orders/${orderId}` : RECEIPTS_PATH} onSubmit={onSubmit} onSuccess={onSuccess} />;
}

export function EditGoodsReceipt() {
    const {t} = useSmartTranslation();
    const {id = ""} = useParams();
    const {data: record, mutate, error} = goodsReceiptApi.useGetOne(id, {revalidateOnFocus: false});
    const run = useDocumentAction(() => mutate());

    if (error) {
        return <ConditionalError error={error} />;
    }
    if (!record) {
        return <Loading />;
    }

    const live = record.status === "active";
    const unbilled = record.state === "unbilled";
    const Form = record.direct ? DirectReceiptForm : OrderReceiptForm;

    return (
        <Form
            key={`${record.id}-${record.status}-${record.state}`}
            // billed receipts can't change: show them read-only
            record={live && !unbilled ? {...record, status: "billed"} : record}
            backTo={RECEIPTS_PATH}
            onSubmit={async (data) => {
                await goodsReceiptApi.update(record.id, data);
                await refreshPurchaseLists();
                await mutate();
            }}
            banner={(
                <DocumentBanner
                    state={record.state}
                    source={!record.direct && record.purchase_order ? {type: "purchase_order", id: record.purchase_order.id, reference_no: record.purchase_order.reference_no} : null}
                    related={record.related}
                    pathOf={purchaseDocumentPath}
                    actions={live ? (
                        <>
                            {record.state !== "billed" && (
                                <Link to={`${BILLS_PATH}/create?supplier_id=${record.supplier_id}&receipt=${record.id}`} className="btn btn-primary btn-sm">
                                    <FileText size={14} className="me-1" />{t('enterBill')}
                                </Link>
                            )}
                            {unbilled && (
                                <Button variant="outline-danger" size="sm" onClick={() => run(() => goodsReceiptApi.void(record.id, null), t('voidReceiptText', {ref: record.reference_no}), t('receiptVoided'))}>
                                    <XCircle size={14} className="me-1" />{t('void')}
                                </Button>
                            )}
                        </>
                    ) : undefined}
                />
            )}
        />
    );
}
