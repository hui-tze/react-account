import {ReactNode} from "react";
import {Col, Form, Row} from "react-bootstrap";
import {Control, Controller, FieldValues, Path, UseFormGetValues, UseFormSetValue, useWatch} from "react-hook-form";
import Select, {StylesConfig} from "react-select";
import {Supplier} from "@/apis/models/supplier";
import {useGetSupplierOptions} from "@/apis/requests/supplier-api";
import {useGetPaymentTermOptions} from "@/apis/requests/payment-term-api";
import {useGetTaxGroupOptions} from "@/apis/requests/tax-group-api";
import {reactSelectCustomStyles} from "@/utils/ReactSelect";
import {useSmartTranslation} from "@/hooks/use-translation";
import type {EntryCheck} from "@/views/Sales/shared/EntryLayout";
import type {DimensionTag} from "@/apis/models/dimension";
import {applyDimensionDefaults} from "@/views/Dimensions/shared/DimensionFields";

type SupplierOption = {value: number, label: string, supplier: Supplier};

type SupplierPickerProps<T extends FieldValues> = {
    control: Control<T>,
    name: Path<T>,
    suppliers: Supplier[],
    label: string,
    disabled?: boolean,
    // runs only on a user's pick, never on load — the place to apply the supplier's defaults
    onPicked?: (supplier: Supplier | undefined) => void,
};

/** Searchable supplier select (name, short name, code); inactive suppliers only when already chosen. */
export function SupplierPicker<T extends FieldValues>({control, name, suppliers, label, disabled, onPicked}: SupplierPickerProps<T>) {
    const {t} = useSmartTranslation();

    return (
        <Controller
            control={control}
            name={name}
            rules={{required: '*' + t('required')}}
            render={({field, fieldState}) => {
                const options: SupplierOption[] = suppliers
                    .filter(s => s.status === "active" || s.id === field.value)
                    .map(s => ({value: s.id, label: [s.code, s.name].filter(Boolean).join(" · ") + (s.short_name ? ` (${s.short_name})` : ""), supplier: s}));

                return (
                    <Form.Group className="mb-3">
                        <Form.Label htmlFor={field.name} className="require-label">{label}</Form.Label>
                        <Select<SupplierOption, false>
                            inputId={field.name}
                            options={options}
                            value={options.find(o => o.value === field.value) ?? null}
                            onChange={(option) => {
                                field.onChange(option?.value ?? null);
                                onPicked?.(option?.supplier);
                            }}
                            onBlur={field.onBlur}
                            isDisabled={disabled}
                            placeholder={t('searchSuppliers')}
                            noOptionsMessage={() => t('noSuppliers')}
                            styles={reactSelectCustomStyles as StylesConfig<SupplierOption, false>}
                            classNamePrefix="select"
                        />
                        {fieldState.error && <div className="invalid-feedback d-block">{fieldState.error.message}</div>}
                    </Form.Group>
                );
            }}
        />
    );
}

// any supplier document form: supplier + whether prices include tax
// forms with `dimensions` get the supplier's default values on a pick
type SupplierForm = {supplier_id: number | null, tax_included: boolean | null, dimensions?: DimensionTag[] | null};

type SupplierSectionProps<T extends SupplierForm> = {
    control: Control<T>,
    setValue: UseFormSetValue<T>,
    // reads the form's dimensions when applying the supplier's defaults (forms without them can leave it out)
    getValues?: UseFormGetValues<T>,
    // the supplier can't change once the document is saved
    lockSupplier?: boolean,
    // show the "prices include tax" switch
    showTaxIncluded?: boolean,
    readOnly?: boolean,
    // called after a user picks a supplier (after its defaults are applied)
    onPicked?: (supplier: Supplier | undefined) => void,
    // fields beside the supplier (e.g. the supplier's invoice no)
    children?: ReactNode,
};

/** Supplier pick with what the supplier brings (TIN, currency, terms, taxes); `children` are further columns beside it. */
export function SupplierSection<T extends SupplierForm>(props: SupplierSectionProps<T>) {
    // react-hook-form can't resolve paths on an open generic, so work on the slice type
    const {control, setValue, getValues, lockSupplier, showTaxIncluded = true, readOnly, onPicked, children} = props as unknown as SupplierSectionProps<SupplierForm>;
    const {t} = useSmartTranslation();
    const {data: suppliers} = useGetSupplierOptions();
    const {data: terms} = useGetPaymentTermOptions();
    const {data: taxGroups} = useGetTaxGroupOptions();

    return (
        <Controller
            control={control}
            name="supplier_id"
            render={({field}) => {
                const supplier = suppliers?.find(s => s.id === field.value);
                return (
                    <Row className="gx-4">
                        <Col xs={12}>
                            <SupplierPicker control={control} name="supplier_id" suppliers={suppliers ?? []} label={t('supplier')} disabled={readOnly || lockSupplier}
                                onPicked={(picked) => {
                                    setValue("tax_included", picked ? !!picked.tax_included : null);
                                    if (getValues) {
                                        void applyDimensionDefaults(getValues, setValue, [["supplier", picked?.id]]);
                                    }
                                    onPicked?.(picked);
                                }} />
                            {supplier ? (
                                <div className="doc-field-note">
                                    {supplier.tin && <span>{t('tin')} {supplier.tin}</span>}
                                    <span>{supplier.currency?.code ?? "MYR"}</span>
                                    <span>{terms?.find(p => p.id === supplier.payment_terms_id)?.name ?? "-"}</span>
                                    <span>{taxGroups?.find(g => g.id === supplier.tax_group_id)?.name ?? t('noTax')}</span>
                                </div>
                            ) : (
                                <div className="doc-field-note">{t('pickSupplierFirst')}</div>
                            )}
                        </Col>
                        {children}
                        {showTaxIncluded && supplier && (
                            <Col xs={12}>
                                <Controller
                                    control={control}
                                    name="tax_included"
                                    render={({field: f}) => (
                                        <Form.Check type="switch" id="tax-included" className="mb-3" label={t('supplierPricesIncludeTax')}
                                            checked={!!f.value} disabled={readOnly} onChange={(e) => f.onChange(e.target.checked)} />
                                    )}
                                />
                            </Col>
                        )}
                    </Row>
                );
            }}
        />
    );
}

/** Supplier check for the strip on top of a purchase document entry. */
export function useSupplierChecks<T extends SupplierForm>(control: Control<T>): {issues: EntryCheck[], ready: string[]} {
    const {t} = useSmartTranslation();
    const supplierId = useWatch({control: control as unknown as Control<SupplierForm>, name: "supplier_id"});
    return supplierId
        ? {issues: [], ready: [t('checkSupplierSet')]}
        : {issues: [{text: t('checkPickSupplier'), tone: "info"}], ready: []};
}
