import {addBankAccount} from "@/apis/requests/bank-account-api";
import {SettingsCreatePage} from "@/views/Settings/shared/SettingsEditPage";
import {BankAccountForm} from "../BankAccountForm";
import {BANK_ACCOUNTS_PATH} from "../index";

export default function CreateBankAccount() {
    return <SettingsCreatePage create={addBankAccount} backTo={BANK_ACCOUNTS_PATH} renderForm={(props) => <BankAccountForm {...props} />} />;
}
