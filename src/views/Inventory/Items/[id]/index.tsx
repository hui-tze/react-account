import {deleteItem, updateItem, useGetOneItem} from "@/apis/requests/item-api";
import SettingsEditPage from "@/views/Settings/shared/SettingsEditPage";
import {useSmartTranslation} from "@/hooks/use-translation";
import {ItemForm} from "../ItemForm";
import {ITEMS_PATH} from "../../inventory-menu";

export default function EditItem() {
    const {t} = useSmartTranslation();

    return (
        <SettingsEditPage
            useGetOne={useGetOneItem}
            update={updateItem}
            remove={deleteItem}
            backTo={ITEMS_PATH}
            deleteText={(record) => t('recordDeactivateNamed', {name: record.name})}
            renderForm={(props) => <ItemForm {...props} />}
        />
    );
}
