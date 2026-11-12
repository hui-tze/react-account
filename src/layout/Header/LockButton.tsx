import {Button} from "react-bootstrap";
import {Lock} from "react-feather";
import {useAuth} from "@/providers/auth";
import {useSmartTranslation} from "@/hooks/use-translation";

/** Top bar: locks the screen now (the page stays as it is underneath). */
export function LockButton() {
    const {t} = useSmartTranslation();
    const auth = useAuth();

    return (
        <Button variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover"
            onClick={auth.lock} title={t('lockScreen')} aria-label={t('lockScreen')}>
            <span className="icon">
                <span className="feather-icon">
                    <Lock />
                </span>
            </span>
        </Button>
    );
}
