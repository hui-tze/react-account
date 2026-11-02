import {useMemo} from "react";
import {Button, Col, Form, Row, Table} from "react-bootstrap";
import {Plus, Trash2} from "react-feather";
import {Controller, useFieldArray} from "react-hook-form";
import {useRequestForm} from "@/hooks/use-request-handler";
import {TaxGroup} from "@/apis/models/tax-group";
import {TaxGroupItemRequest, TaxGroupRequest} from "@/apis/requests/tax-group-api";
import {useGetTaxTypeOptions} from "@/apis/requests/tax-type-api";
import {StatusField, TextField} from "@/components/FormField/FormFields";
import SettingsFormPage, {FormSectionTitle} from "@/views/Settings/shared/SettingsFormPage";
import {RecordFormProps} from "@/views/Settings/shared/SettingsEditPage";
import {useSmartTranslation} from "@/hooks/use-translation";
import {formatRate} from "../format";
import {TAX_GROUPS_PATH} from "./index";

function toFormRows(record?: TaxGroup): TaxGroupItemRequest[] {
    return [...(record?.tax_types ?? [])]
        .sort((a, b) => (a.pivot?.sequence ?? 0) - (b.pivot?.sequence ?? 0))
        .map(tt => ({
            tax_type_id: tt.id,
            apply_to_shipping: Boolean(tt.pivot?.apply_to_shipping),
            sequence: tt.pivot?.sequence ?? 0,
            is_compound: Boolean(tt.pivot?.is_compound),
        }));
}

