import {Col, Form, Row, Spinner} from "react-bootstrap";
import {Controller, useWatch} from "react-hook-form";
import {useRequestForm} from "@/hooks/use-request-handler";
import {ItemTaxCategory} from "@/apis/models/item-tax-category";
import {ItemTaxCategoryRequest} from "@/apis/requests/item-tax-category-api";
import {useGetTaxTypeOptions} from "@/apis/requests/tax-type-api";
import {StatusField, SwitchField, TextField} from "@/components/FormField/FormFields";
import SettingsFormPage, {FormSectionTitle} from "@/views/Settings/shared/SettingsFormPage";
import {RecordFormProps} from "@/views/Settings/shared/SettingsEditPage";
import {useSmartTranslation} from "@/hooks/use-translation";
import {formatRate} from "../format";
import {ITEM_TAX_TYPES_PATH} from "./index";

export function ItemTaxTypeForm({record, onSubmit, onSuccess, onDelete}: RecordFormProps<ItemTaxCategory, ItemTaxCategoryRequest>) {
    const {t} = useSmartTranslation();
    const {data: taxTypes, isLoading: taxTypesLoading} = useGetTaxTypeOptions();

    const initialExemptIds = (record?.exempt_tax_types ?? []).map(tt => tt.id);

    const {control, submitting, handleSubmitRequest} = useRequestForm<ItemTaxCategoryRequest>({
        formOptions: {
            defaultValues: {
                name: record?.name ?? "",
                tax_exempt: record?.tax_exempt ?? false,
                status: record?.status ?? "active",
                exempt_tax_type_ids: initialExemptIds,
            },
        },
    });

    const taxExempt = useWatch({control, name: "tax_exempt"});

    // inactive tax types are listed only when already ticked
    const visibleTaxTypes = (taxTypes ?? []).filter(tt => tt.status === "active" || initialExemptIds.includes(tt.id));

    // fully exempt items skip every tax, so the per-tax list is cleared
    const submit = (formData: ItemTaxCategoryRequest) => onSubmit({
        ...formData,
        exempt_tax_type_ids: formData.tax_exempt ? [] : (formData.exempt_tax_type_ids ?? []),
    });

    return (
        <SettingsFormPage
            onSubmit={handleSubmitRequest({request: submit, onSuccess})}
            submitting={submitting}
            isEditing={!!record}
            backTo={ITEM_TAX_TYPES_PATH}
            onDelete={onDelete}
        >
            <Row className="gx-3">
                <Col md={8}>
                    <TextField control={control} name="name" label={t('name')} required maxLength={100} />
                </Col>
                <Col md={4}>
                    <StatusField control={control} name="status" />
                </Col>
                <Col md={12}>
                    <SwitchField control={control} name="tax_exempt" label={t('fullyTaxExempt')} hint={t('fullyTaxExemptHint')} />
                </Col>
            </Row>

            {!taxExempt && (
                <>
                    <FormSectionTitle title={t('exemptFrom')} hint={t('exemptFromHint')} />
                    <Controller
                        control={control}
                        name="exempt_tax_type_ids"
                        render={({field}) => {
                            const selected: number[] = field.value ?? [];
                            const toggle = (id: number, checked: boolean) => field.onChange(
                                checked ? [...selected.filter(v => v !== id), id] : selected.filter(v => v !== id),
                            );

                            if (taxTypesLoading) {
                                return <div className="mb-3"><Spinner animation="border" size="sm" /></div>;
                            }
                            if (!visibleTaxTypes.length) {
                                return <div className="text-muted small mb-3">{t('noTaxTypesDefined')}</div>;
                            }

                            return (
                                <Row className="gx-3 mb-3">
                                    {visibleTaxTypes.map(tt => (
                                        <Col md={6} lg={4} key={tt.id}>
                                            <Form.Check
                                                type="checkbox"
                                                id={`exempt-tax-${tt.id}`}
                                                className="mb-2"
                                                label={`${tt.code} - ${tt.name} (${formatRate(tt.rate)})${tt.status !== "active" ? ` [${t('inactive')}]` : ""}`}
                                                checked={selected.includes(tt.id)}
                                                onBlur={field.onBlur}
                                                onChange={(e) => toggle(tt.id, e.target.checked)}
                                            />
                                        </Col>
                                    ))}
                                </Row>
                            );
                        }}
                    />
                </>
            )}
        </SettingsFormPage>
    );
}
