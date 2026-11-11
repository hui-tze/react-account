import {useMemo} from "react";
import {Col, Form} from "react-bootstrap";
import Select, {StylesConfig} from "react-select";
import {Control, Controller, FieldValues, Path, UseFormGetValues, UseFormSetValue} from "react-hook-form";
import type {Dimension, DimensionAssignable, DimensionTag, DimensionValue} from "@/apis/models/dimension";
import {dimensionApi} from "@/apis/requests/dimension-api";
import {authApiRequest} from "@/lib/request-client/client";
import {reactSelectCustomStyles} from "@/utils/ReactSelect";
import {useSmartTranslation} from "@/hooks/use-translation";

/*
 * Dimensions on document forms. A form keeps them as `dimensions: DimensionTag[]` (one entry per
 * dimension with a value); journal / bank lines keep their own `lines.N.dimensions`. The backend
 * checks values and required dimensions again; posting tags every ledger row with them.
 */

type ValueOption = {value: number, label: string, code: string, depth: number, isDisabled: boolean};

/** Values in tree order with their depth (parents before children). */
export function valueTree(values: DimensionValue[]): {value: DimensionValue, depth: number}[] {
    const byParent = new Map<number, DimensionValue[]>();
    const ids = new Set(values.map(v => v.id));
    values.forEach(v => {
        const parent = v.parent_id && ids.has(v.parent_id) ? v.parent_id : 0;
        byParent.set(parent, [...(byParent.get(parent) ?? []), v]);
    });
    const out: {value: DimensionValue, depth: number}[] = [];
    const walk = (parent: number, depth: number) => (byParent.get(parent) ?? []).forEach(v => {
        out.push({value: v, depth});
        walk(v.id, depth + 1);
    });
    walk(0, 0);
    return out;
}

/** The company's active dimensions with their values. */
export function useActiveDimensions() {
    const {data, isLoading} = dimensionApi.useDimensions();
    const dimensions = useMemo(() => (data ?? []).filter(d => d.status === "active"), [data]);
    return {dimensions, isLoading};
}

/** Picker options of a dimension: postable values, with groups shown (disabled) as headings. */
function optionsOf(dimension: Dimension, selected: number | null | undefined, anyValue = false): ValueOption[] {
    return valueTree((dimension.values ?? []).filter(v => v.status === "active" || v.id === selected))
        .map(({value, depth}) => ({
            value: value.id,
            label: `${value.code} · ${value.name}`,
            code: value.code,
            depth,
            isDisabled: !anyValue && !value.allow_transaction && value.id !== selected,
        }));
}

const valueOf = (tags: DimensionTag[] | null | undefined, dimensionId: number) =>
    tags?.find(t => t.dimension_id === dimensionId)?.dimension_value_id ?? null;

/** Sets one dimension's value in a list (null clears it). */
export function withValue(tags: DimensionTag[] | null | undefined, dimensionId: number, valueId: number | null): DimensionTag[] {
    const rest = (tags ?? []).filter(t => t.dimension_id !== dimensionId);
    return valueId ? [...rest, {dimension_id: dimensionId, dimension_value_id: valueId}].sort((a, b) => a.dimension_id - b.dimension_id) : rest;
}

const selectStyles = reactSelectCustomStyles as StylesConfig<ValueOption, false>;

export function DimensionValueSelect({dimension, value, onChange, disabled, invalid, compact, inputId, anyValue}: {
    dimension: Dimension, value: number | null, onChange: (id: number | null) => void, disabled?: boolean, invalid?: boolean, compact?: boolean, inputId?: string,
    // groups and reporting-only values too (budgets)
    anyValue?: boolean,
}) {
    const {t} = useSmartTranslation();
    const options = optionsOf(dimension, value, anyValue);
    return (
        <Select<ValueOption, false>
            inputId={inputId}
            options={options}
            value={options.find(o => o.value === value) ?? null}
            onChange={(option) => onChange(option?.value ?? null)}
            isDisabled={disabled}
            isClearable
            placeholder={compact ? dimension.code : t('pleaseSelect')}
            noOptionsMessage={() => t('noDimensionValues')}
            formatOptionLabel={(option, {context}) => context === "menu"
                ? <span style={{paddingLeft: `${option.depth * 0.9}rem`}} className={option.isDisabled ? "fw-semibold" : undefined}>{option.label}</span>
                : compact ? option.code : option.label}
            styles={{
                ...selectStyles,
                control: (base, state) => ({
                    ...(selectStyles.control?.(base, state) ?? base),
                    ...(invalid ? {borderColor: "var(--bs-danger, #dc3545)"} : {}),
                    ...(compact ? {minHeight: 32, minWidth: 110} : {}),
                }),
                menuPortal: (base) => ({...base, zIndex: 1060}),
            }}
            // inside tables / cards: don't get clipped
            menuPortalTarget={document.body}
            classNamePrefix="select"
        />
    );
}

type DimensionFieldsProps<T extends FieldValues> = {
    control: Control<T>,
    // the form's DimensionTag[] field; defaults to "dimensions"
    name?: Path<T>,
    readOnly?: boolean,
    // documents that post to the ledger need their required dimensions (orders / quotations don't)
    enforceRequired?: boolean,
    // column width of each picker (Bootstrap sm)
    sm?: number,
};

/**
 * A picker per active dimension, as `<Col>`s for the details card's `<Row>`. Renders nothing
 * while the company has no dimensions.
 */
