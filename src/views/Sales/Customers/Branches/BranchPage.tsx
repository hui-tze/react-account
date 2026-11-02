import {useParams} from "react-router-dom";
import {addCustomerBranch, deleteCustomerBranch, updateCustomerBranch, useGetOneCustomerBranch} from "@/apis/requests/customer-branch-api";
import {useGetOneCustomer} from "@/apis/requests/customer-api";
import SettingsEditPage, {SettingsCreatePage} from "@/views/Settings/shared/SettingsEditPage";
import {useSmartTranslation} from "@/hooks/use-translation";
import {CUSTOMERS_PATH} from "../../sales-menu";
import {BranchForm} from "./BranchForm";

/** /sales/customers/:customerId/branches/create */
export function CreateBranch() {
    const {customerId = ""} = useParams();
    const {data: customer} = useGetOneCustomer(customerId);
    const backTo = `${CUSTOMERS_PATH}/${customerId}`;

    return (
        <SettingsCreatePage
            create={addCustomerBranch}
            backTo={backTo}
            renderForm={(props) => <BranchForm {...props} customerId={Number(customerId)} customerName={customer?.name} />}
        />
    );
}

/** /sales/customers/:customerId/branches/:id */
export function EditBranch() {
    const {t} = useSmartTranslation();
    const {customerId = ""} = useParams();
    const {data: customer} = useGetOneCustomer(customerId);

    return (
        <SettingsEditPage
            useGetOne={useGetOneCustomerBranch}
            update={updateCustomerBranch}
            remove={deleteCustomerBranch}
            backTo={`${CUSTOMERS_PATH}/${customerId}`}
            deleteText={(record) => t('recordDeactivateNamed', {name: record.name})}
            renderForm={(props) => <BranchForm {...props} customerId={Number(customerId)} customerName={customer?.name} />}
        />
    );
}
