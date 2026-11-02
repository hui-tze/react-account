import {addCreditStatus} from "@/apis/requests/credit-status-api";
import {SettingsCreatePage} from "@/views/Settings/shared/SettingsEditPage";
import {CreditStatusForm} from "../CreditStatusForm";
import {CREDIT_STATUSES_PATH} from "../index";

export default function CreateCreditStatus() {
    return <SettingsCreatePage create={addCreditStatus} backTo={CREDIT_STATUSES_PATH} renderForm={(props) => <CreditStatusForm {...props} />} />;
}
