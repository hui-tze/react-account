import {Badge, Spinner} from "react-bootstrap";
import {AlertCircle, AlertTriangle, CheckCircle, ExternalLink, Info} from "react-feather";
import type {EinvoiceFix, EinvoiceSubmissionMode, EinvoiceTransType} from "@/apis/models/einvoice";
import {einvoiceDocumentApi} from "@/apis/requests/einvoice-api";
import {useSmartTranslation} from "@/hooks/use-translation";
import {CUSTOMERS_PATH} from "@/views/Sales/sales-menu";
import {SUPPLIERS_PATH} from "@/views/Purchases/purchases-menu";
import {ORGANIZATION_PROFILE_PATH} from "@/views/Settings/Organization/Profile";
import {TAX_TYPES_PATH} from "@/views/Settings/Taxes/TaxTypes";
import {EINVOICE_SETTINGS_PATH} from "../einvoice-menu";
import {EinvoiceStatusBadge, EnvironmentBadge} from "./einvoice-ui";

/** Where each kind of problem is corrected. */
function fixPath(fix: EinvoiceFix): string | null {
    switch (fix?.type) {
        case "settings": return EINVOICE_SETTINGS_PATH;
        case "profile": return ORGANIZATION_PROFILE_PATH;
        case "taxes": return fix.id ? `${TAX_TYPES_PATH}/${fix.id}` : TAX_TYPES_PATH;
        case "customer": return fix.id ? `${CUSTOMERS_PATH}/${fix.id}` : null;
        case "supplier": return fix.id ? `${SUPPLIERS_PATH}/${fix.id}` : null;
        default: return null;
    }
}

// the fix opens in a new tab so the document being entered isn't lost; coming back re-checks
function FixLink({fix}: {fix: EinvoiceFix}) {
    const {t} = useSmartTranslation();
    const path = fixPath(fix);
    return path ? (
        <a href={path} target="_blank" rel="noreferrer" className="ms-1 text-nowrap">
            {t('einvFix')}<ExternalLink size={11} className="ms-1" />
        </a>
    ) : null;
}

/** How a submission mode plays out, for the hint under the mode. */
export function useModeDescription() {
    const {t} = useSmartTranslation();
    return (mode: "S" | "I" | "H" | EinvoiceSubmissionMode | null | undefined, scheduledTime: string, autoSubmit: boolean) => {
        if (!autoSubmit && mode !== "H" && mode !== "MANUAL") {
            return t('einvModeDesc_autoOff');
        }
        switch (mode) {
            case "I": case "IMMEDIATE": return t('einvModeDesc_I');
            case "S": case "SCHEDULED": return t('einvModeDesc_S', {time: scheduledTime});
            case "H": case "MANUAL": return t('einvModeDesc_H');
            default: return null;
        }
    };
}

type Props = {
    transType: EinvoiceTransType,
    // customer (sales) or supplier (self-billed) chosen on the form
    partyId: number | null | undefined,
    // saved document: checked in full (lines and tax mapping too)
    transId?: number | null,
};

/**
 * MyInvois readiness of the document being entered: environment, signing, and anything that
 * would stop it from being submitted, each with a link to where it is fixed.
 */
export function EinvoiceReadiness({transType, partyId, transId}: Props) {
    const {t} = useSmartTranslation();
    const {data, isLoading} = einvoiceDocumentApi.useReadiness(transType, partyId, transId);
    const {data: source} = einvoiceDocumentApi.useForSource(transId ? transType : null, transId, {revalidateOnFocus: false});
    const live = source?.document && ["SUBMITTING", "SUBMITTED", "VALID"].includes(source.document.process_status);

    if (isLoading && !data) {
        return <Spinner animation="border" size="sm" />;
    }
    if (!data || !data.supported) {
        return null;
    }
    if (!data.enabled) {
        return (
            <p className="small text-muted mb-0">
                {t('einvNotEnabled')} <a href={EINVOICE_SETTINGS_PATH} target="_blank" rel="noreferrer">{t('einvOpenSettings')}</a>
            </p>
        );
    }

    return (
        <div className="small">
            <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                <EnvironmentBadge environment={data.environment} />
                <Badge bg="light" className={data.signed ? "badge-soft-success" : "badge-soft-secondary"}>
                    {data.signed ? t('einvSigned') : t('einvUnsigned')}
                </Badge>
                {live && source?.document && <EinvoiceStatusBadge status={source.document.process_status} />}
            </div>

            {live ? (
                <p className="text-muted mb-0">{t('einvAlreadySubmitted')}</p>
            ) : data.ready ? (
                <div className="text-success d-flex align-items-center gap-1 mb-1">
                    <CheckCircle size={14} />{transId ? t('einvReadyDocument') : partyId ? t('einvReadyParty') : t('einvReadyCompany')}
                </div>
            ) : (
                <ul className="list-unstyled mb-1">
                    {data.errors.map(e => (
                        <li key={e.message} className="text-danger d-flex gap-1 mb-1">
                            <AlertCircle size={14} className="flex-shrink-0 mt-1" />
                            <span>{e.message}<FixLink fix={e.fix} /></span>
                        </li>
                    ))}
                </ul>
            )}

            {!live && data.notices.length > 0 && (
                <ul className="list-unstyled mb-0">
                    {data.notices.map(n => (
                        <li key={n.message} className={`d-flex gap-1 mb-1 ${n.level === "warning" ? "text-warning" : "text-muted"}`}>
                            {n.level === "warning" ? <AlertTriangle size={14} className="flex-shrink-0 mt-1" /> : <Info size={14} className="flex-shrink-0 mt-1" />}
                            <span>{n.message}<FixLink fix={n.fix} /></span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
