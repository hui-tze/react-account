import {Col, Row} from "react-bootstrap";
import {useRequestForm} from "@/hooks/use-request-handler";
import {PosSetting} from "@/apis/models/pos-setting";
import {PosSettingRequest} from "@/apis/requests/pos-setting-api";
import {useGetInventoryLocationOptions} from "@/apis/requests/inventory-location-api";
import {SelectField, StatusField, SwitchField, TextField} from "@/components/FormField/FormFields";
import SettingsFormPage from "@/views/Settings/shared/SettingsFormPage";
import {RecordFormProps} from "@/views/Settings/shared/SettingsEditPage";
import {useAccountOptions} from "@/views/Settings/shared/options";
import {useSmartTranslation} from "@/hooks/use-translation";
import {POS_SETTINGS_PATH} from "./index";

export function PosSettingForm({record, onSubmit, onSuccess, onDelete}: RecordFormProps<PosSetting, PosSettingRequest>) {
    const {t} = useSmartTranslation();
    const {options: accountOptions} = useAccountOptions();
    const {data: locations} = useGetInventoryLocationOptions();

    // keep the saved (possibly inactive) location selectable
    const locationOptions = (locations ?? [])
        .filter(l => l.status === "active" || l.id === record?.location_id)
        .map(l => ({value: l.id, label: `${l.code} - ${l.name}`}));

    const {control, submitting, handleSubmitRequest} = useRequestForm<PosSettingRequest>({
        formOptions: {
            defaultValues: {
                name: record?.name ?? "",
                account_id: record?.account_id,
                location_id: record?.location_id,
                allow_credit_sale_terms: record?.allow_credit_sale_terms ?? false,
                allow_cash_sale_terms: record?.allow_cash_sale_terms ?? false,
                status: record?.status ?? "active",
            },
        },
    });

    return (
        <SettingsFormPage
            onSubmit={handleSubmitRequest({request: onSubmit, onSuccess})}
            submitting={submitting}
            isEditing={!!record}
            backTo={POS_SETTINGS_PATH}
            onDelete={onDelete}
        >
            <Row className="gx-3">
                <Col md={8}>
                    <TextField control={control} name="name" label={t('name')} required maxLength={255} />
                </Col>
                <Col md={4}>
                    <StatusField control={control} name="status" />
                </Col>
                <Col md={6}>
                    <SelectField control={control} name="account_id" label={t('cashAccount')} options={accountOptions} numeric required placeholder="" />
                </Col>
                <Col md={6}>
                    <SelectField control={control} name="location_id" label={t('inventoryLocation')} options={locationOptions} numeric required placeholder="" />
                </Col>
                <Col md={6}>
                    <SwitchField control={control} name="allow_credit_sale_terms" label={t('allowCreditSaleTerms')} />
                </Col>
                <Col md={6}>
                    <SwitchField control={control} name="allow_cash_sale_terms" label={t('allowCashSaleTerms')} />
                </Col>
            </Row>
        </SettingsFormPage>
    );
}
