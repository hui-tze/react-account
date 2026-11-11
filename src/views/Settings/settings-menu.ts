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
            {name: "E-Invoice (MyInvois)", path: "/settings/organization/einvoice", icon: Send, descriptionKey: "settingsHubEinvoiceDesc"},
            {name: "Users", path: "/settings/organization/users", icon: Users, descriptionKey: "settingsHubUsersDesc"},
            {name: "Roles & Access", path: "/settings/organization/roles", icon: Shield, descriptionKey: "settingsHubRolesDesc"},
            {name: "Opening Balance", path: "/settings/organization/opening-balance", icon: Archive, descriptionKey: "settingsHubOpeningBalanceDesc", comingSoon: true},
        ],
    },
    {
        module: "settings_sales",
        title: "Sales",
        icon: TrendingUp,
        path: "/settings/sales",
        descriptionKey: "settingsHubSalesDesc",
        accentRgb: "255, 145, 0",
        items: [
            {name: "Contact Categories", path: "/settings/sales/contact-categories", icon: Users, descriptionKey: "settingsHubContactCategoriesDesc"},
            {name: "Sales Groups", path: "/settings/sales/sales-groups", icon: Grid, descriptionKey: "settingsHubSalesGroupsDesc"},
            {name: "Sales Type", path: "/settings/sales/sales-types", icon: Tag, descriptionKey: "settingsHubSalesTypeDesc"},
            {name: "Sales Areas", path: "/settings/sales/sales-areas", icon: MapPin, descriptionKey: "settingsHubSalesAreasDesc"},
            {name: "Credit Status", path: "/settings/sales/credit-statuses", icon: CreditCard, descriptionKey: "settingsHubCreditStatusDesc"},
            {name: "Payment Terms", path: "/settings/sales/payment-terms", icon: Clock, descriptionKey: "settingsHubPaymentTermsDesc"},
            {name: "POS Settings", path: "/settings/sales/pos-settings", icon: Monitor, descriptionKey: "settingsHubPosSettingsDesc"},
        ],
    },
    {
        module: "settings_inventory",
        title: "Inventory",
        icon: Box,
        path: "/settings/inventory",
        descriptionKey: "settingsHubInventoryDesc",
        accentRgb: "116, 41, 248",
        items: [
            {name: "Sales Kits", path: "/settings/inventory/sales-kits", icon: Package, descriptionKey: "settingsHubSalesKitsDesc", comingSoon: true},
            {name: "Item Categories", path: "/settings/inventory/item-categories", icon: Folder, descriptionKey: "settingsHubItemCategoriesDesc"},
            {name: "Inventory Locations", path: "/settings/inventory/inventory-locations", icon: MapPin, descriptionKey: "settingsHubInventoryLocationsDesc"},
            {name: "Unit of Measurement", path: "/settings/inventory/units-of-measurement", icon: Sliders, descriptionKey: "settingsHubUomDesc"},
        ],
    },
    {
        module: "settings_banking",
        title: "Banking",
        icon: Briefcase,
        path: "/settings/banking",
        descriptionKey: "settingsHubBankingDesc",
        accentRgb: "50, 43, 243",
        items: [
            {name: "Bank Account", path: "/settings/banking/bank-accounts", icon: CreditCard, descriptionKey: "settingsHubBankAccountDesc"},
        ],
    },
    {
        module: "settings_gl",
        title: "General Ledger",
        icon: BookOpen,
        path: "/settings/gl",
        descriptionKey: "settingsHubGlDesc",
        accentRgb: "0, 170, 103",
        items: [
            {name: "Fiscal Years", path: "/settings/gl/fiscal-years", icon: Calendar, descriptionKey: "settingsHubFiscalYearsDesc"},
            {name: "Chart of Accounts", path: "/settings/gl/chart-of-accounts", icon: Layers, descriptionKey: "settingsHubChartOfAccountsDesc"},
            {name: "Currencies", path: "/settings/gl/currencies", icon: DollarSign, descriptionKey: "settingsHubCurrenciesDesc"},
            {name: "Exchange Rates", path: "/settings/gl/exchange-rates", icon: TrendingUp, descriptionKey: "settingsHubExchangeRatesDesc"},
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
