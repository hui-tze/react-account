import {Col, Row} from "react-bootstrap";
import {useRequestForm} from "@/hooks/use-request-handler";
import {TaxType} from "@/apis/models/tax-type";
import {TaxTypeRequest} from "@/apis/requests/tax-type-api";
import {SelectField, StatusField, SwitchField, TextField} from "@/components/FormField/FormFields";
import SettingsFormPage, {FormSectionTitle} from "@/views/Settings/shared/SettingsFormPage";
import {RecordFormProps} from "@/views/Settings/shared/SettingsEditPage";
import {useAccountOptions} from "@/views/Settings/shared/options";
import {useSmartTranslation} from "@/hooks/use-translation";
import {einvoiceSettingApi} from "@/apis/requests/einvoice-api";
import {TAX_TYPES_PATH} from "./index";

export function TaxTypeForm({record, onSubmit, onSuccess, onDelete}: RecordFormProps<TaxType, TaxTypeRequest>) {
    const {t} = useSmartTranslation();
    const accounts = useAccountOptions();
    const {data: codes} = einvoiceSettingApi.useCodes();

    const {control, submitting, handleSubmitRequest} = useRequestForm<TaxTypeRequest>({
        formOptions: {
            defaultValues: {
                code: record?.code ?? "",
                name: record?.name ?? "",
                rate: record ? Number(record.rate) : null,
                einv_tax_type: record?.einv_tax_type ?? null,
                sales_tax_account_id: record?.sales_tax_account_id,
                purchase_tax_account_id: record?.purchase_tax_account_id,
                for_sales: record?.for_sales ?? true,
                for_purchase: record?.for_purchase ?? true,
                status: record?.status ?? "active",
            },
        },
    });

    return (
        <SettingsFormPage
            onSubmit={handleSubmitRequest({request: onSubmit, onSuccess})}
            submitting={submitting}
            isEditing={!!record}
            backTo={TAX_TYPES_PATH}
            onDelete={onDelete}
        >
            <Row className="gx-3">
                <Col md={4}>
                    <TextField control={control} name="code" label={t('code')} required maxLength={50} />
                </Col>
                <Col md={8}>
                    <TextField control={control} name="name" label={t('name')} required maxLength={100} />
                </Col>
                <Col md={4}>
                    <TextField control={control} name="rate" label={t('ratePercent')} type="number" numeric required min={0} step="0.0001"
                               rules={{min: {value: 0, message: t('rateMustNotBeNegative')}}} />
                </Col>
                <Col md={4}>
                    <SelectField control={control} name="einv_tax_type" label={t('einvTaxType')} placeholder="" options={codes?.tax_types ?? []}
                                 hint={t('einvTaxTypeHint')} />
                </Col>
                <Col md={4}>
                    <StatusField control={control} name="status" />
                </Col>
            </Row>

            <FormSectionTitle title={t('glAccounts')} />
            <Row className="gx-3">
                <Col md={6}>
                    <SelectField control={control} name="sales_tax_account_id" label={t('salesTaxAccount')} required numeric placeholder=""
                                 options={accounts.options} disabled={accounts.isLoading} />
                </Col>
                <Col md={6}>
                    <SelectField control={control} name="purchase_tax_account_id" label={t('purchaseTaxAccount')} required numeric placeholder=""
                                 options={accounts.options} disabled={accounts.isLoading} />
                </Col>
            </Row>

            <FormSectionTitle title={t('applicability')} />
            <Row className="gx-3">
                <Col md={4}>
                    <SwitchField control={control} name="for_sales" label={t('forSales')} />
                </Col>
                <Col md={4}>
                    <SwitchField control={control} name="for_purchase" label={t('forPurchase')} />
                </Col>
            </Row>
        </SettingsFormPage>
    );
}
