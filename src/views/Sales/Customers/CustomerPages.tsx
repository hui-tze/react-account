import {addCustomer, deleteCustomer, updateCustomer, useGetOneCustomer} from "@/apis/requests/customer-api";
import SettingsEditPage, {SettingsCreatePage} from "@/views/Settings/shared/SettingsEditPage";
import {useSmartTranslation} from "@/hooks/use-translation";
import {CUSTOMERS_PATH} from "../sales-menu";
import {CustomerForm} from "./CustomerForm";

export function CreateCustomer() {
    return <SettingsCreatePage create={addCustomer} backTo={CUSTOMERS_PATH} renderForm={(props) => <CustomerForm {...props} />} />;
}

export function EditCustomer() {
    const {t} = useSmartTranslation();

    return (
        <SettingsEditPage
            useGetOne={useGetOneCustomer}
            update={updateCustomer}
            remove={deleteCustomer}
            backTo={CUSTOMERS_PATH}
            deleteText={(record) => t('recordDeactivateNamed', {name: record.name})}
            renderForm={(props) => <CustomerForm {...props} />}
        />
    );
}
