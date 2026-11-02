import {addSalesType} from "@/apis/requests/sales-type-api";
import {SettingsCreatePage} from "@/views/Settings/shared/SettingsEditPage";
import {SalesTypeForm} from "../SalesTypeForm";
import {SALES_TYPES_PATH} from "../index";

export default function CreateSalesType() {
    return <SettingsCreatePage create={addSalesType} backTo={SALES_TYPES_PATH} renderForm={(props) => <SalesTypeForm {...props} />} />;
}
