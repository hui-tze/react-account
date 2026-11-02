import {addItemTaxCategory} from "@/apis/requests/item-tax-category-api";
import {SettingsCreatePage} from "@/views/Settings/shared/SettingsEditPage";
import {ItemTaxTypeForm} from "../ItemTaxTypeForm";
import {ITEM_TAX_TYPES_PATH} from "../index";

export default function CreateItemTaxType() {
    return <SettingsCreatePage create={addItemTaxCategory} backTo={ITEM_TAX_TYPES_PATH} renderForm={(props) => <ItemTaxTypeForm {...props} />} />;
}
