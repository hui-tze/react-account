import {Button} from "react-bootstrap";
import {ActionButton} from "@/components/Access/Guarded";
import {Plus} from "react-feather";
import {useNewAccountTrigger} from "./NewAccountTrigger";
import {useSmartTranslation} from "@/hooks/use-translation";

export default function ChartOfAccountsHeaderOptions() {
    const {requestNewAccount} = useNewAccountTrigger();
    const {t} = useSmartTranslation();

    return (
        <ActionButton action="create" variant="primary" size="sm" onClick={requestNewAccount}>
            <Plus size={16} className="me-1" /> {t('newAccount')}
        </ActionButton>
    );
}
