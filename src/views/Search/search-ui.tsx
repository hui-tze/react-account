import {ReactNode} from "react";
import {BookOpen, Box, CreditCard, FileText, Hash, ShoppingCart, Truck, User, Users} from "react-feather";
import classNames from "classnames";
import type {SearchDocument, SearchMatchField, SearchRecord, SearchResults} from "@/apis/requests/search-api";
import {useSmartTranslation} from "@/hooks/use-translation";
import {formatDate} from "@/utils/display-format";
import {formatDecimal} from "@/views/Inventory/shared/options";
import {CUSTOMERS_PATH} from "@/views/Sales/sales-menu";
import {SUPPLIERS_PATH} from "@/views/Purchases/purchases-menu";
import {ITEMS_PATH} from "@/views/Inventory/inventory-menu";
import {accountLedgerPath} from "@/views/GeneralLedger/gl-menu";

export type RecordKind = "customers" | "suppliers" | "items" | "accounts";
export const RECORD_KINDS: RecordKind[] = ["customers", "suppliers", "items", "accounts"];

/** Screen of a customer / supplier / item / account found by the search. */
export function recordPath(kind: RecordKind, id: number): string {
    switch (kind) {
        case "customers":
            return `${CUSTOMERS_PATH}/${id}`;
        case "suppliers":
            return `${SUPPLIERS_PATH}/${id}`;
        case "items":
            return `${ITEMS_PATH}/${id}`;
        default:
            return accountLedgerPath(id);
    }
}

/** Document families, for icons and the results page filter. */
export const DOCUMENT_GROUPS: {key: string, labelKey: string, types: string[]}[] = [
    {key: "sales", labelKey: 'menu_Sales', types: ["sales_quotation", "sales_order", "delivery_note", "sales_invoice", "customer_credit_note", "customer_payment", "pos_receipt", "pos_credit_note"]},
    {key: "purchases", labelKey: 'menu_Purchases', types: ["purchase_order", "purchase_order_delivery", "supplier_bill", "self_billed_invoice", "supplier_credit_note", "self_billed_credit_note", "supplier_payment"]},
    {key: "banking", labelKey: 'menu_Banking', types: ["bank_payment", "bank_deposit", "funds_transfer"]},
    {key: "gl", labelKey: 'menu_GeneralLedger', types: ["journal_entry"]},
];

function documentIcon(type: string): ReactNode {
    if (type === "journal_entry") {
        return <BookOpen size={15} />;
    }
    if (["bank_payment", "bank_deposit", "funds_transfer", "customer_payment", "supplier_payment"].includes(type)) {
        return <CreditCard size={15} />;
    }
    if (type === "delivery_note" || type === "purchase_order_delivery") {
        return <Truck size={15} />;
    }
    if (DOCUMENT_GROUPS[1].types.includes(type)) {
        return <ShoppingCart size={15} />;
    }
    return <FileText size={15} />;
}

const RECORD_ICONS: Record<RecordKind, ReactNode> = {
    customers: <User size={15} />,
    suppliers: <Users size={15} />,
    items: <Box size={15} />,
    accounts: <Hash size={15} />,
};

const MATCH_KEYS: Record<SearchMatchField, string> = {
    line: 'searchMatchLine', party: 'searchMatchParty', amount: 'amount', customer_ref: 'searchMatchCustomerRef', supplier_ref: 'supplierInvoiceNo',
    remarks: 'remarks', notes: 'internalNoteNotPrinted', memo: 'memo', deliver_to: 'deliverTo', payor: 'searchMatchPayor', contact_no: 'contactNo', payee: 'payee',
    source_reference: 'sourceReference', batch: 'searchMatchBatch',
};

/** `text` with every occurrence of `query` marked. */
export function Highlight({text, query}: {text: string | null | undefined, query: string}) {
    const value = text ?? "";
    const q = query.trim();
    if (!q || q.length < 2) {
        return <>{value}</>;
    }
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = value.split(new RegExp(`(${escaped})`, "ig"));
    return <>{parts.map((part, i) => part.toLowerCase() === q.toLowerCase() ? <mark key={i}>{part}</mark> : part)}</>;
}

/** One document found: type, reference, party, date, total, and what matched. */
export function DocumentResult({doc, query, active, onSelect}: {doc: SearchDocument, query: string, active?: boolean, onSelect: () => void}) {
    const {t} = useSmartTranslation();
    return (
        <button type="button" className={classNames("gs-row", {"is-active": active, "is-voided": doc.status === "inactive"})} onClick={onSelect}
            onMouseDown={(e) => e.preventDefault()}>
            <span className="gs-row-icon">{documentIcon(doc.type)}</span>
            <span className="gs-row-main">
                <span className="gs-row-title">
                    <span className="gs-ref"><Highlight text={doc.reference_no} query={query} /></span>
                    <span className="gs-type">{t(`docType_${doc.type}`, {defaultValue: doc.type.replace(/_/g, " ")})}</span>
                    {doc.status === "inactive" && <span className="gs-type gs-type-void">{t('voided')}</span>}
                </span>
                <span className="gs-row-sub">
                    {doc.party && <span className="text-truncate"><Highlight text={doc.party} query={query} /></span>}
                    {doc.date && <span>{formatDate(doc.date)}</span>}
                </span>
                {doc.match && doc.match.field !== "party" && (
                    <span className="gs-row-match">
                        <span className="gs-match-label">{t(MATCH_KEYS[doc.match.field] ?? doc.match.field)}:</span> <Highlight text={doc.match.text} query={query} />
                    </span>
                )}
            </span>
            {doc.amount !== null && (
                <span className="gs-row-amount">{doc.currency && <small>{doc.currency} </small>}{formatDecimal(doc.amount)}</span>
            )}
        </button>
    );
}

/** One customer / supplier / item / account found. */
export function RecordResult({kind, record, query, active, onSelect}: {kind: RecordKind, record: SearchRecord, query: string, active?: boolean, onSelect: () => void}) {
    return (
        <button type="button" className={classNames("gs-row", {"is-active": active, "is-voided": record.status === "inactive"})} onClick={onSelect}
            onMouseDown={(e) => e.preventDefault()}>
            <span className="gs-row-icon">{RECORD_ICONS[kind]}</span>
            <span className="gs-row-main">
                <span className="gs-row-title">
                    {record.code && <span className="gs-code"><Highlight text={record.code} query={query} /></span>}
                    <span className="gs-ref"><Highlight text={record.name} query={query} /></span>
                </span>
                {record.tin && <span className="gs-row-sub"><span>TIN <Highlight text={record.tin} query={query} /></span></span>}
            </span>
        </button>
    );
}

/** Documents first, then each kind of record — in the order the keyboard walks them. */
export type SearchEntry =
    | {kind: "document", doc: SearchDocument}
    | {kind: RecordKind, record: SearchRecord};

export function flatten(results: SearchResults | undefined): SearchEntry[] {
    if (!results) {
        return [];
    }
    return [
        ...results.documents.map(doc => ({kind: "document" as const, doc})),
        ...([] as SearchEntry[]).concat(...RECORD_KINDS.map(kind => (results.records[kind] ?? []).map(record => ({kind, record})))),
    ];
}

export const RECORD_LABEL_KEYS: Record<RecordKind, string> = {customers: 'customers', suppliers: 'suppliers', items: 'items', accounts: 'accounts'};
