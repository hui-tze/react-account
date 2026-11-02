import {useRef} from "react";
import {Button} from "react-bootstrap";
import {CornerUpLeft, CreditCard, XCircle} from "react-feather";
import {Link, useNavigate, useParams, useSearchParams} from "react-router-dom";
import {SupplierTransDocument} from "@/apis/models/purchase-document";
import {BillKind, billApis, BillRequest} from "@/apis/requests/purchase-api";
import {ConditionalError} from "@/components/Display/ErrorBoundary";
import {formatDecimal} from "@/views/Inventory/shared/options";
import {useSmartTranslation} from "@/hooks/use-translation";
import {DocumentBanner} from "@/views/Sales/shared/DocumentBanner";
import {useEinvoiceVoidCheck} from "@/views/Einvoice/shared/einvoice-ui";
import {SalesListPage} from "@/views/Sales/shared/SalesListPage";
import {SalesStateBadge} from "@/views/Sales/shared/SalesStateBadge";
import {BILLS_PATH, purchaseDocumentPath, SELF_BILLED_CREDIT_NOTES_PATH, SELF_BILLED_PATH, SUPPLIER_CREDIT_NOTES_PATH, SUPPLIER_PAYMENTS_PATH} from "../purchases-menu";
import {Loading, refreshPurchaseLists, useDocumentAction, useSupplierFilter} from "../shared/page-helpers";
import {BillForm} from "./BillForm";

const PATHS: Record<BillKind, {list: string, creditNotes: string}> = {
    bill: {list: BILLS_PATH, creditNotes: SUPPLIER_CREDIT_NOTES_PATH},
    self_billed: {list: SELF_BILLED_PATH, creditNotes: SELF_BILLED_CREDIT_NOTES_PATH},
};

function BillList({kind}: {kind: BillKind}) {
    const {t} = useSmartTranslation();

    return (
        <SalesListPage<SupplierTransDocument>
            useGetAll={billApis[kind].useGetAll}
            editPath={(row) => `${PATHS[kind].list}/${row.id}`}
            states={["unpaid", "overdue", "partially_paid", "paid", "voided"]}
            searchPlaceholder={t('searchPurchaseDocuments')}
            partyFilter={useSupplierFilter()}
            columns={[
                {accessor: "trans_date", title: t('date')},
                {accessor: "reference_no", title: t('referenceNo'), render: (row) => <span className="fw-semibold text-dark">{row.reference_no}</span>},
                ...(kind === "bill" ? [{accessor: "supplier_invoice_no", title: t('supplierInvoiceNo')}] : []),
                {accessor: "supplier_id", title: t('supplier'), render: (row) => row.supplier?.name ?? "-"},
                {accessor: "due_date", title: t('dueDate'), render: (row) => <span className={row.state === "overdue" ? "text-danger" : ""}>{row.due_date}</span>},
                {accessor: "grand_total", title: t('total'), tdClasses: "text-end", render: (row) => <span>{formatDecimal(row.grand_total)} <span className="text-muted small">{row.currency}</span></span>},
                {accessor: "balance", title: t('owed'), tdClasses: "text-end", render: (row) => row.status === "active" ? formatDecimal(row.balance ?? 0) : "-"},
                {accessor: "state", title: t('status'), render: (row) => <SalesStateBadge state={row.state} />},
            ]}
        />
    );
}

/** New bill: from received goods (?supplier_id & ?receipt pre-pick them), or ?direct=1 with item lines. */
function CreateBill({kind}: {kind: BillKind}) {
    const navigate = useNavigate();
    const [search] = useSearchParams();
    const createdId = useRef<number>();
    const path = PATHS[kind].list;
    const supplierId = Number(search.get("supplier_id")) || null;
    const receiptId = Number(search.get("receipt")) || null;

    return (
        <BillForm
            key={search.toString()}
            kind={kind}
            direct={!!search.get("direct")}
            supplierId={supplierId}
            receiptId={receiptId}
            backTo={receiptId ? `/purchases/receipts/${receiptId}` : path}
            onSubmit={async (data: BillRequest) => {
                createdId.current = (await billApis[kind].add(data)).id;
                await refreshPurchaseLists();
            }}
            onSuccess={async () => navigate(`${path}/${createdId.current}`)}
        />
    );
}

function EditBill({kind}: {kind: BillKind}) {
    const {t} = useSmartTranslation();
    const {id = ""} = useParams();
    const api = billApis[kind];
    const {data: record, mutate, error} = api.useGetOne(id, {revalidateOnFocus: false});
    const run = useDocumentAction(() => mutate());
    const einvoice = useEinvoiceVoidCheck(kind === "self_billed" ? "self_billed_invoice" : null, id);

    if (error) {
        return <ConditionalError error={error} />;
    }
    if (!record) {
        return <Loading />;
    }

    const live = record.status === "active";
    // a bill with payments or credits applied is locked
    const locked = live && Number(record.allocated_total) > 0;

    return (
        <BillForm
            key={`${record.id}-${record.status}-${record.state}-${record.allocated_total}`}
            kind={kind}
            record={locked ? {...record, status: "locked"} : record}
            backTo={PATHS[kind].list}
            onSubmit={async (data) => {
                await api.update(record.id, data);
                await refreshPurchaseLists();
                await mutate();
            }}
            banner={(
                <DocumentBanner
                    state={record.state}
                    progress={live && (record.balance ?? 0) > 0 && Number(record.allocated_total) > 0 ? t('stillOwed', {amount: formatDecimal(record.balance ?? 0), code: record.currency}) : undefined}
                    related={record.related}
                    pathOf={purchaseDocumentPath}
                    einvoice={kind === "self_billed" ? {transType: "self_billed_invoice", transId: record.id, live} : undefined}
                    actions={live ? (
                        <>
                            {(record.balance ?? 0) > 0 && (
                                <Link to={`${SUPPLIER_PAYMENTS_PATH}/create?bill=${record.id}&kind=${kind}`} className="btn btn-primary btn-sm">
                                    <CreditCard size={14} className="me-1" />{t('payBill')}
                                </Link>
                            )}
                            <Link to={`${PATHS[kind].creditNotes}/create?from_bill=${record.id}`} className="btn btn-outline-primary btn-sm">
                                <CornerUpLeft size={14} className="me-1" />{t('creditNote')}
                            </Link>
                            {!locked && (
                                <Button variant="outline-danger" size="sm" onClick={() => einvoice.guard(() => run(async () => {
                                    await api.void(record.id, null);
                                    await einvoice.refresh();
                                }, einvoice.confirmText(t('voidBillText', {ref: record.reference_no})), t('billVoided')))}>
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

export const Bills = () => <BillList kind="bill" />;
export const CreateSupplierBill = () => <CreateBill kind="bill" />;
export const EditSupplierBill = () => <EditBill kind="bill" />;
export const SelfBilledInvoices = () => <BillList kind="self_billed" />;
export const CreateSelfBilledInvoice = () => <CreateBill kind="self_billed" />;
export const EditSelfBilledInvoice = () => <EditBill kind="self_billed" />;
