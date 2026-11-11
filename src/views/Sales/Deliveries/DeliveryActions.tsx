import {FileText} from "react-feather";
import {Link} from "@/components/Access/Guarded";
import {CustomerTransDocument} from "@/apis/models/sales-document";
import {useSmartTranslation} from "@/hooks/use-translation";
import {INVOICES_PATH} from "../sales-menu";

/** Next step from a delivery note: invoice what is still uninvoiced. */
export function DeliveryActions({note}: {note: CustomerTransDocument}) {
    const {t} = useSmartTranslation();

    if (note.state === "invoiced") {
        return null;
    }
    return (
        <Link to={`${INVOICES_PATH}/create?from_delivery=${note.id}`} className="btn btn-primary btn-sm">
            <FileText size={14} className="me-1" />{t('createInvoice')}
        </Link>
    );
}
