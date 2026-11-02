import {Alert, Col, Row} from "react-bootstrap";
import {useRequestForm} from "@/hooks/use-request-handler";
import {ContactCategory} from "@/apis/models/contact-category";
import {ContactCategoryRequest} from "@/apis/requests/contact-category-api";
import {SelectField, StatusField, TextField} from "@/components/FormField/FormFields";
import SettingsFormPage from "@/views/Settings/shared/SettingsFormPage";
import {RecordFormProps} from "@/views/Settings/shared/SettingsEditPage";
import {useSmartTranslation} from "@/hooks/use-translation";
import {CONTACT_CATEGORIES_PATH, useContactEntityTypeOptions} from "./index";

export function ContactCategoryForm({record, onSubmit, onSuccess, onDelete}: RecordFormProps<ContactCategory, ContactCategoryRequest>) {
    const {t} = useSmartTranslation();
    const entityTypeOptions = useContactEntityTypeOptions();
    // system categories (e.g. the company's "general" one) are looked up by entity type + code — keep those fixed
    const isSystem = !!record?.is_system;

    const {control, submitting, handleSubmitRequest} = useRequestForm<ContactCategoryRequest>({
        formOptions: {
            defaultValues: {
                entity_type: record?.entity_type,
                code: record?.code ?? "",
                name: record?.name ?? "",
                status: record?.status ?? "active",
            },
        },
    });

    return (
        <SettingsFormPage
            onSubmit={handleSubmitRequest({request: onSubmit, onSuccess})}
            submitting={submitting}
            isEditing={!!record}
            backTo={CONTACT_CATEGORIES_PATH}
            onDelete={onDelete}
        >
            {isSystem && (
                <Alert variant="info" className="py-2">{t('contactCategorySystemHint')}</Alert>
            )}
            <Row className="gx-3">
                <Col md={4}>
                    <TextField control={control} name="code" label={t('code')} required maxLength={255} disabled={isSystem} />
                </Col>
                <Col md={8}>
                    <TextField control={control} name="name" label={t('name')} required maxLength={255} />
                </Col>
                <Col md={8}>
                    <SelectField
                        control={control}
                        name="entity_type"
                        label={t('entityType')}
                        required
                        placeholder=""
                        options={entityTypeOptions}
                        disabled={isSystem}
                    />
                </Col>
                <Col md={4}>
                    <StatusField control={control} name="status" />
                </Col>
            </Row>
        </SettingsFormPage>
    );
}
