import {addUom} from "@/apis/requests/uom-api";
import {SettingsCreatePage} from "@/views/Settings/shared/SettingsEditPage";
import {UomForm} from "../UomForm";
import {UNITS_OF_MEASUREMENT_PATH} from "../index";

export default function CreateUom() {
    return <SettingsCreatePage create={addUom} backTo={UNITS_OF_MEASUREMENT_PATH} renderForm={(props) => <UomForm {...props} />} />;
}
