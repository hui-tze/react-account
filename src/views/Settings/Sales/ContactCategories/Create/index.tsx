import {addContactCategory} from "@/apis/requests/contact-category-api";
import {SettingsCreatePage} from "@/views/Settings/shared/SettingsEditPage";
import {ContactCategoryForm} from "../ContactCategoryForm";
import {CONTACT_CATEGORIES_PATH} from "../index";

export default function CreateContactCategory() {
    return <SettingsCreatePage create={addContactCategory} backTo={CONTACT_CATEGORIES_PATH} renderForm={(props) => <ContactCategoryForm {...props} />} />;
}
