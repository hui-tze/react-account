import {addTaxType} from "@/apis/requests/tax-type-api";
import {SettingsCreatePage} from "@/views/Settings/shared/SettingsEditPage";
import {TaxTypeForm} from "../TaxTypeForm";
import {TAX_TYPES_PATH} from "../index";

export default function CreateTaxType() {
    return <SettingsCreatePage create={addTaxType} backTo={TAX_TYPES_PATH} renderForm={(props) => <TaxTypeForm {...props} />} />;
}
