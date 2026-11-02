import {deleteTaxGroup, updateTaxGroup, useGetOneTaxGroup} from "@/apis/requests/tax-group-api";
import SettingsEditPage from "@/views/Settings/shared/SettingsEditPage";
import {useSmartTranslation} from "@/hooks/use-translation";
import {TaxGroupForm} from "../TaxGroupForm";
import {TAX_GROUPS_PATH} from "../index";

export default function EditTaxGroup() {
    const {t} = useSmartTranslation();

    return (
        <SettingsEditPage
            useGetOne={useGetOneTaxGroup}
            update={updateTaxGroup}
            remove={deleteTaxGroup}
            backTo={TAX_GROUPS_PATH}
            deleteText={(record) => t('recordDeactivateNamed', {name: record.name})}
            renderForm={(props) => <TaxGroupForm {...props} />}
        />
    );
}
