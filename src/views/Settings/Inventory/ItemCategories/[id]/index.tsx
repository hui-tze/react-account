import {deleteItemCategory, updateItemCategory, useGetOneItemCategory} from "@/apis/requests/item-category-api";
import SettingsEditPage from "@/views/Settings/shared/SettingsEditPage";
import {useSmartTranslation} from "@/hooks/use-translation";
import {ItemCategoryForm} from "../ItemCategoryForm";
import {ITEM_CATEGORIES_PATH} from "../index";

export default function EditItemCategory() {
    const {t} = useSmartTranslation();

    return (
        <SettingsEditPage
            useGetOne={useGetOneItemCategory}
            update={updateItemCategory}
            remove={deleteItemCategory}
            backTo={ITEM_CATEGORIES_PATH}
            deleteText={(record) => t('recordDeactivateNamed', {name: record.name})}
            renderForm={(props) => <ItemCategoryForm {...props} />}
        />
    );
}
