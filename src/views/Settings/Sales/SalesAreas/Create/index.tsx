import {addSalesArea} from "@/apis/requests/sales-area-api";
import {SettingsCreatePage} from "@/views/Settings/shared/SettingsEditPage";
import {SalesAreaForm} from "../SalesAreaForm";
import {SALES_AREAS_PATH} from "../index";

export default function CreateSalesArea() {
    return <SettingsCreatePage create={addSalesArea} backTo={SALES_AREAS_PATH} renderForm={(props) => <SalesAreaForm {...props} />} />;
}
