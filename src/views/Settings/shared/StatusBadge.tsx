import {Badge} from "react-bootstrap";
import {useSmartTranslation} from "@/hooks/use-translation";

export function StatusBadge({status}: {status: string}) {
    const {t} = useSmartTranslation();
    const active = status === "active";

    return (
        <Badge bg="light" className={active ? "badge-soft-primary" : "badge-soft-danger"}>
            {active ? t('active') : t('inactive')}
        </Badge>
    );
}

export function YesNoBadge({value}: {value: boolean}) {
    const {t} = useSmartTranslation();

    return (
        <Badge bg="light" className={value ? "badge-soft-success" : "badge-soft-secondary"}>
            {value ? t('yes') : t('no')}
        </Badge>
    );
}
