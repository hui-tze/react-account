import {Col, Row} from "react-bootstrap";
import {useRequestForm} from "@/hooks/use-request-handler";
import {ItemSalePrice} from "@/apis/models/item-sale-price";
import {ItemSalePriceRequest} from "@/apis/requests/item-sale-price-api";
import {useGetSalesTypeOptions} from "@/apis/requests/sales-type-api";
import {useGetCurrencyOptions} from "@/apis/requests/currency-api";
import {SelectField, StatusField, TextField} from "@/components/FormField/FormFields";
import SettingsFormPage, {FormSectionTitle} from "@/views/Settings/shared/SettingsFormPage";
import {RecordFormProps} from "@/views/Settings/shared/SettingsEditPage";
import {useSmartTranslation} from "@/hooks/use-translation";
import {SALES_PRICING_PATH} from "../inventory-menu";
import {useItemOptions} from "../shared/options";

export function SalesPriceForm({record, onSubmit, onSuccess, onDelete}: RecordFormProps<ItemSalePrice, ItemSalePriceRequest>) {
    const {t} = useSmartTranslation();
    const itemOptions = useItemOptions(record?.item_id);
    const {data: salesTypes} = useGetSalesTypeOptions();
    const {data: currencies} = useGetCurrencyOptions();

    // keep the saved (possibly inactive) value selectable
    const salesTypeOptions = (salesTypes ?? [])
        .filter(s => s.status === "active" || s.id === record?.sales_type_id)
        .map(s => ({value: s.id, label: s.name}));
    const currencyOptions = (currencies ?? [])
        .filter(c => c.status === "active" || c.id === record?.currency_id)
        .map(c => ({value: c.id, label: `${c.code} - ${c.name}`}));

    const {control, submitting, handleSubmitRequest} = useRequestForm<ItemSalePriceRequest>({
        formOptions: {
            defaultValues: {
                item_id: record?.item_id,
                sales_type_id: record?.sales_type_id,
                currency_id: record?.currency_id,
                price: record ? Number(record.price) : undefined,
                status: record?.status ?? "active",
            },
        },
    });

    return (
        <SettingsFormPage
            onSubmit={handleSubmitRequest({request: onSubmit, onSuccess})}
            submitting={submitting}
            isEditing={!!record}
            backTo={SALES_PRICING_PATH}
            onDelete={onDelete}
        >
            <FormSectionTitle title={t('general')} hint={t('salesPriceHint')} />
            <Row className="gx-3">
                <Col md={8}>
                    <SelectField control={control} name="item_id" label={t('item')} options={itemOptions} numeric required placeholder="" />
                </Col>
                <Col md={4}>
                    <StatusField control={control} name="status" />
                </Col>
                <Col md={4}>
                    <SelectField control={control} name="sales_type_id" label={t('salesType')} options={salesTypeOptions} numeric required placeholder="" />
                </Col>
                <Col md={4}>
                    <SelectField control={control} name="currency_id" label={t('currency')} options={currencyOptions} numeric required placeholder="" />
                </Col>
                <Col md={4}>
                    <TextField control={control} name="price" label={t('price')} type="number" numeric required min={0} step="0.0001" rules={{min: {value: 0, message: t('valueMustNotBeNegative')}}} />
                </Col>
            </Row>
        </SettingsFormPage>
    );
}
