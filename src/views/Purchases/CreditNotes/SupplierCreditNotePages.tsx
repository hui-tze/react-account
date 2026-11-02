import {useRef} from "react";
import {Button} from "react-bootstrap";
import {XCircle} from "react-feather";
import {useNavigate, useParams, useSearchParams} from "react-router-dom";
import {SupplierTransDocument} from "@/apis/models/purchase-document";
import {BillKind, billApis, supplierCreditNoteApis, SupplierCreditNoteRequest} from "@/apis/requests/purchase-api";
import {ConditionalError} from "@/components/Display/ErrorBoundary";
import {formatDecimal} from "@/views/Inventory/shared/options";
import {useSmartTranslation} from "@/hooks/use-translation";
import {DocumentBanner} from "@/views/Sales/shared/DocumentBanner";
import {useEinvoiceVoidCheck} from "@/views/Einvoice/shared/einvoice-ui";
import {DocumentSummary} from "@/views/Sales/shared/DocumentSummary";
import {SalesListPage} from "@/views/Sales/shared/SalesListPage";
import {SalesStateBadge} from "@/views/Sales/shared/SalesStateBadge";
import {BILLS_PATH, purchaseDocumentPath, SELF_BILLED_CREDIT_NOTES_PATH, SELF_BILLED_PATH, SUPPLIER_CREDIT_NOTES_PATH} from "../purchases-menu";
import {Loading, refreshPurchaseLists, useDocumentAction, useSupplierFilter} from "../shared/page-helpers";
import {ApplySupplierCredit} from "../shared/ApplySupplierCredit";
import {SupplierCreditNoteForm} from "./SupplierCreditNoteForm";

const PATHS: Record<BillKind, {list: string, bills: string}> = {
    bill: {list: SUPPLIER_CREDIT_NOTES_PATH, bills: BILLS_PATH},
    self_billed: {list: SELF_BILLED_CREDIT_NOTES_PATH, bills: SELF_BILLED_PATH},
};

function CreditNoteList({kind}: {kind: BillKind}) {
    const {t} = useSmartTranslation();

    return (
        <SalesListPage<SupplierTransDocument>
            useGetAll={supplierCreditNoteApis[kind].useGetAll}
            editPath={(row) => `${PATHS[kind].list}/${row.id}`}
            states={["unallocated", "partially_allocated", "allocated", "voided"]}
            searchPlaceholder={t('searchPurchaseDocuments')}
            partyFilter={useSupplierFilter()}
            columns={[
                {accessor: "trans_date", title: t('date')},
                {accessor: "reference_no", title: t('referenceNo'), render: (row) => <span className="fw-semibold text-dark">{row.reference_no}</span>},
                ...(kind === "bill" ? [{accessor: "supplier_invoice_no", title: t('supplierCreditNoteNo')}] : []),
                {accessor: "supplier_id", title: t('supplier'), render: (row) => row.supplier?.name ?? "-"},
                {accessor: "grand_total", title: t('total'), tdClasses: "text-end", render: (row) => <span>{formatDecimal(row.grand_total)} <span className="text-muted small">{row.currency}</span></span>},
                {accessor: "unallocated", title: t('unapplied'), tdClasses: "text-end", render: (row) => row.status === "active" ? formatDecimal(row.unallocated ?? 0) : "-"},
                {accessor: "state", title: t('status'), render: (row) => <SalesStateBadge state={row.state} />},
            ]}
        />
    );
}

/** New credit note; ?from_bill=ID returns goods from (and applies to) that bill. */
function CreateCreditNote({kind}: {kind: BillKind}) {
    const navigate = useNavigate();
    const [search] = useSearchParams();
    const createdId = useRef<number>();
    const billId = search.get("from_bill");
    const {data: bill, error} = billApis[kind].useGetOne(billId, {revalidateOnFocus: false});
    const path = PATHS[kind].list;

    const onSubmit = async (data: SupplierCreditNoteRequest) => {
        createdId.current = (await supplierCreditNoteApis[kind].add(data)).id;
        await refreshPurchaseLists();
    };
    const onSuccess = async () => navigate(`${path}/${createdId.current}`);

    if (billId && error) {
        return <ConditionalError error={error} />;
    }
    if (billId && !bill) {
        return <Loading />;
    }

    return <SupplierCreditNoteForm key={billId ?? "plain"} kind={kind} bill={bill} backTo={bill ? `${PATHS[kind].bills}/${bill.id}` : path} onSubmit={onSubmit} onSuccess={onSuccess} />;
}

function ViewCreditNote({kind}: {kind: BillKind}) {
    const {t} = useSmartTranslation();
    const {id = ""} = useParams();
    const api = supplierCreditNoteApis[kind];
    const {data: note, mutate, error} = api.useGetOne(id, {revalidateOnFocus: false});
    const run = useDocumentAction(() => mutate());
    const einvoice = useEinvoiceVoidCheck(kind === "self_billed" ? "self_billed_credit_note" : null, id);

    if (error) {
        return <ConditionalError error={error} />;
    }
    if (!note) {
        return <Loading />;
    }

    const canApply = note.status === "active" && (note.unallocated ?? 0) > 0;
    const returnedFrom = [...new Set((note.lines ?? []).filter(l => l.returns_goods).map(l => l.warehouse?.name).filter(Boolean))].join(", ");

    return (
        <DocumentSummary
            document={note}
            currencyCode={note.currency}
            pathOf={purchaseDocumentPath}
            party="supplier"
            showLines
            // an unapplied balance gets the apply editor instead of the read-only list
            allocations={canApply ? undefined : note.allocations}
            facts={[
                {label: t('referenceNo'), value: note.reference_no},
                ...(kind === "bill" ? [{label: t('supplierCreditNoteNo'), value: note.supplier_invoice_no}] : []),
                {label: t('creditNoteDate'), value: note.trans_date},
                {label: t('supplier'), value: note.supplier?.name},
                {label: t('goodsReturned'), value: returnedFrom ? t('returnedFrom', {locations: returnedFrom}) : t('noGoods')},
                {label: t('reasonForCredit'), value: note.remarks},
            ]}
            banner={(
                <DocumentBanner
                    state={note.state}
                    progress={canApply ? t('unappliedAmount', {amount: formatDecimal(note.unallocated ?? 0)}) : undefined}
                    pathOf={purchaseDocumentPath}
                    einvoice={kind === "self_billed" ? {transType: "self_billed_credit_note", transId: note.id, live: note.status === "active"} : undefined}
                    actions={note.status === "active" ? (
                        <Button variant="outline-danger" size="sm" onClick={() => einvoice.guard(() => run(async () => {
                            await api.void(note.id, null);
                            await einvoice.refresh();
                        }, einvoice.confirmText(t('voidCreditNoteText', {ref: note.reference_no})), t('creditNoteVoided')))}>
                            <XCircle size={14} className="me-1" />{t('void')}
                        </Button>
                    ) : undefined}
                />
            )}
        >
            {canApply && <ApplySupplierCredit credit={note} onApplied={async () => { await mutate(); }} />}
        </DocumentSummary>
    );
}

export const SupplierCreditNotes = () => <CreditNoteList kind="bill" />;
export const CreateSupplierCreditNote = () => <CreateCreditNote kind="bill" />;
export const ViewSupplierCreditNote = () => <ViewCreditNote kind="bill" />;
export const SelfBilledCreditNotes = () => <CreditNoteList kind="self_billed" />;
export const CreateSelfBilledCreditNote = () => <CreateCreditNote kind="self_billed" />;
export const ViewSelfBilledCreditNote = () => <ViewCreditNote kind="self_billed" />;
