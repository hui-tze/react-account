import {ReactNode} from "react";
import {Form} from "react-bootstrap";
import {Control, Controller, FieldValues, Path, RegisterOptions} from "react-hook-form";
import Select, {StylesConfig} from "react-select";
import {useSmartTranslation} from "@/hooks/use-translation";
import {reactSelectCustomStyles} from "@/utils/ReactSelect";

export type SelectOption = {
    value: string | number,
    label: string,
};

type BaseFieldProps<T extends FieldValues> = {
    control: Control<T>,
    name: Path<T>,
    label: string,
    required?: boolean,
    hint?: ReactNode,
    disabled?: boolean,
    rules?: Omit<RegisterOptions<T, Path<T>>, "required" | "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled">,
};

function useRequiredRule(required?: boolean) {
    const {t} = useSmartTranslation();
    return required ? '*' + t('required') : undefined;
}

export type TextFieldProps<T extends FieldValues> = BaseFieldProps<T> & {
    type?: "text" | "number" | "date" | "email",
    numeric?: boolean,
    maxLength?: number,
    min?: number,
    max?: number,
    step?: number | string,
    placeholder?: string,
    className?: string,
};

/**
 * Text/number/date input bound through Controller. `numeric` stores the value as a number
 * (empty input becomes null) so the payload matches the backend's integer/numeric rules.
 */
export function TextField<T extends FieldValues>({control, name, label, required, hint, disabled, rules, type = "text", numeric, maxLength, min, max, step, placeholder, className}: TextFieldProps<T>) {
    const requiredRule = useRequiredRule(required);

    return (
        <Controller
            control={control}
            name={name}
            rules={{...rules, required: requiredRule}}
            render={({field, fieldState}) => (
                <Form.Group className="mb-3">
                    <Form.Label className={required ? "require-label" : ""}>{label}</Form.Label>
                    <Form.Control
                        type={type}
                        name={field.name}
                        ref={field.ref}
                        value={field.value ?? ""}
                        onBlur={field.onBlur}
                        onChange={(e) => {
                            const raw = e.target.value;
                            field.onChange(numeric ? (raw === "" ? null : Number(raw)) : raw);
                        }}
                        isInvalid={!!fieldState.error}
                        disabled={disabled}
                        maxLength={maxLength}
                        min={min}
                        max={max}
                        step={step}
                        placeholder={placeholder}
                        className={className}
                    />
                    <Form.Control.Feedback type="invalid">{fieldState.error?.message}</Form.Control.Feedback>
                    {hint && <Form.Text className="text-muted">{hint}</Form.Text>}
                </Form.Group>
            )}
        />
    );
}

export type TextAreaFieldProps<T extends FieldValues> = BaseFieldProps<T> & {
    rows?: number,
    placeholder?: string,
};

export function TextAreaField<T extends FieldValues>({control, name, label, required, hint, disabled, rules, rows = 3, placeholder}: TextAreaFieldProps<T>) {
    const requiredRule = useRequiredRule(required);

    return (
        <Controller
            control={control}
            name={name}
            rules={{...rules, required: requiredRule}}
            render={({field, fieldState}) => (
                <Form.Group className="mb-3">
                    <Form.Label className={required ? "require-label" : ""}>{label}</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={rows}
                        name={field.name}
                        ref={field.ref}
                        value={field.value ?? ""}
                        onBlur={field.onBlur}
                        onChange={(e) => field.onChange(e.target.value)}
                        isInvalid={!!fieldState.error}
                        disabled={disabled}
                        placeholder={placeholder}
                    />
                    <Form.Control.Feedback type="invalid">{fieldState.error?.message}</Form.Control.Feedback>
                    {hint && <Form.Text className="text-muted">{hint}</Form.Text>}
                </Form.Group>
            )}
        />
    );
}

export type SelectFieldProps<T extends FieldValues> = BaseFieldProps<T> & {
    options: SelectOption[],
    numeric?: boolean,
    placeholder?: string,
};

