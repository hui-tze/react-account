import {Col, Row} from "react-bootstrap";
import {useRequestForm} from "@/hooks/use-request-handler";
import {SalesArea} from "@/apis/models/sales-area";
import {SalesAreaRequest} from "@/apis/requests/sales-area-api";
import {StatusField, TextAreaField, TextField} from "@/components/FormField/FormFields";
import SettingsFormPage from "@/views/Settings/shared/SettingsFormPage";
import {RecordFormProps} from "@/views/Settings/shared/SettingsEditPage";
import {useSmartTranslation} from "@/hooks/use-translation";
import {SALES_AREAS_PATH} from "./index";

export function SalesAreaForm({record, onSubmit, onSuccess, onDelete}: RecordFormProps<SalesArea, SalesAreaRequest>) {
    const {t} = useSmartTranslation();

    const {control, submitting, handleSubmitRequest} = useRequestForm<SalesAreaRequest>({
        formOptions: {
            defaultValues: {
                name: record?.name ?? "",
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
            backTo={SALES_AREAS_PATH}
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
                    <TextAreaField control={control} name="description" label={t('description')} />
                </Col>
            </Row>
        </SettingsFormPage>
    );
}
