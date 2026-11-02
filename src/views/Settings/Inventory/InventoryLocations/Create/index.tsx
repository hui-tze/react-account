import {addInventoryLocation} from "@/apis/requests/inventory-location-api";
import {SettingsCreatePage} from "@/views/Settings/shared/SettingsEditPage";
import {InventoryLocationForm} from "../InventoryLocationForm";
import {INVENTORY_LOCATIONS_PATH} from "../index";

export default function CreateInventoryLocation() {
    return <SettingsCreatePage create={addInventoryLocation} backTo={INVENTORY_LOCATIONS_PATH} renderForm={(props) => <InventoryLocationForm {...props} />} />;
}
