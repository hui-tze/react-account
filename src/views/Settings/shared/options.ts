import {useMemo} from "react";
import {useGetAllAccount} from "@/apis/requests/account-api";
import {SelectOption} from "@/components/FormField/FormFields";

/** All GL accounts as select options ("1000 - Cash"), sorted by code. */
export function useAccountOptions(): {options: SelectOption[], labelOf: (id?: number | null) => string, isLoading: boolean} {
    const {data, isLoading} = useGetAllAccount();

    return useMemo(() => {
        const accounts = [...(data ?? [])].sort((a, b) => a.account_code.localeCompare(b.account_code));
        const byId = new Map(accounts.map(a => [a.id, `${a.account_code} - ${a.account_name}`]));

        return {
            options: accounts.map(a => ({value: a.id, label: byId.get(a.id) ?? ""})),
            labelOf: (id?: number | null) => (id != null ? byId.get(id) : undefined) ?? "-",
            isLoading,
        };
    }, [data, isLoading]);
}
