import {addInventoryAdjustment} from "@/apis/requests/inventory-adjustment-api";
import {SettingsCreatePage} from "@/views/Settings/shared/SettingsEditPage";
import {AdjustmentForm} from "../AdjustmentForm";
import {ADJUSTMENTS_PATH} from "../../inventory-menu";

export default function CreateAdjustment() {
    return <SettingsCreatePage create={addInventoryAdjustment} backTo={ADJUSTMENTS_PATH} renderForm={(props) => <AdjustmentForm {...props} />} />;
}
