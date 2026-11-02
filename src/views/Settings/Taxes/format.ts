/** "6.0000" -> "6%", "8.25" -> "8.25%" */
export function formatRate(rate: string | number | null | undefined): string {
    const value = Number(rate ?? 0);
    return `${Number.isFinite(value) ? parseFloat(value.toFixed(4)) : 0}%`;
}
