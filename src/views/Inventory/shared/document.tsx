import {useMemo} from "react";
import {Alert, Form} from "react-bootstrap";
import {Control, Controller, FieldPath, FieldValues, Path, UseFormSetError} from "react-hook-form";
import Select, {StylesConfig} from "react-select";
import {useGetItemOptions} from "@/apis/requests/item-api";
import {useGetUomOptions} from "@/apis/requests/uom-api";
import {RequestError} from "@/lib/request-util/exception";
import {reactSelectCustomStyles} from "@/utils/ReactSelect";
import {useSmartTranslation} from "@/hooks/use-translation";

export type StockItem = {
    id: number,
    code: string,
    name: string,
    status: string,
    uom: string | null,
    // material + labour + overhead, falling back to the last purchase cost
    standardCost: number,
};

/** Items that hold stock (stock / manufactured), keyed by id, with unit and standard cost. */
export function useStockItems(): {items: StockItem[], byId: Map<number, StockItem>, isLoading: boolean} {
    const {data: items, isLoading} = useGetItemOptions();
    const {data: uoms} = useGetUomOptions();

    return useMemo(() => {
        const uomById = new Map((uoms ?? []).map(u => [u.id, u.abbreviation]));
        const list = (items ?? [])
            .filter(i => i.item_type === "stock" || i.item_type === "manufactured")
            .map(i => {
                const standard = Number(i.material_cost) + Number(i.labour_cost) + Number(i.overhead_cost);
                return {
                    id: i.id,
                    code: i.code,
                    name: i.name,
                    status: i.status,
                    uom: i.uom_id != null ? uomById.get(i.uom_id) ?? null : null,
                    standardCost: standard > 0 ? standard : Number(i.purchase_cost) || 0,
                };
            });

        return {items: list, byId: new Map(list.map(i => [i.id, i])), isLoading};
    }, [items, uoms, isLoading]);
}

type ItemOption = {value: number, label: string};

// the menu renders on <body> so the line table's scroll container doesn't clip it
const pickerStyles = {
    ...reactSelectCustomStyles,
    menuPortal: (base) => ({...base, zIndex: 1060}),
} as StylesConfig<ItemOption, false>;

type ItemPickerProps<T extends FieldValues> = {
    control: Control<T>,
    name: Path<T>,
    items: StockItem[],
    // items already on other lines — hidden from this picker
    excludeIds: number[],
    disabled?: boolean,
    onPicked?: (item: StockItem | undefined) => void,
    // translation key shown when the search finds nothing
    noOptionsKey?: string,
};

/** Searchable item picker for a document line ("code - name"). */
export function ItemPicker<T extends FieldValues>({control, name, items, excludeIds, disabled, onPicked, noOptionsKey = 'noStockItems'}: ItemPickerProps<T>) {
    const {t} = useSmartTranslation();

    return (
        <Controller
            control={control}
            name={name}
            rules={{required: '*' + t('required')}}
            render={({field, fieldState}) => {
                const options = items
                    .filter(i => i.id === field.value || (i.status === "active" && !excludeIds.includes(i.id)))
                    .map(i => ({value: i.id, label: `${i.code} - ${i.name}`}));

                return (
                    <>
                        <Select<ItemOption, false>
                            inputId={field.name}
                            options={options}
                            value={options.find(o => o.value === field.value) ?? null}
                            onChange={(option) => {
                                field.onChange(option?.value ?? null);
                                onPicked?.(items.find(i => i.id === option?.value));
                            }}
                            onBlur={field.onBlur}
                            isDisabled={disabled}
                            placeholder={t('searchItem')}
                            noOptionsMessage={() => t(noOptionsKey)}
                            menuPortalTarget={document.body}
                            menuPlacement="auto"
                            styles={pickerStyles}
                            classNamePrefix="select"
                        />
                        {fieldState.error && <div className="invalid-feedback d-block">{fieldState.error.message}</div>}
                    </>
                );
            }}
        />
    );
}

type LineNumberInputProps<T extends FieldValues> = {
    control: Control<T>,
    name: Path<T>,
    disabled?: boolean,
    step?: string,
    min?: number,
    // runs on a filled-in value (empty is already rejected as required)
    validate?: (value: number) => true | string,
};

/** Compact right-aligned number input for a line cell; stores a number (empty = null). */
export function LineNumberInput<T extends FieldValues>({control, name, disabled, step = "0.0001", min, validate}: LineNumberInputProps<T>) {
    const {t} = useSmartTranslation();

    return (
        <Controller
            control={control}
            name={name}
            rules={{
                validate: (value) => {
                    if (value === null || value === undefined || value === "") {
                        return '*' + t('required');
                    }
                    return validate ? validate(Number(value)) : true;
                },
            }}
            render={({field, fieldState}) => (
                <>
                    <Form.Control
                        size="sm"
                        type="number"
                        className="text-end"
                        step={step}
                        min={min}
                        name={field.name}
                        ref={field.ref}
                        value={field.value ?? ""}
                        onBlur={field.onBlur}
                        onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                        isInvalid={!!fieldState.error}
                        disabled={disabled}
                    />
                    <Form.Control.Feedback type="invalid">{fieldState.error?.message}</Form.Control.Feedback>
                </>
            )}
        />
    );
}

/**
 * Puts Laravel 422 field errors (e.g. "lines.2.quantity") on the matching form fields,
 * so a stock shortage shows on the line that caused it. Errors for unknown fields stay in the toast.
 */
export function applyServerErrors<T extends FieldValues>(error: unknown, setError: UseFormSetError<T>, fields: string[]) {
    if (!(error instanceof RequestError)) {
        return;
    }
    const errors = (error.requestException as unknown as {errors?: Record<string, string[]>}).errors ?? {};

    Object.entries(errors).forEach(([key, messages]) => {
        const known = fields.some(f => key === f || key.startsWith(`${f}.`));
        if (known && messages?.length) {
            setError(key as FieldPath<T>, {type: "server", message: messages[0]});
        }
    });
}

export function VoidedAlert() {
    const {t} = useSmartTranslation();

    return <Alert variant="danger">{t('documentVoided')}</Alert>;
}

/** Signed quantity with + for gains, red when negative. */
export function SignedQuantity({value, places = 2}: {value: number, places?: number}) {
    const formatted = value.toLocaleString(undefined, {minimumFractionDigits: places, maximumFractionDigits: places});

    return <span className={value < 0 ? "text-danger" : ""}>{value > 0 ? "+" : ""}{formatted}</span>;
}

export function today(): string {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
