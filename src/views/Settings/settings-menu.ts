import {ComponentType} from "react";
import {
    Archive,
    BookOpen,
    Box,
    Briefcase,
    Calendar,
    Clock,
    CreditCard,
    DollarSign,
    FileText,
    Folder,
    Grid,
    Home,
    Layers,
    MapPin,
    Monitor,
    Package,
    Percent,
    Send,
    Settings,
    Shield,
    Sliders,
    Tag,
    TrendingUp,
    Users,
} from "react-feather";

export type SettingsModule =
    | "settings_organization"
    | "settings_einvoice"
    | "settings_users"
    | "settings_sales"
    | "settings_inventory"
    | "settings_banking"
    | "settings_gl"
    | "settings_taxes";

export type SettingsMenuItem = {
    name: string,
    path: string,
    icon: ComponentType<{size?: number | string}>,
    // translation key of the one-line description on the settings hub
    descriptionKey: string,
    // shown on the settings hub but not linked yet (no backend API)
    comingSoon?: boolean,
};

export type SettingsSection = {
    module: SettingsModule,
    title: string,
    icon: ComponentType<{size?: number | string}>,
    path: string,
    // translation key of the section summary on the settings hub
    descriptionKey: string,
    // section accent on the settings hub, as an "r, g, b" triplet so CSS can derive tints
    accentRgb: string,
    items: SettingsMenuItem[],
};

