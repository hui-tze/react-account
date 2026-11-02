import {updateItemStandardCost, useGetOneItem} from "@/apis/requests/item-api";
import SettingsEditPage from "@/views/Settings/shared/SettingsEditPage";
import {StandardCostForm} from "../StandardCostForm";
import {STANDARD_COSTS_PATH} from "../../inventory-menu";

export default function EditStandardCost() {
    return (
        <SettingsEditPage
            useGetOne={useGetOneItem}
            update={updateItemStandardCost}
            backTo={STANDARD_COSTS_PATH}
            renderForm={(props) => <StandardCostForm {...props} />}
        />
    );
}
