/**
 * Document number pattern placeholders. The backend stores `pattern` as free text and
 * has no generator yet, so this is the convention the UI documents and previews:
 *   {YYYY} 4-digit year, {YY} 2-digit year, {MM} month, {DD} day,
 *   {NUMBER} running number zero-padded to `padding` (appended when absent).
 */
export const PATTERN_PLACEHOLDERS = ["{YYYY}", "{YY}", "{MM}", "{DD}", "{NUMBER}"];

const pad2 = (n: number) => String(n).padStart(2, "0");

export function previewDocumentNumber(pattern: string, padding: number, nextNumber: number, date: Date = new Date()): string {
    const width = Math.max(1, Math.min(20, Number.isFinite(padding) ? padding : 1));
    const number = String(nextNumber).padStart(width, "0");
    const source = pattern || "";

    const filled = source
        .replace(/\{YYYY\}/g, String(date.getFullYear()))
        .replace(/\{YY\}/g, String(date.getFullYear()).slice(-2))
        .replace(/\{MM\}/g, pad2(date.getMonth() + 1))
        .replace(/\{DD\}/g, pad2(date.getDate()))
        .replace(/\{NUMBER\}/g, number);

    return source.includes("{NUMBER}") ? filled : filled + number;
}
