// SecondarySidebarMenu.tsx

import { ComponentType } from 'react';
import { settingsSections } from '@/views/Settings/settings-menu';
import { settingsPathOf } from '@/utils/setup-area';
import { inventoryModule } from '@/views/Inventory/inventory-menu';
import { salesModule } from '@/views/Sales/sales-menu';
import { purchasesModule } from '@/views/Purchases/purchases-menu';
import { einvoiceModule } from '@/views/Einvoice/einvoice-menu';
import { glModule } from '@/views/GeneralLedger/gl-menu';
import { bankingModule } from '@/views/Banking/banking-menu';
import { dimensionsModule } from '@/views/Dimensions/dimensions-menu';

export interface ModuleSidebarItem {
    name: string;
    path: string;
    icon: ComponentType;
    badge?: string | number;
}

export interface ModuleSidebarSection {
    title: string;
    menus: ModuleSidebarItem[];
}

export interface ModuleSidebarAction {
    name: string;
    path: string;
    type?: 'primary' | 'secondary';
}

export interface ModuleSidebarConfig {
    actions?: ModuleSidebarAction[];
    // entries of the "Create" dropdown button at the top of the sidebar
    createMenu?: ModuleSidebarAction[];
    menus?: ModuleSidebarItem[];
    sections?: ModuleSidebarSection[];
}

// settings modules come from the shared settings menu (also used by the settings hub page);
// items without a backend yet are left out of the sidebar.
const settingsModules = settingsSections.reduce<Record<string, ModuleSidebarConfig>>((modules, section) => {
    modules[section.module] = {
        actions: [],
        menus: section.items
            .filter((item) => !item.comingSoon)
            // module setup screens: their Settings address here (/settings/sales/…)
            .map(({ name, path, icon }) => ({ name, path: settingsPathOf(path), icon })),
    };
    return modules;
}, {});

export const ModuleSidebarMenu: Record<string, ModuleSidebarConfig> = {
    ...settingsModules,
    inventory: inventoryModule,
    sales: salesModule,
    purchases: purchasesModule,
    einvoice: einvoiceModule,
    gl: glModule,
    banking: bankingModule,
    dimensions: dimensionsModule,
};
