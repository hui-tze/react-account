import {Col, Row} from "react-bootstrap";
import {useRequestForm} from "@/hooks/use-request-handler";
import {Uom} from "@/apis/models/uom";
import {UomRequest} from "@/apis/requests/uom-api";
import {SelectField, StatusField, TextField} from "@/components/FormField/FormFields";
import {einvoiceSettingApi} from "@/apis/requests/einvoice-api";
import SettingsFormPage from "@/views/Settings/shared/SettingsFormPage";
import {RecordFormProps} from "@/views/Settings/shared/SettingsEditPage";
import {useSmartTranslation} from "@/hooks/use-translation";
import {UNITS_OF_MEASUREMENT_PATH} from "./index";

export function UomForm({record, onSubmit, onSuccess, onDelete}: RecordFormProps<Uom, UomRequest>) {
    const {t} = useSmartTranslation();
    const {data: codes} = einvoiceSettingApi.useCodes();

    const {control, submitting, handleSubmitRequest} = useRequestForm<UomRequest>({
        formOptions: {
            defaultValues: {
                abbreviation: record?.abbreviation ?? "",
                name: record?.name ?? "",
                decimal_places: record?.decimal_places ?? 0,
                einv_unit_code: record?.einv_unit_code ?? null,
                status: record?.status ?? "active",
            },
        },
    });

    return (
        <SettingsFormPage
            onSubmit={handleSubmitRequest({request: onSubmit, onSuccess})}
            submitting={submitting}
            isEditing={!!record}
            backTo={UNITS_OF_MEASUREMENT_PATH}
            onDelete={onDelete}
        >
            <Row className="gx-3">
                <Col md={4}>
                    <TextField control={control} name="abbreviation" label={t('abbreviation')} required maxLength={20} />
                </Col>
                <Col md={8}>
                    <TextField control={control} name="name" label={t('name')} required maxLength={100} />
                </Col>
                <Col md={4}>
                    <TextField
                        control={control}
                        name="decimal_places"
                        label={t('decimalPlaces')}
                        type="number"
                        numeric
                        required
                        min={0}
                        max={255}
                        step={1}
                    />
                </Col>
                <Col md={4}>
                    <SelectField control={control} name="einv_unit_code" label={t('einvUnitCode')} placeholder="" options={codes?.units ?? []}
                        hint={t('einvUnitCodeHint')} />
                </Col>
                <Col md={4}>
                    <StatusField control={control} name="status" />
                </Col>
            </Row>
        </SettingsFormPage>
    );
}
