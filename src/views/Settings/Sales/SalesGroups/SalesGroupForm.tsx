import {Col, Row} from "react-bootstrap";
import {useRequestForm} from "@/hooks/use-request-handler";
import {SalesGroup} from "@/apis/models/sales-group";
import {SalesGroupRequest} from "@/apis/requests/sales-group-api";
import {StatusField, TextAreaField, TextField} from "@/components/FormField/FormFields";
import SettingsFormPage from "@/views/Settings/shared/SettingsFormPage";
import {RecordFormProps} from "@/views/Settings/shared/SettingsEditPage";
import {useSmartTranslation} from "@/hooks/use-translation";
import {SALES_GROUPS_PATH} from "./index";

export function SalesGroupForm({record, onSubmit, onSuccess, onDelete}: RecordFormProps<SalesGroup, SalesGroupRequest>) {
    const {t} = useSmartTranslation();

    const {control, submitting, handleSubmitRequest} = useRequestForm<SalesGroupRequest>({
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
            backTo={SALES_GROUPS_PATH}
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
