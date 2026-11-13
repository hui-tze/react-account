/*
 * Where each module's reports live. The section keys are the API's (ReportCatalog::SECTIONS);
 * every module shows its own reports at <module>/reports and <module>/reports/<report key>.
 */

export const REPORT_SECTION_PATHS = {
    sales: "/sales/reports",
    purchases: "/purchases/reports",
    inventory: "/inventory/reports",
    banking: "/banking/reports",
    gl: "/gl/reports",
    dimensions: "/dimensions/reports",
    einvoice: "/einvoice/reports",
} as const;

export type ReportSectionKey = keyof typeof REPORT_SECTION_PATHS;

/** A report's screen; `params` pre-fills its filters (e.g. {customer_id: 3}). */
export function reportPath(section: ReportSectionKey, key: string, params?: Record<string, string | number>): string {
    const query = params ? `?${new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]))}` : "";
    return `${REPORT_SECTION_PATHS[section]}/${key}${query}`;
}
