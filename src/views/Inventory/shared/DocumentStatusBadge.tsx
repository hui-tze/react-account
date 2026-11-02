import {Badge} from "react-bootstrap";
import {useSmartTranslation} from "@/hooks/use-translation";

/** Posted / Voided badge for stock documents (status active / inactive). */
export function DocumentStatusBadge({status}: {status: string}) {
    const {t} = useSmartTranslation();
    const posted = status === "active";

    return (
        <Badge bg="light" className={posted ? "badge-soft-success" : "badge-soft-danger"}>
            {posted ? t('posted') : t('voided')}
        </Badge>
    );
}
