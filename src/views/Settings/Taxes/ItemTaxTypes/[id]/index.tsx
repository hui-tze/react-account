import {deleteItemTaxCategory, updateItemTaxCategory, useGetOneItemTaxCategory} from "@/apis/requests/item-tax-category-api";
import SettingsEditPage from "@/views/Settings/shared/SettingsEditPage";
import {useSmartTranslation} from "@/hooks/use-translation";
import {ItemTaxTypeForm} from "../ItemTaxTypeForm";
import {ITEM_TAX_TYPES_PATH} from "../index";

export default function EditItemTaxType() {
    const {t} = useSmartTranslation();

    return (
        <SettingsEditPage
            useGetOne={useGetOneItemTaxCategory}
            update={updateItemTaxCategory}
            remove={deleteItemTaxCategory}
            backTo={ITEM_TAX_TYPES_PATH}
            deleteText={(record) => t('recordDeactivateNamed', {name: record.name})}
            renderForm={(props) => <ItemTaxTypeForm {...props} />}
        />
    );
}
