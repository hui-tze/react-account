import {Col, Row} from "react-bootstrap";
import {useRequestForm} from "@/hooks/use-request-handler";
import {SalesType} from "@/apis/models/sales-type";
import {SalesTypeRequest} from "@/apis/requests/sales-type-api";
import {StatusField, SwitchField, TextAreaField, TextField} from "@/components/FormField/FormFields";
import SettingsFormPage from "@/views/Settings/shared/SettingsFormPage";
import {RecordFormProps} from "@/views/Settings/shared/SettingsEditPage";
import {useSmartTranslation} from "@/hooks/use-translation";
import {SALES_TYPES_PATH} from "./index";

export function SalesTypeForm({record, onSubmit, onSuccess, onDelete}: RecordFormProps<SalesType, SalesTypeRequest>) {
    const {t} = useSmartTranslation();

    const {control, submitting, handleSubmitRequest} = useRequestForm<SalesTypeRequest>({
        formOptions: {
            defaultValues: {
                name: record?.name ?? "",
                calculation_factor: record ? Number(record.calculation_factor) : 1,
                tax_included: record?.tax_included ?? false,
                description: record?.description ?? "",
                status: record?.status ?? "active",
            },
        },
    });

    return (
        <SettingsFormPage
            onSubmit={handleSubmitRequest({request: onSubmit, onSuccess})}
            submitting={submitting}
            isEditing={!!record}
            backTo={SALES_TYPES_PATH}
            onDelete={onDelete}
        >
            <Row className="gx-3">
                <Col md={8}>
                    <TextField control={control} name="name" label={t('name')} required maxLength={100} />
                </Col>
                <Col md={4}>
                    <StatusField control={control} name="status" />
                </Col>
                <Col md={6}>
                    {/* calculation_factor is optional server-side but not nullable; the column defaults to 1 */}
                    <TextField
                        control={control}
                        name="calculation_factor"
                        label={t('calculationFactor')}
                        type="number"
                        numeric
                        required
                        step="0.0001"
                        hint={t('calculationFactorHint')}
                    />
                </Col>
                <Col md={12} className="d-flex align-items-center">
                    <SwitchField control={control} name="tax_included" label={t('taxIncluded')} />
                </Col>
                <Col md={12}>
                    <TextAreaField control={control} name="description" label={t('description')} />
                </Col>
            </Row>
        </SettingsFormPage>
    );
}
