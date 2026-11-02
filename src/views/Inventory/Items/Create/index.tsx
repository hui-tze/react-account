import {addItem} from "@/apis/requests/item-api";
import {SettingsCreatePage} from "@/views/Settings/shared/SettingsEditPage";
import {ItemForm} from "../ItemForm";
import {ITEMS_PATH} from "../../inventory-menu";

export default function CreateItem() {
    return <SettingsCreatePage create={addItem} backTo={ITEMS_PATH} renderForm={(props) => <ItemForm {...props} />} />;
}
