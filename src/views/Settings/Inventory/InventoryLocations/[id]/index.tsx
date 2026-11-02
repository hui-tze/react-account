import {deleteInventoryLocation, updateInventoryLocation, useGetOneInventoryLocation} from "@/apis/requests/inventory-location-api";
import SettingsEditPage from "@/views/Settings/shared/SettingsEditPage";
import {useSmartTranslation} from "@/hooks/use-translation";
import {InventoryLocationForm} from "../InventoryLocationForm";
import {INVENTORY_LOCATIONS_PATH} from "../index";

export default function EditInventoryLocation() {
    const {t} = useSmartTranslation();

    return (
        <SettingsEditPage
            useGetOne={useGetOneInventoryLocation}
            update={updateInventoryLocation}
            remove={deleteInventoryLocation}
            backTo={INVENTORY_LOCATIONS_PATH}
            deleteText={(record) => t('recordDeactivateNamed', {name: record.name})}
            renderForm={(props) => <InventoryLocationForm {...props} />}
        />
    );
}