// react-select styles for a form field: the shared look, plus the invalid border and disabled background
function selectStyles(invalid: boolean): StylesConfig<SelectOption, false> {
    const base = reactSelectCustomStyles as unknown as StylesConfig<SelectOption, false>;
    return {
        ...base,
        control: (provided, state) => ({
            ...(base.control ? base.control(provided, state) : provided),
            ...(invalid ? {borderColor: "var(--bs-form-invalid-border-color, #dc3545)"} : {}),
            ...(state.isDisabled ? {backgroundColor: "var(--bs-secondary-bg, #e9ecef)"} : {}),
        }),
    };
}

/**
 * Searchable select (react-select, like SelectController) bound through Controller. Being
 * controlled, it shows the saved value even when the options arrive after the form has
 * mounted (e.g. accounts fetched via SWR). A `placeholder` (even "") makes the field
 * clearable back to null, as the empty option of a native select did.
 */
export function SelectField<T extends FieldValues>({control, name, label, required, hint, disabled, rules, options, numeric, placeholder}: SelectFieldProps<T>) {
    const {t} = useSmartTranslation();
    const requiredRule = useRequiredRule(required);
    const clearable = placeholder !== undefined;

    return (
        <Controller
            control={control}
            name={name}
            rules={{...rules, required: requiredRule}}
            render={({field, fieldState}) => {
                const selected = field.value == null || field.value === ""
                    ? null
                    : options.find(o => String(o.value) === String(field.value)) ?? null;

                return (
                    <Form.Group className="mb-3">
                        <Form.Label htmlFor={`select-${field.name}`} className={required ? "require-label" : ""}>{label}</Form.Label>
                        <Select<SelectOption, false>
                            inputId={`select-${field.name}`}
                            name={field.name}
                            ref={field.ref}
                            options={options}
                            value={selected}
                            onBlur={field.onBlur}
                            onChange={(option) => {
                                const raw = option?.value;
                                field.onChange(raw == null || raw === "" ? null : (numeric ? Number(raw) : raw));
                            }}
                            isDisabled={disabled}
                            isClearable={clearable}
                            placeholder={placeholder || t('pleaseSelect')}
                            noOptionsMessage={() => t('noOptions')}
                            classNamePrefix="select"
                            className={fieldState.error ? "is-invalid" : undefined}
                            styles={selectStyles(!!fieldState.error)}
                            menuPlacement="auto"
                            // render the menu above cards, tables and scroll areas that would clip it
                            menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                            aria-invalid={!!fieldState.error}
                        />
                        {fieldState.error?.message && <div className="invalid-feedback d-block">{fieldState.error.message}</div>}
                        {hint && <Form.Text className="text-muted">{hint}</Form.Text>}
                    </Form.Group>
                );
            }}
        />
    );
}

export type SwitchFieldProps<T extends FieldValues> = Omit<BaseFieldProps<T>, "required" | "rules"> & {
    groupLabel?: string,
};

export function SwitchField<T extends FieldValues>({control, name, label, hint, disabled, groupLabel}: SwitchFieldProps<T>) {
    return (
        <Controller
            control={control}
            name={name}
            render={({field}) => (
                <Form.Group className="mb-3">
                    {groupLabel && <Form.Label>{groupLabel}</Form.Label>}
                    <Form.Check
                        type="switch"
                        id={`switch-${String(name)}`}
                        label={label}
                        name={field.name}
                        ref={field.ref}
                        checked={Boolean(field.value)}
                        onBlur={field.onBlur}
                        onChange={(e) => field.onChange(e.target.checked)}
                        disabled={disabled}
                    />
                    {hint && <Form.Text className="text-muted">{hint}</Form.Text>}
                </Form.Group>
            )}
        />
    );
}

export function StatusField<T extends FieldValues>({control, name, label}: Pick<BaseFieldProps<T>, "control" | "name"> & {label?: string}) {
    const {t} = useSmartTranslation();

    return (
        <SelectField
            control={control}
            name={name}
            label={label ?? t('status')}
            options={[
                {value: "active", label: t('active')},
                {value: "inactive", label: t('inactive')},
            ]}
        />
    );
}
