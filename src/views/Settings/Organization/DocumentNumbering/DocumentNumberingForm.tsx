import {Alert, Col, Row} from "react-bootstrap";
import {useRequestForm} from "@/hooks/use-request-handler";
import {DocumentNumbering} from "@/apis/models/document-numbering";
import {DocumentNumberingRequest} from "@/apis/requests/document-numbering-api";
import {SelectField, StatusField, SwitchField, TextField} from "@/components/FormField/FormFields";
import SettingsFormPage from "@/views/Settings/shared/SettingsFormPage";
import {RecordFormProps} from "@/views/Settings/shared/SettingsEditPage";
import {useSmartTranslation} from "@/hooks/use-translation";
import {DOCUMENT_NUMBERING_PATH, useDocumentTypeLabel} from "./index";
import {PATTERN_PLACEHOLDERS, previewDocumentNumber} from "./pattern";

export function DocumentNumberingForm({record, onSubmit, onSuccess, onDelete}: RecordFormProps<DocumentNumbering, DocumentNumberingRequest>) {
    const {t} = useSmartTranslation();
    const {options: documentTypes} = useDocumentTypeLabel();

    const {control, watch, submitting, handleSubmitRequest} = useRequestForm<DocumentNumberingRequest>({
        formOptions: {
            defaultValues: {
                document_type: record?.document_type ?? "",
                pattern: record?.pattern ?? "",
                padding: record?.padding ?? 4,
                allow_manual: record?.allow_manual ?? true,
                auto_generate: record?.auto_generate ?? true,
                reset_period: record?.reset_period ?? "yearly",
                status: record?.status ?? "active",
            },
        },
    });

    const pattern = watch("pattern");
    const padding = watch("padding");
    const preview = previewDocumentNumber(pattern ?? "", Number(padding) || 1, record?.next_number ?? 1);

    return (
        <SettingsFormPage
            onSubmit={handleSubmitRequest({request: onSubmit, onSuccess})}
            submitting={submitting}
            isEditing={!!record}
            backTo={DOCUMENT_NUMBERING_PATH}
            onDelete={onDelete}
        >
            <Row className="gx-3">
                <Col md={8}>
                    <SelectField
                        control={control}
                        name="document_type"
                        label={t('documentType')}
                        required
                        placeholder=""
                        options={documentTypes}
                    />
                </Col>
                <Col md={4}>
                    <StatusField control={control} name="status" />
                </Col>
                <Col md={12}>
                    <TextField
                        control={control}
                        name="pattern"
                        label={t('pattern')}
                        required
                        maxLength={255}
                        placeholder="INV-{YYYY}{MM}-{NUMBER}"
                        hint={<>{t('patternHint')} <code>{PATTERN_PLACEHOLDERS.join(" ")}</code></>}
                    />
                </Col>
                <Col md={5}>
                    <TextField
                        control={control}
                        name="padding"
                        type="number"
                        numeric
                        label={t('padding')}
                        min={1}
                        max={20}
                        hint={t('paddingHint')}
                        rules={{min: {value: 1, message: t('paddingHint')}, max: {value: 20, message: t('paddingHint')}}}
                    />
                </Col>
                <Col md={7}>
                    <SelectField
                        control={control}
                        name="reset_period"
                        label={t('resetPeriod')}
                        options={[
                            {value: "yearly", label: t('resetPeriod_yearly')},
                            {value: "monthly", label: t('resetPeriod_monthly')},
                            {value: "never", label: t('resetPeriod_never')},
                        ]}
                    />
                </Col>
                <Col md={4}>
                    <SwitchField control={control} name="auto_generate" label={t('autoGenerate')} groupLabel={t('numbering')} />
                </Col>
                <Col md={4}>
                    <SwitchField control={control} name="allow_manual" label={t('allowManual')} groupLabel={" "} />
                </Col>
                <Col md={12}>
                    <Alert variant="light" className="border mt-2 mb-3">
                        <span className="text-muted small">{t('nextNumberPreview')}:</span>{" "}
                        <span className="fw-semibold font-monospace">{preview}</span>
                    </Alert>
                </Col>
            </Row>
        </SettingsFormPage>
    );
}
