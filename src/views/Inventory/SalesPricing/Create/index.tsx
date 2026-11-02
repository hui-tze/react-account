import {addItemSalePrice} from "@/apis/requests/item-sale-price-api";
import {SettingsCreatePage} from "@/views/Settings/shared/SettingsEditPage";
import {SalesPriceForm} from "../SalesPriceForm";
import {SALES_PRICING_PATH} from "../../inventory-menu";

export default function CreateSalesPrice() {
    return <SettingsCreatePage create={addItemSalePrice} backTo={SALES_PRICING_PATH} renderForm={(props) => <SalesPriceForm {...props} />} />;
}
