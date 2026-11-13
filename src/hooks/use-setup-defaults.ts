import {useEffect, useRef} from "react";
import type {FieldValues, Path, PathValue, UseFormGetValues, UseFormSetValue} from "react-hook-form";
import type {SystemSetupSettings} from "@/apis/models/system-setting";
import {useGetSystemSettings} from "@/apis/requests/system-setting-api";

/**
 * Fills blank form fields with the company's defaults from Settings → System Setup (e.g. a new
 * customer's receivable account), once, when the settings arrive. Fields that already hold a value
 * are left alone, so editing a record never overwrites what was saved; a record saved before the
 * field was required gets the default filled in for the user to confirm.
 *
 * @param fields form field → System Setup key, e.g. {receivable_account_id: "default_receivable_account_id"}
 */
export function useSetupDefaults<T extends FieldValues>(
    getValues: UseFormGetValues<T>,
    setValue: UseFormSetValue<T>,
    fields: Partial<Record<Path<T>, keyof SystemSetupSettings>>,
) {
    const {data: setup} = useGetSystemSettings("system_setup", {revalidateOnFocus: false});
    const applied = useRef(false);

    useEffect(() => {
        if (!setup || applied.current) {
            return;
        }
        applied.current = true;
        for (const [field, key] of Object.entries(fields) as [Path<T>, keyof SystemSetupSettings][]) {
            const value = setup[key];
            const current = getValues(field);
            if (value && (current === null || current === undefined || current === "")) {
                setValue(field, value as PathValue<T, Path<T>>, {shouldValidate: false});
            }
        }
        // the field map is static per form
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setup]);
}
