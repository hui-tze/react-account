import {addPosSetting} from "@/apis/requests/pos-setting-api";
import {SettingsCreatePage} from "@/views/Settings/shared/SettingsEditPage";
import {PosSettingForm} from "../PosSettingForm";
import {POS_SETTINGS_PATH} from "../index";

export default function CreatePosSetting() {
    return <SettingsCreatePage create={addPosSetting} backTo={POS_SETTINGS_PATH} renderForm={(props) => <PosSettingForm {...props} />} />;
}
