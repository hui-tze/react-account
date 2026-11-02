import {deleteItemPurchasePrice, updateItemPurchasePrice, useGetOneItemPurchasePrice} from "@/apis/requests/item-purchase-price-api";
import SettingsEditPage from "@/views/Settings/shared/SettingsEditPage";
import {PurchasePriceForm} from "../PurchasePriceForm";
import {PURCHASING_PRICING_PATH} from "../../inventory-menu";

export default function EditPurchasePrice() {
    return (
        <SettingsEditPage
            useGetOne={useGetOneItemPurchasePrice}
            update={updateItemPurchasePrice}
            remove={deleteItemPurchasePrice}
            backTo={PURCHASING_PRICING_PATH}
            renderForm={(props) => <PurchasePriceForm {...props} />}
        />
    );
}
