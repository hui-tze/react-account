/**
 * Menu, sidebar and breadcrumb labels are written in English in their configs (SidebarMenu,
 * *-menu.ts, route handles); this maps each label to a translation key, e.g.
 * "Item & Inventory" -> "menu_ItemInventory". A label without a key shows as written.
 */
export function menuKey(label: string): string {
    return "menu_" + label
        .split(/[^A-Za-z0-9]+/)
        .filter(Boolean)
        .map(word => word[0].toUpperCase() + word.slice(1))
        .join("");
}

export function translateMenu(t: (key: string, options?: Record<string, unknown>) => string, label: string | null | undefined): string {
    return label ? t(menuKey(label), {defaultValue: label}) : "";
}
