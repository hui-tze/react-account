import {addTaxGroup} from "@/apis/requests/tax-group-api";
import {SettingsCreatePage} from "@/views/Settings/shared/SettingsEditPage";
import {TaxGroupForm} from "../TaxGroupForm";
import {TAX_GROUPS_PATH} from "../index";

export default function CreateTaxGroup() {
    return <SettingsCreatePage create={addTaxGroup} backTo={TAX_GROUPS_PATH} renderForm={(props) => <TaxGroupForm {...props} />} />;
}
