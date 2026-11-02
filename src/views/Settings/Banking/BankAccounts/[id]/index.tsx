import {deleteBankAccount, updateBankAccount, useGetOneBankAccount} from "@/apis/requests/bank-account-api";
import SettingsEditPage from "@/views/Settings/shared/SettingsEditPage";
import {useSmartTranslation} from "@/hooks/use-translation";
import {BankAccountForm} from "../BankAccountForm";
import {BANK_ACCOUNTS_PATH} from "../index";

export default function EditBankAccount() {
    const {t} = useSmartTranslation();

    return (
        <SettingsEditPage
            useGetOne={useGetOneBankAccount}
            update={updateBankAccount}
            remove={deleteBankAccount}
            backTo={BANK_ACCOUNTS_PATH}
            deleteText={(record) => t('recordDeactivateNamed', {name: record.account_name || record.account_number || ""})}
            renderForm={(props) => <BankAccountForm {...props} />}
        />
    );
}
