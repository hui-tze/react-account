import type {DisplaySettings} from "@/apis/models/system-setting";
import {formatNumber, formatPhpDate} from "@/views/Settings/Organization/DisplayPreference/format-preview";

/*
 * Numbers and dates as set in Settings → Display Preference. DisplayPreferences (in Nav) loads
 * the company's settings once after sign-in and remounts the app when they change, so these
 * plain functions can be called anywhere while rendering.
 */

export const DEFAULT_DISPLAY_SETTINGS: DisplaySettings = {
    price_decimal_places: 2,
    quantity_decimal_places: 2,
    exchange_rate_decimal_places: 2,
    percentage_decimal_places: 2,
    records_per_page: 20,
    date_separator: "/",
    thousand_separator: ",",
    decimal_separator: ".",
    date_format: "d/m/Y",
};

let current: DisplaySettings = DEFAULT_DISPLAY_SETTINGS;

export function setDisplaySettings(settings: Partial<DisplaySettings> | null | undefined): void {
    current = {...DEFAULT_DISPLAY_SETTINGS, ...(settings ?? {})};
}

export function displaySettings(): DisplaySettings {
    return current;
}

function number(value: string | number | null | undefined, places: number): string {
    const n = Number(value ?? 0);
    return Number.isFinite(n) ? formatNumber(n, places, current.thousand_separator, current.decimal_separator) : "-";
}

/** Money and prices (price decimal places), or `places` when a figure needs its own precision. */
export const formatAmount = (value: string | number | null | undefined, places?: number) => number(value, places ?? current.price_decimal_places);
export const formatQuantity = (value: string | number | null | undefined) => number(value, current.quantity_decimal_places);
export const formatRate = (value: string | number | null | undefined) => number(value, current.exchange_rate_decimal_places);
export const formatPercent = (value: string | number | null | undefined) => number(value, current.percentage_decimal_places);

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})/;

/** True for a "YYYY-MM-DD" date (optionally with a time), as the API sends dates. */
export const isIsoDate = (value: unknown): value is string => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);

/** A date in the company's format. Accepts "YYYY-MM-DD", a timestamp string or a Date. */
export function formatDate(value: string | Date | null | undefined, empty = "-"): string {
    if (!value) {
        return empty;
    }
    let date: Date;
    if (value instanceof Date) {
        date = value;
    } else {
        const m = value.match(ISO_DATE);
        // a plain date is a calendar day: read it as local, not UTC
        date = m && value.length <= 10 ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(value);
    }
    return Number.isNaN(date.getTime()) ? String(value) : formatPhpDate(date, current.date_format);
}

/** Date and time (24-hour) in the company's date format. */
export function formatDateTime(value: string | Date | null | undefined, empty = "-"): string {
    if (!value) {
        return empty;
    }
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
        return String(value);
    }
    return `${formatPhpDate(date, current.date_format)} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}
