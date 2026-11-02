import {Link} from "react-router-dom";
import {Plus} from "react-feather";
import {useSmartTranslation} from "@/hooks/use-translation";

export default function ExchangeRateHeaderOptions() {
    const {t} = useSmartTranslation();

    return (
        <Link to="/settings/gl/exchange-rates/create" className="btn btn-primary btn-sm">
            <Plus size={16} className="me-1" /> {t('newExchangeRate')}
        </Link>
    );
}
