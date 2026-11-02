import {addItemCategory} from "@/apis/requests/item-category-api";
import {SettingsCreatePage} from "@/views/Settings/shared/SettingsEditPage";
import {ItemCategoryForm} from "../ItemCategoryForm";
import {ITEM_CATEGORIES_PATH} from "../index";

export default function CreateItemCategory() {
    return <SettingsCreatePage create={addItemCategory} backTo={ITEM_CATEGORIES_PATH} renderForm={(props) => <ItemCategoryForm {...props} />} />;
}
