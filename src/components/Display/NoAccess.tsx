import {Lock} from "react-feather";
import {Link} from "react-router-dom";
import {useSmartTranslation} from "@/hooks/use-translation";
import {useAccess} from "@/providers/access";

/** Shown instead of a screen the user's role doesn't allow. */
export function NoAccess() {
    const {t} = useSmartTranslation();
    const {access} = useAccess();

    return (
        <div className="no-access">
            <div className="no-access-icon"><Lock size={28} /></div>
            <h5 className="mb-1">{t('noAccessTitle')}</h5>
            <p className="text-muted mb-3">
                {access?.role ? t('noAccessRole', {role: access.role.name}) : t('noAccessNoRole')}
            </p>
            <Link to="/" className="btn btn-outline-primary btn-sm">{t('backToDashboard')}</Link>
        </div>
    );
}