/** Single source for the settings hub page and each settings module's sidebar. */
export const settingsSections: SettingsSection[] = [
    {
        module: "settings_organization",
        title: "Organization",
        icon: Home,
        path: "/settings/organization",
        descriptionKey: "settingsHubOrganizationDesc",
        accentRgb: "0, 125, 136",
        items: [
            {name: "Profile", path: "/settings/organization/profile", icon: Briefcase, descriptionKey: "settingsHubProfileDesc"},
            {name: "Display Preference", path: "/settings/organization/display-preference", icon: Monitor, descriptionKey: "settingsHubDisplayPreferenceDesc"},
            {name: "Document No", path: "/settings/organization/document-numbering", icon: FileText, descriptionKey: "settingsHubDocumentNoDesc"},
            {name: "System Setup", path: "/settings/organization/system-setup", icon: Settings, descriptionKey: "settingsHubSystemSetupDesc"},
            {name: "Opening Balance", path: "/settings/organization/opening-balance", icon: Archive, descriptionKey: "settingsHubOpeningBalanceDesc", comingSoon: true},
        ],
    },
    {
        module: "settings_einvoice",
        title: "E-Invoice",
        icon: Send,
        path: "/settings/einvoice",
        descriptionKey: "settingsHubEinvoiceSectionDesc",
        accentRgb: "0, 120, 212",
        items: [
            // also in the E-Invoice module at /einvoice/settings
            {name: "MyInvois Settings", path: "/settings/einvoice/myinvois", icon: Send, descriptionKey: "settingsHubEinvoiceDesc"},
        ],
    },
    {
        module: "settings_users",
        title: "User Management",
        icon: Users,
        path: "/settings/user-management",
        descriptionKey: "settingsHubUserManagementDesc",
        accentRgb: "108, 117, 125",
        items: [
            {name: "Users", path: "/settings/user-management/users", icon: Users, descriptionKey: "settingsHubUsersDesc"},
            {name: "Roles & Access", path: "/settings/user-management/roles", icon: Shield, descriptionKey: "settingsHubRolesDesc"},
        ],
    },
    {
        module: "settings_sales",
        title: "Sales",
        icon: TrendingUp,
        path: "/sales/setup",
        descriptionKey: "settingsHubSalesDesc",
        accentRgb: "255, 145, 0",
        items: [
            {name: "Contact Categories", path: "/sales/setup/contact-categories", icon: Users, descriptionKey: "settingsHubContactCategoriesDesc"},
            {name: "Sales Groups", path: "/sales/setup/sales-groups", icon: Grid, descriptionKey: "settingsHubSalesGroupsDesc"},
            {name: "Sales Type", path: "/sales/setup/sales-types", icon: Tag, descriptionKey: "settingsHubSalesTypeDesc"},
            {name: "Sales Areas", path: "/sales/setup/sales-areas", icon: MapPin, descriptionKey: "settingsHubSalesAreasDesc"},
            {name: "Credit Status", path: "/sales/setup/credit-statuses", icon: CreditCard, descriptionKey: "settingsHubCreditStatusDesc"},
            {name: "Payment Terms", path: "/sales/setup/payment-terms", icon: Clock, descriptionKey: "settingsHubPaymentTermsDesc"},
            {name: "POS Settings", path: "/sales/setup/pos-settings", icon: Monitor, descriptionKey: "settingsHubPosSettingsDesc"},
        ],
    },
    {
        module: "settings_inventory",
        title: "Inventory",
        icon: Box,
        path: "/inventory/setup",
        descriptionKey: "settingsHubInventoryDesc",
        accentRgb: "116, 41, 248",
        items: [
            {name: "Sales Kits", path: "/inventory/setup/sales-kits", icon: Package, descriptionKey: "settingsHubSalesKitsDesc", comingSoon: true},
            {name: "Item Categories", path: "/inventory/setup/item-categories", icon: Folder, descriptionKey: "settingsHubItemCategoriesDesc"},
            {name: "Inventory Locations", path: "/inventory/setup/inventory-locations", icon: MapPin, descriptionKey: "settingsHubInventoryLocationsDesc"},
            {name: "Unit of Measurement", path: "/inventory/setup/units-of-measurement", icon: Sliders, descriptionKey: "settingsHubUomDesc"},
        ],
    },
    {
        module: "settings_banking",
        title: "Banking",
        icon: Briefcase,
        path: "/banking/setup",
        descriptionKey: "settingsHubBankingDesc",
        accentRgb: "50, 43, 243",
        items: [
            {name: "Bank Account", path: "/banking/setup/bank-accounts", icon: CreditCard, descriptionKey: "settingsHubBankAccountDesc"},
        ],
    },
    {
        module: "settings_gl",
        title: "General Ledger",
        icon: BookOpen,
        path: "/gl/setup",
        descriptionKey: "settingsHubGlDesc",
        accentRgb: "0, 170, 103",
        items: [
            {name: "Fiscal Years", path: "/gl/setup/fiscal-years", icon: Calendar, descriptionKey: "settingsHubFiscalYearsDesc"},
            {name: "Chart of Accounts", path: "/gl/setup/chart-of-accounts", icon: Layers, descriptionKey: "settingsHubChartOfAccountsDesc"},
            {name: "Currencies", path: "/gl/setup/currencies", icon: DollarSign, descriptionKey: "settingsHubCurrenciesDesc"},
            {name: "Exchange Rates", path: "/gl/setup/exchange-rates", icon: TrendingUp, descriptionKey: "settingsHubExchangeRatesDesc"},
        ],
    },
    {
        module: "settings_taxes",
        title: "Taxes",
        icon: Percent,
        path: "/settings/taxes",
        descriptionKey: "settingsHubTaxesDesc",
        accentRgb: "233, 41, 144",
        items: [
            {name: "Taxes", path: "/settings/taxes/taxes", icon: Percent, descriptionKey: "settingsHubTaxTypesDesc"},
            {name: "Tax Groups", path: "/settings/taxes/tax-groups", icon: Layers, descriptionKey: "settingsHubTaxGroupsDesc"},
            {name: "Item Tax Types", path: "/settings/taxes/item-tax-types", icon: Tag, descriptionKey: "settingsHubItemTaxTypesDesc"},
        ],
    },
];

/**
 * The "Setup" section of a module's sidebar: that module's settings screens, which live under the
 * module (/sales/setup/…) so they open inside it. `rename` relabels an entry for that sidebar.
 */
export function moduleSetupSection(module: SettingsModule, rename: Record<string, string> = {}) {
    const section = settingsSections.find(s => s.module === module);
    return {
        title: "Setup",
        menus: (section?.items ?? [])
            .filter(item => !item.comingSoon)
            .map(({name, path, icon}) => ({name: rename[name] ?? name, path, icon})),
    };
}