export function TaxGroupForm({record, onSubmit, onSuccess, onDelete}: RecordFormProps<TaxGroup, TaxGroupRequest>) {
    const {t} = useSmartTranslation();
    const {data: taxTypes, isLoading: taxTypesLoading} = useGetTaxTypeOptions();

    const {control, getValues, submitting, handleSubmitRequest} = useRequestForm<TaxGroupRequest>({
        formOptions: {
            defaultValues: {
                name: record?.name ?? "",
                status: record?.status ?? "active",
                tax_types: toFormRows(record),
            },
        },
    });

    const {fields, append, remove} = useFieldArray({control, name: "tax_types"});

    // inactive tax types stay selectable only if already in this group
    const taxTypeOptions = useMemo(() => {
        const assigned = new Set(toFormRows(record).map(r => r.tax_type_id));
        return (taxTypes ?? [])
            .filter(tt => tt.status === "active" || assigned.has(tt.id))
            .map(tt => ({
                value: tt.id,
                label: `${tt.code} - ${tt.name} (${formatRate(tt.rate)})${tt.status !== "active" ? ` [${t('inactive')}]` : ""}`,
            }));
    }, [taxTypes, record, t]);

    const addRow = () => {
        const rows = getValues("tax_types") ?? [];
        const nextSequence = rows.reduce((max, r) => Math.max(max, Number(r.sequence ?? 0)), 0) + 1;
        append({tax_type_id: null, apply_to_shipping: false, sequence: nextSequence, is_compound: false});
    };

    const submit = (formData: TaxGroupRequest) => onSubmit({
        ...formData,
        tax_types: (formData.tax_types ?? []).map(r => ({
            tax_type_id: r.tax_type_id,
            apply_to_shipping: !!r.apply_to_shipping,
            sequence: r.sequence ?? 0,
            is_compound: !!r.is_compound,
        })),
    });

    return (
        <SettingsFormPage
            onSubmit={handleSubmitRequest({request: submit, onSuccess})}
            submitting={submitting}
            isEditing={!!record}
            backTo={TAX_GROUPS_PATH}
            onDelete={onDelete}
        >
            <Row className="gx-3">
                <Col md={8}>
                    <TextField control={control} name="name" label={t('name')} required maxLength={100} />
                </Col>
                <Col md={4}>
                    <StatusField control={control} name="status" />
                </Col>
            </Row>

            <FormSectionTitle title={t('taxes')} hint={t('taxGroupTaxesHint')} />
            <div className="table-responsive mb-2">
                <Table size="sm" className="align-middle mb-0">
                    <thead>
                        <tr>
                            <th style={{minWidth: 240}} className="require-label">{t('taxType')}</th>
                            <th style={{width: 120}}>{t('sequence')}</th>
                            <th style={{width: 150}} className="text-center">{t('applyToShipping')}</th>
                            <th style={{width: 130}} className="text-center">{t('compound')}</th>
                            <th style={{width: 50}} />
                        </tr>
                    </thead>
                    <tbody>
                        {fields.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-muted text-center py-3">{t('noTaxesInGroup')}</td>
                            </tr>
                        )}
                        {fields.map((field, index) => (
                            <tr key={field.id}>
                                <td>
                                    <Controller
                                        control={control}
                                        name={`tax_types.${index}.tax_type_id`}
                                        rules={{
                                            required: '*' + t('required'),
                                            validate: (value) => {
                                                const duplicates = (getValues("tax_types") ?? []).filter(r => r.tax_type_id === value).length;
                                                return value == null || duplicates <= 1 || t('duplicateTaxType');
                                            },
                                        }}
                                        render={({field: f, fieldState}) => (
                                            <>
                                                <Form.Select
                                                    size="sm"
                                                    name={f.name}
                                                    ref={f.ref}
                                                    value={f.value == null ? "" : String(f.value)}
                                                    onBlur={f.onBlur}
                                                    onChange={(e) => f.onChange(e.target.value === "" ? null : Number(e.target.value))}
                                                    isInvalid={!!fieldState.error}
                                                    disabled={taxTypesLoading}
                                                >
                                                    <option value="">{t('pleaseSelect')}</option>
                                                    {taxTypeOptions.map(o => (
                                                        <option key={o.value} value={String(o.value)}>{o.label}</option>
                                                    ))}
                                                </Form.Select>
                                                <Form.Control.Feedback type="invalid">{fieldState.error?.message}</Form.Control.Feedback>
                                            </>
                                        )}
                                    />
                                </td>
                                <td>
                                    <Controller
                                        control={control}
                                        name={`tax_types.${index}.sequence`}
                                        render={({field: f}) => (
                                            <Form.Control
                                                size="sm"
                                                type="number"
                                                step={1}
                                                name={f.name}
                                                ref={f.ref}
                                                value={f.value ?? ""}
                                                onBlur={f.onBlur}
                                                onChange={(e) => f.onChange(e.target.value === "" ? null : Math.trunc(Number(e.target.value)))}
                                            />
                                        )}
                                    />
                                </td>
                                <td className="text-center">
                                    <Controller
                                        control={control}
                                        name={`tax_types.${index}.apply_to_shipping`}
                                        render={({field: f}) => (
                                            <Form.Check
                                                type="switch"
                                                className="d-inline-block"
                                                id={`tax-row-${field.id}-shipping`}
                                                aria-label={t('applyToShipping')}
                                                name={f.name}
                                                ref={f.ref}
                                                checked={Boolean(f.value)}
                                                onBlur={f.onBlur}
                                                onChange={(e) => f.onChange(e.target.checked)}
                                            />
                                        )}
                                    />
                                </td>
                                <td className="text-center">
                                    <Controller
                                        control={control}
                                        name={`tax_types.${index}.is_compound`}
                                        render={({field: f}) => (
                                            <Form.Check
                                                type="switch"
                                                className="d-inline-block"
                                                id={`tax-row-${field.id}-compound`}
                                                aria-label={t('compound')}
                                                name={f.name}
                                                ref={f.ref}
                                                checked={Boolean(f.value)}
                                                onBlur={f.onBlur}
                                                onChange={(e) => f.onChange(e.target.checked)}
                                            />
                                        )}
                                    />
                                </td>
                                <td className="text-end">
                                    <Button
                                        variant="flush-danger"
                                        size="sm"
                                        className="btn-icon btn-rounded"
                                        title={t('remove')}
                                        onClick={() => remove(index)}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
            <Button variant="outline-primary" size="sm" type="button" onClick={addRow}>
                <Plus size={16} className="me-1" /> {t('addTax')}
            </Button>
        </SettingsFormPage>
    );
}
