import {Form} from "react-bootstrap";
import {Control, Controller, FieldValues, Path} from "react-hook-form";
import Select, {StylesConfig} from "react-select";
import {Customer} from "@/apis/models/customer";
import {reactSelectCustomStyles} from "@/utils/ReactSelect";
import {useSmartTranslation} from "@/hooks/use-translation";

type CustomerOption = {value: number, label: string, customer: Customer};

type CustomerPickerProps<T extends FieldValues> = {
    control: Control<T>,
    name: Path<T>,
    customers: Customer[],
    label: string,
    disabled?: boolean,
    // runs only on a user's pick, never on load — the place to apply the customer's defaults
    onPicked?: (customer: Customer | undefined) => void,
};

/** Searchable customer select (name, short name); inactive customers only when already chosen. */
export function CustomerPicker<T extends FieldValues>({control, name, customers, label, disabled, onPicked}: CustomerPickerProps<T>) {
    const {t} = useSmartTranslation();

    return (
        <Controller
            control={control}
            name={name}
            rules={{required: '*' + t('required')}}
            render={({field, fieldState}) => {
                const options: CustomerOption[] = customers
                    .filter(c => c.status === "active" || c.id === field.value)
                    .map(c => ({value: c.id, label: c.short_name ? `${c.name} (${c.short_name})` : c.name, customer: c}));

                return (
                    <Form.Group className="mb-3">
                        <Form.Label htmlFor={field.name} className="require-label">{label}</Form.Label>
                        <Select<CustomerOption, false>
                            inputId={field.name}
                            options={options}
                            value={options.find(o => o.value === field.value) ?? null}
                            onChange={(option) => {
                                field.onChange(option?.value ?? null);
                                onPicked?.(option?.customer);
                            }}
                            onBlur={field.onBlur}
                            isDisabled={disabled}
                            placeholder={t('searchCustomers')}
                            noOptionsMessage={() => t('noCustomers')}
                            styles={reactSelectCustomStyles as StylesConfig<CustomerOption, false>}
                            classNamePrefix="select"
                        />
                        {fieldState.error && <div className="invalid-feedback d-block">{fieldState.error.message}</div>}
                    </Form.Group>
                );
            }}
        />
    );
}
