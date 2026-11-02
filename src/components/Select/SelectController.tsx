import {useSmartTranslation} from "@/hooks/use-translation";
import {reactSelectCustomStyles} from "@/utils/ReactSelect";
import {reactSelectMultipleCustomStyles} from "@/utils/ReactSelectMultiple";
import {Controller} from "react-hook-form";
import Select from "react-select";

type SelectControllerProps<T> = {
    name: string;
    control: any;
    options: T[];
    getOptionLabel?: (option: T) => string;
    getOptionValue?: (option: T) => string | number;
    getSelectedOption?: (option: T, value: any) => boolean;
    rules?: any;
    required?: boolean|string;
    error?: string;
    isDisabled?: boolean;
    placeholder?: string;
    isClearable?: boolean;
    menuPlacement?: "auto" | "top" | "bottom";
    styles?: any;
    isMulti?: boolean;
    defaultValue?: T | T[] | string | number | (string | number)[];
    hint?: string;
    onChangeExtra?: (
        values: (string | number)[] | string | number | null
    ) => void;
    transformValue?: (value: any) => any;
};

export function SelectController<T>({
    name,
    control,
    options,
    getOptionLabel = (opt: any) => opt.label,
    getOptionValue = (opt: any) => opt.value,
    getSelectedOption,
    rules,
    required,
    error,
    isDisabled = false,
    placeholder,
    isClearable = true,
    menuPlacement = "auto",
    styles,
    isMulti = false,
    defaultValue,
    hint,
    onChangeExtra,
    transformValue,
}: SelectControllerProps<T>) {
    const {t} = useSmartTranslation();

    const resolvedPlaceholder = placeholder ?? t('select_placeholder') + '...';
    
    return (
        <div>
            <Controller
                name={name}
                control={control}
                defaultValue={defaultValue}
                rules={{
                    ...(required
                        ? {required: typeof required === "string" ? required : "*" + t("required"),}
                        : {}),
                    ...rules,
                }}
                render={({ field }) => {
                    const fieldValue = field.value;

                    // MULTI SELECT
                    const selectedMultiOptions = Array.isArray(fieldValue)
                        ? options.filter((opt) =>
                            fieldValue.some(
                                (value) => String(value) === String(getOptionValue(opt))
                            )
                        )
                        : [];

                    // SINGLE SELECT
                    const selectedSingleOption =
                        options.find((opt) =>
                            getSelectedOption
                                ? getSelectedOption(opt, fieldValue)
                                : getOptionValue(opt) === fieldValue
                        ) ?? null;

                    return (
                        <Select
                            isMulti={isMulti}
                            options={options}
                            value={isMulti ? selectedMultiOptions : selectedSingleOption}
                            isDisabled={isDisabled}
                            isClearable={isClearable}
                            placeholder={resolvedPlaceholder}
                            menuPlacement={menuPlacement}
                            styles={
                                styles ??
                                (isMulti ? reactSelectMultipleCustomStyles : reactSelectCustomStyles)
                            }
                            classNamePrefix="select"
                            className={error ? "is-invalid" : ""}
                            getOptionLabel={getOptionLabel}
                            getOptionValue={getOptionValue as any}
                            onChange={(selected) => {
                                if (isMulti) {
                                    const values = selected ? (selected as T[]).map(getOptionValue) : [];
                                    const transformed = transformValue ? transformValue(values) : values;

                                    field.onChange(transformed);
                                    onChangeExtra?.(transformed);
                                } else {
                                    const value = selected != null ? getOptionValue(selected as T) : null;
                                    const transformed = transformValue ? transformValue(value) : value;

                                    field.onChange(transformed);
                                    onChangeExtra?.(transformed);
                                }
                            }}
                        />
                    );
                }}
            />

            {hint && (
                <div className="form-text text-muted fs-7">
                    {hint}
                </div>
            )}

            {error && (
                <span className="invalid-field">{error}</span>
            )}
        </div>
    );
}