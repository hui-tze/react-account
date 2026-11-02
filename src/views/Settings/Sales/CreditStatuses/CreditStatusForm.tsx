import {Col, Row} from "react-bootstrap";
import {useRequestForm} from "@/hooks/use-request-handler";
import {CreditStatus} from "@/apis/models/credit-status";
import {CreditStatusRequest} from "@/apis/requests/credit-status-api";
import {StatusField, SwitchField, TextAreaField, TextField} from "@/components/FormField/FormFields";
import SettingsFormPage from "@/views/Settings/shared/SettingsFormPage";
import {RecordFormProps} from "@/views/Settings/shared/SettingsEditPage";
import {useSmartTranslation} from "@/hooks/use-translation";
import {CREDIT_STATUSES_PATH} from "./index";

export function CreditStatusForm({record, onSubmit, onSuccess, onDelete}: RecordFormProps<CreditStatus, CreditStatusRequest>) {
    const {t} = useSmartTranslation();

    const {control, submitting, handleSubmitRequest} = useRequestForm<CreditStatusRequest>({
        formOptions: {
            defaultValues: {
                name: record?.name ?? "",
                allow_invoice: record?.allow_invoice ?? true,
                allow_order: record?.allow_order ?? true,
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
            backTo={CREDIT_STATUSES_PATH}
            onDelete={onDelete}
        >
            <Row className="gx-3">
                <Col md={8}>
                    <TextField control={control} name="name" label={t('name')} required maxLength={255} />
                </Col>
                <Col md={4}>
                    <StatusField control={control} name="status" />
                </Col>
                <Col md={4}>
                    <SwitchField control={control} name="allow_invoice" label={t('allowInvoice')} />
                </Col>
                <Col md={4}>
                    <SwitchField control={control} name="allow_order" label={t('allowOrder')} />
                </Col>
                <Col md={12}>
                    <TextAreaField control={control} name="description" label={t('description')} />
                </Col>
            </Row>
        </SettingsFormPage>
    );
}
