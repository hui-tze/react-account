import {Col, Row} from "react-bootstrap";
import {useRequestForm} from "@/hooks/use-request-handler";
import {InventoryLocation} from "@/apis/models/inventory-location";
import {InventoryLocationRequest} from "@/apis/requests/inventory-location-api";
import {StatusField, SwitchField, TextField} from "@/components/FormField/FormFields";
import SettingsFormPage from "@/views/Settings/shared/SettingsFormPage";
import {RecordFormProps} from "@/views/Settings/shared/SettingsEditPage";
import {useSmartTranslation} from "@/hooks/use-translation";
import {INVENTORY_LOCATIONS_PATH} from "./index";

export function InventoryLocationForm({record, onSubmit, onSuccess, onDelete}: RecordFormProps<InventoryLocation, InventoryLocationRequest>) {
    const {t} = useSmartTranslation();

    const {control, submitting, handleSubmitRequest} = useRequestForm<InventoryLocationRequest>({
        formOptions: {
            defaultValues: {
                code: record?.code ?? "",
                name: record?.name ?? "",
                fixed_asset: record?.fixed_asset ?? false,
                status: record?.status ?? "active",
            },
        },
    });

    return (
        <SettingsFormPage
            onSubmit={handleSubmitRequest({request: onSubmit, onSuccess})}
            submitting={submitting}
            isEditing={!!record}
            backTo={INVENTORY_LOCATIONS_PATH}
            onDelete={onDelete}
        >
            <Row className="gx-3">
                <Col md={4}>
                    <TextField control={control} name="code" label={t('code')} required maxLength={50} />
                </Col>
                <Col md={8}>
                    <TextField control={control} name="name" label={t('name')} required maxLength={255} />
                </Col>
                <Col md={4}>
                    <StatusField control={control} name="status" />
                </Col>
                <Col md={12} className="d-flex align-items-center">
                    <SwitchField control={control} name="fixed_asset" label={t('fixedAssetLocation')} />
                </Col>
            </Row>
        </SettingsFormPage>
    );
}