export function DimensionFields<T extends FieldValues>({control, name = "dimensions" as Path<T>, readOnly, enforceRequired = true, sm = 6}: DimensionFieldsProps<T>) {
    const {t} = useSmartTranslation();
    const {dimensions} = useActiveDimensions();
    if (dimensions.length === 0) {
        return null;
    }

    const required = enforceRequired ? dimensions.filter(d => d.is_required) : [];

    return (
        <Controller
            control={control}
            name={name}
            rules={{
                validate: (tags: DimensionTag[] | null) => {
                    const missing = required.filter(d => !valueOf(tags, d.id));
                    return missing.length === 0 || t('dimensionsRequired', {names: missing.map(d => d.name).join(", ")});
                },
            }}
            render={({field, fieldState}) => (
                <>
                    {dimensions.map(dimension => {
                        const isRequired = required.some(d => d.id === dimension.id);
                        const value = valueOf(field.value, dimension.id);
                        return (
                            <Col sm={sm} key={dimension.id}>
                                <Form.Group className="mb-3">
                                    <Form.Label htmlFor={`dimension-${dimension.id}`} className={isRequired ? "require-label" : ""}>{dimension.name}</Form.Label>
                                    <DimensionValueSelect inputId={`dimension-${dimension.id}`} dimension={dimension} value={value} disabled={readOnly}
                                        invalid={!!fieldState.error && isRequired && !value}
                                        onChange={(id) => field.onChange(withValue(field.value, dimension.id, id))} />
                                </Form.Group>
                            </Col>
                        );
                    })}
                    {fieldState.error && (
                        <Col xs={12}>
                            <div className="invalid-feedback d-block mt-n2 mb-3">{fieldState.error.message}</div>
                        </Col>
                    )}
                </>
            )}
        />
    );
}

/** Column headings for line-level dimensions (journal / bank lines): one per active dimension. */
export function DimensionHeaderCells({className}: {className?: string}) {
    const {dimensions} = useActiveDimensions();
    return <>{dimensions.map(d => <th key={d.id} className={className} style={{minWidth: 130}}>{d.name}</th>)}</>;
}

/** A line's dimension pickers, one `<td>` per active dimension (matches DimensionHeaderCells). */
export function DimensionLineCells<T extends FieldValues>({control, name, readOnly, skipCheck}: {
    control: Control<T>, name: Path<T>, readOnly?: boolean,
    // a line still being filled in (no account yet) isn't checked for required dimensions
    skipCheck?: boolean,
}) {
    const {t} = useSmartTranslation();
    const {dimensions} = useActiveDimensions();
    const required = skipCheck ? [] : dimensions.filter(d => d.is_required);

    return (
        <Controller
            control={control}
            name={name}
            rules={{
                validate: (tags: DimensionTag[] | null) => {
                    const missing = required.filter(d => !valueOf(tags, d.id));
                    return missing.length === 0 || t('dimensionsRequired', {names: missing.map(d => d.name).join(", ")});
                },
            }}
            render={({field, fieldState}) => (
                <>
                    {dimensions.map(dimension => {
                        const value = valueOf(field.value, dimension.id);
                        return (
                            <td key={dimension.id}>
                                <DimensionValueSelect dimension={dimension} value={value} disabled={readOnly} compact
                                    invalid={!!fieldState.error && dimension.is_required && !value}
                                    onChange={(id) => field.onChange(withValue(field.value, dimension.id, id))} />
                            </td>
                        );
                    })}
                </>
            )}
        />
    );
}

/** Read-only "Cost Centre: KCH · Project: P1" for a document's or line's values. */
export function DimensionTagsText({tags, empty = "-"}: {tags: DimensionTag[] | null | undefined, empty?: string}) {
    const {dimensions} = useActiveDimensions();
    const parts = (tags ?? []).map(tag => {
        const dimension = dimensions.find(d => d.id === tag.dimension_id);
        const value = dimension?.values?.find(v => v.id === tag.dimension_value_id);
        return dimension && value ? {key: dimension.id, dimension: dimension.name, value} : null;
    }).filter((p): p is NonNullable<typeof p> => p !== null);

    if (parts.length === 0) {
        return <>{empty}</>;
    }
    return (
        <>
            {parts.map((p, i) => (
                <span key={p.key} title={`${p.value.code} · ${p.value.name}`}>
                    {i > 0 && " · "}<span className="text-muted">{p.dimension}:</span> {p.value.code}
                </span>
            ))}
        </>
    );
}

/** Default values of a customer / branch / supplier / item / account (no caching; called on a user's pick). */
export function fetchDimensionDefaults(type: DimensionAssignable, id: number): Promise<DimensionTag[]> {
    return authApiRequest(`/dimension-default/${type}/${id}`).get();
}

/**
 * Applies defaults to a form's `dimensions` on a user's pick: later sources win over earlier
 * ones (customer, then branch), and only dimensions that have a default change. Does nothing
 * for a form without a `dimensions` field.
 */
export async function applyDimensionDefaults<T extends FieldValues>(
    getValues: UseFormGetValues<T>,
    setValue: UseFormSetValue<T>,
    sources: [DimensionAssignable, number | null | undefined][],
    name: Path<T> = "dimensions" as Path<T>,
): Promise<void> {
    if (getValues(name) === undefined) {
        return;
    }
    const lists = await Promise.all(sources.map(([type, id]) => id ? fetchDimensionDefaults(type, id).catch(() => []) : Promise.resolve([])));
    let tags = (getValues(name) ?? []) as DimensionTag[];
    lists.forEach(list => list.forEach((tag: DimensionTag) => {
        tags = withValue(tags, tag.dimension_id, tag.dimension_value_id);
    }));
    setValue(name, tags as never, {shouldDirty: true, shouldValidate: false});
}
