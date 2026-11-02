import {addSalesGroup} from "@/apis/requests/sales-group-api";
import {SettingsCreatePage} from "@/views/Settings/shared/SettingsEditPage";
import {SalesGroupForm} from "../SalesGroupForm";
import {SALES_GROUPS_PATH} from "../index";

export default function CreateSalesGroup() {
    return <SettingsCreatePage create={addSalesGroup} backTo={SALES_GROUPS_PATH} renderForm={(props) => <SalesGroupForm {...props} />} />;
}
