import {Box, DollarSign, Repeat, ShoppingBag, Sliders, TrendingUp, Truck} from "react-feather";
import type {ModuleSidebarConfig} from "@/layout/Module/ModuleSidebarMenu";

export const INVENTORY_PATH = "/inventory";
export const ITEMS_PATH = `${INVENTORY_PATH}/items`;
export const ITEM_MOVEMENTS_PATH = `${INVENTORY_PATH}/item-movements`;
export const ADJUSTMENTS_PATH = `${INVENTORY_PATH}/adjustments`;
export const TRANSFERS_PATH = `${INVENTORY_PATH}/location-transfers`;
export const SALES_PRICING_PATH = `${INVENTORY_PATH}/sales-pricing`;
export const PURCHASING_PRICING_PATH = `${INVENTORY_PATH}/purchasing-pricing`;
export const STANDARD_COSTS_PATH = `${INVENTORY_PATH}/standard-costs`;

/** Sidebar of the Item & Inventory module. */
export const inventoryModule: ModuleSidebarConfig = {
    createMenu: [
        {name: "Item", path: `${ITEMS_PATH}/create`},
        {name: "Item Adjustment", path: `${ADJUSTMENTS_PATH}/create`},
        {name: "Location Transfer", path: `${TRANSFERS_PATH}/create`},
        {name: "Sales Price", path: `${SALES_PRICING_PATH}/create`},
        {name: "Purchase Price", path: `${PURCHASING_PRICING_PATH}/create`},
    ],
    menus: [
        {name: "Items", path: ITEMS_PATH, icon: Box},
        {name: "Item Movement", path: ITEM_MOVEMENTS_PATH, icon: Truck},
        {name: "Adjustments", path: ADJUSTMENTS_PATH, icon: Sliders},
        {name: "Location Transfers", path: TRANSFERS_PATH, icon: Repeat},
    ],
    sections: [
        {
            title: "Pricing And Costs",
            menus: [
                {name: "Sales Pricing", path: SALES_PRICING_PATH, icon: TrendingUp},
                {name: "Purchasing Pricing", path: PURCHASING_PRICING_PATH, icon: ShoppingBag},
                {name: "Standard Costs", path: STANDARD_COSTS_PATH, icon: DollarSign},
            ],
        },
    ],
};
