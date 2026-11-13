import {BarChart2, Grid, Layers, PieChart, Sliders, Target} from "react-feather";
import type {ModuleSidebarConfig} from "@/layout/Module/ModuleSidebarMenu";

export const DIMENSIONS_PATH = "/dimensions";
export const DIMENSION_LIST_PATH = `${DIMENSIONS_PATH}/list`;
export const DIMENSION_DEFAULTS_PATH = `${DIMENSIONS_PATH}/defaults`;
export const BUDGETS_PATH = `${DIMENSIONS_PATH}/budgets`;
export const BUDGET_VS_ACTUAL_PATH = `${DIMENSIONS_PATH}/budget-vs-actual`;
export const DIMENSION_PROFIT_LOSS_PATH = `${DIMENSIONS_PATH}/profit-loss`;

export const dimensionPath = (id: number) => `${DIMENSION_LIST_PATH}/${id}`;
export const budgetPath = (id: number) => `${BUDGETS_PATH}/${id}`;
export const budgetReportPath = (id: number) => `${BUDGET_VS_ACTUAL_PATH}?budget_id=${id}`;

/** Sidebar of the Budgeting & Cost Centres module. */
export const dimensionsModule: ModuleSidebarConfig = {
    createMenu: [
        {name: "Dimension", path: `${DIMENSION_LIST_PATH}?new=1`},
        {name: "Budget", path: `${BUDGETS_PATH}/create`},
    ],
    menus: [
        {name: "All Dimensions", path: DIMENSION_LIST_PATH, icon: Layers},
        {name: "Default Values", path: DIMENSION_DEFAULTS_PATH, icon: Sliders},
        {name: "Budgets", path: BUDGETS_PATH, icon: Target},
    ],
    sections: [
        {
            title: "Reports",
            menus: [
                {name: "Budget vs Actual", path: BUDGET_VS_ACTUAL_PATH, icon: BarChart2},
                {name: "Profit & Loss by Dimension", path: DIMENSION_PROFIT_LOSS_PATH, icon: PieChart},
                {name: "More Reports", path: `${DIMENSIONS_PATH}/reports`, icon: Grid},
            ],
        },
    ],
};
