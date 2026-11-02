import {deleteCreditStatus, updateCreditStatus, useGetOneCreditStatus} from "@/apis/requests/credit-status-api";
import SettingsEditPage from "@/views/Settings/shared/SettingsEditPage";
import {useSmartTranslation} from "@/hooks/use-translation";
import {CreditStatusForm} from "../CreditStatusForm";
import {CREDIT_STATUSES_PATH} from "../index";

export default function EditCreditStatus() {
    const {t} = useSmartTranslation();

    return (
        <SettingsEditPage
            useGetOne={useGetOneCreditStatus}
            update={updateCreditStatus}
            remove={deleteCreditStatus}
            backTo={CREDIT_STATUSES_PATH}
            deleteText={(record) => t('recordDeactivateNamed', {name: record.name})}
            renderForm={(props) => <CreditStatusForm {...props} />}
        />
    );
}
