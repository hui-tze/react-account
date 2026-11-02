import {addLocationTransfer} from "@/apis/requests/location-transfer-api";
import {SettingsCreatePage} from "@/views/Settings/shared/SettingsEditPage";
import {TransferForm} from "../TransferForm";
import {TRANSFERS_PATH} from "../../inventory-menu";

export default function CreateTransfer() {
    return <SettingsCreatePage create={addLocationTransfer} backTo={TRANSFERS_PATH} renderForm={(props) => <TransferForm {...props} />} />;
}
