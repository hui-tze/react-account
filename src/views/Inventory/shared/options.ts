import {useMemo} from "react";
import {useGetItemOptions} from "@/apis/requests/item-api";
import {SelectOption} from "@/components/FormField/FormFields";

/** Items as select options ("A100 - Widget"); inactive items are kept only when already selected. */
export function useItemOptions(selectedId?: number | null): SelectOption[] {
    const {data} = useGetItemOptions();

    return useMemo(() => (data ?? [])
        .filter(i => i.status === "active" || i.id === selectedId)
        .map(i => ({value: i.id, label: `${i.code} - ${i.name}`})), [data, selectedId]);
}

/** "A100 - Widget" for an eager-loaded item, "-" when missing. */
export function itemLabel(item?: {code: string, name: string}): string {
    return item ? `${item.code} - ${item.name}` : "-";
}

/** Laravel date casts serialize as "2026-10-13T00:00:00.000000Z"; keep the date part. */
export function dateOnly(value: string | null | undefined): string | null {
    return value ? value.slice(0, 10) : null;
}

/** Decimal strings from the backend shown with fixed places, e.g. "12.5000" -> "12.50". */
export function formatDecimal(value: string | number | null | undefined, places = 2): string {
    const n = Number(value ?? 0);
    return Number.isFinite(n) ? n.toLocaleString(undefined, {minimumFractionDigits: places, maximumFractionDigits: places}) : "-";
}
