import {ReactNode} from "react";
import {Card} from "react-bootstrap";
import {ArrowRight, Link2} from "react-feather";
import {Link} from "@/components/Access/Guarded";
import type {RelatedDocument} from "@/apis/models/sales-document";
import {formatDecimal} from "@/views/Inventory/shared/options";
import {useSmartTranslation} from "@/hooks/use-translation";
import {salesDocumentPath} from "../sales-menu";
import {SalesStateBadge} from "./SalesStateBadge";
import type {EinvoiceTransType} from "@/apis/models/einvoice";
import {EinvoiceStrip} from "@/views/Einvoice/shared/einvoice-ui";

type DocumentBannerProps = {
    state: string,
    // e.g. "Delivered 3 of 10"
    progress?: string,
    // the document this one came from
    source?: {type: string, id: number, reference_no: string} | null,
    related?: RelatedDocument[],
    // workflow buttons (convert, deliver, cancel, …)
    actions?: ReactNode,
    // where a document opens (default: the sales screens)
    pathOf?: (type: string, id: number) => string | null,
    // MyInvois status and actions for documents that are e-invoiced
    einvoice?: {transType: EinvoiceTransType, transId: number, live: boolean},
};

/** Top strip of a saved document: where it stands, where it came from, what came of it, and what to do next. */
export function DocumentBanner({state, progress, source, related, actions, pathOf = salesDocumentPath, einvoice}: DocumentBannerProps) {
    const {t} = useSmartTranslation();

    const chip = (doc: {type: string, id: number, reference_no: string}, extra?: string) => {
        const path = pathOf(doc.type, doc.id);
        const text = <>{t(`docType_${doc.type}`)} <span className="fw-semibold">{doc.reference_no}</span>{extra}</>;
        return path
            ? <Link key={`${doc.type}-${doc.id}`} to={path} className="badge bg-light text-dark border fw-normal text-decoration-none">{text}</Link>
            : <span key={`${doc.type}-${doc.id}`} className="badge bg-light text-dark border fw-normal">{text}</span>;
    };

    return (
        <>
        <Card className="mb-3 border-0 bg-light">
            <Card.Body className="py-2 px-3 d-flex flex-wrap align-items-center gap-3">
                <div className="d-flex align-items-center gap-2">
                    <SalesStateBadge state={state} />
                    {progress && <span className="small text-muted">{progress}</span>}
                </div>
                {source && (
                    <div className="d-flex align-items-center gap-2 small">
                        <Link2 size={14} className="text-muted" />
                        <span className="text-muted">{t('createdFrom')}</span>
                        {chip(source)}
                    </div>
                )}
                {!!related?.length && (
                    <div className="d-flex flex-wrap align-items-center gap-2 small">
                        <ArrowRight size={14} className="text-muted" />
                        {related.map(doc => chip(doc, doc.status === "cancelled" || doc.status === "inactive" || doc.status === "voided" ? ` · ${t('salesState_cancelled')}` : (doc.amount != null ? ` · ${formatDecimal(doc.amount)}` : undefined)))}
                    </div>
                )}
                {actions && <div className="ms-auto d-flex flex-wrap gap-2">{actions}</div>}
            </Card.Body>
        </Card>
        {einvoice && <EinvoiceStrip {...einvoice} />}
        </>
    );
}
