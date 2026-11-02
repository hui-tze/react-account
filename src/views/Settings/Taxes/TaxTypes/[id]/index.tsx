import {deleteTaxType, updateTaxType, useGetOneTaxType} from "@/apis/requests/tax-type-api";
import SettingsEditPage from "@/views/Settings/shared/SettingsEditPage";
import {useSmartTranslation} from "@/hooks/use-translation";
import {TaxTypeForm} from "../TaxTypeForm";
import {TAX_TYPES_PATH} from "../index";

export default function EditTaxType() {
    const {t} = useSmartTranslation();

    return (
        <SettingsEditPage
            useGetOne={useGetOneTaxType}
            update={updateTaxType}
            remove={deleteTaxType}
            backTo={TAX_TYPES_PATH}
            deleteText={(record) => t('recordDeactivateNamed', {name: record.name})}
            renderForm={(props) => <TaxTypeForm {...props} />}
        />
    );
}
