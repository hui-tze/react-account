import {deleteItemSalePrice, updateItemSalePrice, useGetOneItemSalePrice} from "@/apis/requests/item-sale-price-api";
import SettingsEditPage from "@/views/Settings/shared/SettingsEditPage";
import {SalesPriceForm} from "../SalesPriceForm";
import {SALES_PRICING_PATH} from "../../inventory-menu";

export default function EditSalesPrice() {
    return (
        <SettingsEditPage
            useGetOne={useGetOneItemSalePrice}
            update={updateItemSalePrice}
            remove={deleteItemSalePrice}
            backTo={SALES_PRICING_PATH}
            renderForm={(props) => <SalesPriceForm {...props} />}
        />
    );
}
