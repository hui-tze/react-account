import {Link} from "@/components/Access/Guarded";
import {Plus} from "react-feather";
import {useSmartTranslation} from "@/hooks/use-translation";

export default function FiscalYearHeaderOptions() {
    const {t} = useSmartTranslation();

    return (
        <Link to="/settings/gl/fiscal-years/create" className="btn btn-primary btn-sm">
            <Plus size={16} className="me-1" /> {t('newFiscalYear')}
        </Link>
    );
}
