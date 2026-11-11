import {useMemo} from "react";
import {useGetItemOptions} from "@/apis/requests/item-api";
import {SelectOption} from "@/components/FormField/FormFields";
import {formatAmount} from "@/utils/display-format";

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

/**
 * Decimal strings from the backend in the Display Preference format, e.g. "12.5000" -> "12.50":
 * price decimal places and the company's separators, unless `places` is given.
 */
export function formatDecimal(value: string | number | null | undefined, places?: number): string {
    return formatAmount(value, places);
}
