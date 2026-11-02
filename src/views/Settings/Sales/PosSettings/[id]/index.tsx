import {deletePosSetting, updatePosSetting, useGetOnePosSetting} from "@/apis/requests/pos-setting-api";
import SettingsEditPage from "@/views/Settings/shared/SettingsEditPage";
import {useSmartTranslation} from "@/hooks/use-translation";
import {PosSettingForm} from "../PosSettingForm";
import {POS_SETTINGS_PATH} from "../index";

export default function EditPosSetting() {
    const {t} = useSmartTranslation();

    return (
        <SettingsEditPage
            useGetOne={useGetOnePosSetting}
            update={updatePosSetting}
            remove={deletePosSetting}
            backTo={POS_SETTINGS_PATH}
            deleteText={(record) => t('recordDeactivateNamed', {name: record.name})}
            renderForm={(props) => <PosSettingForm {...props} />}
        />
    );
}
