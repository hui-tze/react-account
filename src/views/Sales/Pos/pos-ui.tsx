import {Badge, Card} from "react-bootstrap";
import {Layers} from "react-feather";
import moment from "moment";
import {Link} from "@/components/Access/Guarded";
import type {PosDocument} from "@/apis/models/pos";
import type {EinvoiceProcessStatus} from "@/apis/models/einvoice";
import {formatDate} from "@/utils/display-format";
import {useSmartTranslation} from "@/hooks/use-translation";
import {EinvoiceStatusBadge, EinvoiceStrip} from "@/views/Einvoice/shared/einvoice-ui";
import {EINVOICE_CONSOLIDATION_PATH, EINVOICE_DOCUMENTS_PATH} from "@/views/Einvoice/einvoice-menu";

/** Since 1 January 2026 a sale above RM10,000 always needs its own e-invoice (mirrors PosSupport::INDIVIDUAL_ABOVE). */
export const INDIVIDUAL_EINVOICE_ABOVE = 10000;

/** LHDN: a month's consolidated e-invoice is due within 7 days after the month ends. */
export function consolidationDeadline(date: string): string {
    return moment(date).add(1, "month").startOf("month").date(7).format("YYYY-MM-DD");
}

/** "Consolidated" / "Own e-invoice" chip for lists. */
export function EinvoiceTreatmentBadge({doc}: {doc: Pick<PosDocument, "einvoice_treatment">}) {
    const {t} = useSmartTranslation();
    return doc.einvoice_treatment === "consolidated"
        ? <Badge bg="light" text="dark" className="border fw-normal">{t('posConsolidated')}</Badge>
        : <Badge bg="light" className="badge-soft-primary fw-normal">{t('posOwnEinvoiceShort')}</Badge>;
}

/**
 * MyInvois strip of a POS document: its own e-invoice (submit / cancel like an invoice), or the
 * monthly consolidated e-invoice it is reported in.
 */
export function PosEinvoiceStrip({doc}: {doc: PosDocument}) {
    const {t} = useSmartTranslation();
    if (doc.einvoice_treatment === "individual") {
        return <EinvoiceStrip transType={doc.trans_type} transId={doc.id} live={doc.status === "active"} />;
    }

    const consolidation = doc.consolidation;
    const einvoice = consolidation?.document;
    return (
        <Card className="mb-3 border">
            <Card.Body className="py-2 px-3 d-flex flex-wrap align-items-center gap-3">
                <div className="d-flex align-items-center gap-2">
                    <Layers size={15} className="text-muted" />
                    <span className="small fw-semibold text-dark">{t('myInvois')}</span>
                    {einvoice ? <EinvoiceStatusBadge status={einvoice.process_status as EinvoiceProcessStatus} /> : <Badge bg="light" text="dark" className="border fw-normal">{t('posConsolidationPending')}</Badge>}
                </div>
                <div className="small text-muted">
                    {einvoice
                        ? <>{t('posInConsolidated')} <Link to={`${EINVOICE_DOCUMENTS_PATH}/${einvoice.id}`} className="fw-semibold">{einvoice.doc_number}</Link></>
                        : consolidation && t('posConsolidatedNote', {period: consolidation.period, deadline: formatDate(consolidation.deadline)})}
                </div>
                <Link to={`${EINVOICE_CONSOLIDATION_PATH}${consolidation ? `?year=${consolidation.period.slice(0, 4)}` : ""}`} className="ms-auto small">{t('posOpenConsolidation')}</Link>
            </Card.Body>
        </Card>
    );
}
