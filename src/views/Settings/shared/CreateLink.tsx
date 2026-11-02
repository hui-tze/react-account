import {Link} from "react-router-dom";
import {Plus} from "react-feather";
import {useSmartTranslation} from "@/hooks/use-translation";

export type CreateLinkProps = {
    to: string,
    // translation key for the button label
    labelKey: string,
};

/** "New …" button rendered in the module header (route handle `headerOptions`). */
export default function CreateLink({to, labelKey}: CreateLinkProps) {
    const {t} = useSmartTranslation();

    return (
        <Link to={to} className="btn btn-primary btn-sm">
            <Plus size={16} className="me-1" /> {t(labelKey)}
        </Link>
    );
}
