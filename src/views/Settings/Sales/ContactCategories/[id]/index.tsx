import {deleteContactCategory, updateContactCategory, useGetOneContactCategory} from "@/apis/requests/contact-category-api";
import SettingsEditPage from "@/views/Settings/shared/SettingsEditPage";
import {useSmartTranslation} from "@/hooks/use-translation";
import {ContactCategoryForm} from "../ContactCategoryForm";
import {CONTACT_CATEGORIES_PATH} from "../index";

export default function EditContactCategory() {
    const {t} = useSmartTranslation();

    return (
        <SettingsEditPage
            useGetOne={useGetOneContactCategory}
            update={updateContactCategory}
            remove={deleteContactCategory}
            canDelete={(record) => !record.is_system}
            backTo={CONTACT_CATEGORIES_PATH}
            deleteText={(record) => t('recordDeactivateNamed', {name: record.name})}
            renderForm={(props) => <ContactCategoryForm {...props} />}
        />
    );
}
