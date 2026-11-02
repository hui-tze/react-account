import {addItemPurchasePrice} from "@/apis/requests/item-purchase-price-api";
import {SettingsCreatePage} from "@/views/Settings/shared/SettingsEditPage";
import {PurchasePriceForm} from "../PurchasePriceForm";
import {PURCHASING_PRICING_PATH} from "../../inventory-menu";

export default function CreatePurchasePrice() {
    return <SettingsCreatePage create={addItemPurchasePrice} backTo={PURCHASING_PRICING_PATH} renderForm={(props) => <PurchasePriceForm {...props} />} />;
}
