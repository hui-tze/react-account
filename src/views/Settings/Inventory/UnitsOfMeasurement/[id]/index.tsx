import {deleteUom, updateUom, useGetOneUom} from "@/apis/requests/uom-api";
import SettingsEditPage from "@/views/Settings/shared/SettingsEditPage";
import {useSmartTranslation} from "@/hooks/use-translation";
import {UomForm} from "../UomForm";
import {UNITS_OF_MEASUREMENT_PATH} from "../index";

export default function EditUom() {
    const {t} = useSmartTranslation();

    return (
        <SettingsEditPage
            useGetOne={useGetOneUom}
            update={updateUom}
            remove={deleteUom}
            backTo={UNITS_OF_MEASUREMENT_PATH}
            deleteText={(record) => t('recordDeactivateNamed', {name: record.name})}
            renderForm={(props) => <UomForm {...props} />}
        />
    );
}
