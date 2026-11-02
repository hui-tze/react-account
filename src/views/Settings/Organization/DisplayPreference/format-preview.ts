const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const pad2 = (n: number) => String(n).padStart(2, "0");

/** Renders a date with a PHP date() format string (common tokens only). */
export function formatPhpDate(date: Date, format: string): string {
    const tokens: Record<string, () => string> = {
        d: () => pad2(date.getDate()),
        j: () => String(date.getDate()),
        m: () => pad2(date.getMonth() + 1),
        n: () => String(date.getMonth() + 1),
        Y: () => String(date.getFullYear()),
        y: () => String(date.getFullYear()).slice(-2),
        M: () => MONTHS_SHORT[date.getMonth()],
        F: () => MONTHS_LONG[date.getMonth()],
        D: () => DAYS_SHORT[date.getDay()],
    };

    let out = "";
    for (let i = 0; i < format.length; i++) {
        const ch = format[i];
        if (ch === "\\" && i + 1 < format.length) {
            out += format[++i];
        } else {
            out += tokens[ch] ? tokens[ch]() : ch;
        }
    }
    return out;
}

/** Formats a number with fixed decimals and custom separators. */
export function formatNumber(value: number, decimals: number, thousandSeparator: string, decimalSeparator: string): string {
    const places = Math.max(0, Math.min(10, Number.isFinite(decimals) ? decimals : 0));
    const [intPart, fraction] = Math.abs(value).toFixed(places).split(".");
    const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);
    const sign = value < 0 ? "-" : "";
    return sign + grouped + (fraction ? decimalSeparator + fraction : "");
}

/** The first separator character used in a date format (e.g. "/" for d/m/Y). */
export function separatorOf(format: string): string | undefined {
    return format.match(/[^A-Za-z\\]/)?.[0];
}

/** Rewrites every separator in a date format to `separator`. */
export function withSeparator(format: string, separator: string): string {
    return format.replace(/[^A-Za-z\\]/g, separator);
}
