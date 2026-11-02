import {Col, Row} from "react-bootstrap";
import {useRequestForm} from "@/hooks/use-request-handler";
import {ItemPurchasePrice} from "@/apis/models/item-purchase-price";
import {ItemPurchasePriceRequest} from "@/apis/requests/item-purchase-price-api";
import {useGetSupplierOptions} from "@/apis/requests/supplier-api";
import {useGetUomOptions} from "@/apis/requests/uom-api";
import {SelectField, StatusField, TextField} from "@/components/FormField/FormFields";
import SettingsFormPage, {FormSectionTitle} from "@/views/Settings/shared/SettingsFormPage";
import {RecordFormProps} from "@/views/Settings/shared/SettingsEditPage";
import {useSmartTranslation} from "@/hooks/use-translation";
import {PURCHASING_PRICING_PATH} from "../inventory-menu";
import {dateOnly, useItemOptions} from "../shared/options";

export function PurchasePriceForm({record, onSubmit, onSuccess, onDelete}: RecordFormProps<ItemPurchasePrice, ItemPurchasePriceRequest>) {
    const {t} = useSmartTranslation();
    const itemOptions = useItemOptions(record?.item_id);
    const {data: suppliers} = useGetSupplierOptions();
    const {data: uoms} = useGetUomOptions();

    // keep the saved (possibly inactive) value selectable
    const supplierOptions = (suppliers ?? [])
        .filter(s => s.status === "active" || s.id === record?.supplier_id)
        .map(s => ({value: s.id, label: `${s.code} - ${s.name}`}));
    const uomOptions = (uoms ?? [])
        .filter(u => u.status === "active" || u.id === record?.supplier_uom_id)
        .map(u => ({value: u.id, label: `${u.abbreviation} - ${u.name}`}));

    const {control, getValues, submitting, handleSubmitRequest} = useRequestForm<ItemPurchasePriceRequest>({
        formOptions: {
            defaultValues: {
                item_id: record?.item_id,
                supplier_id: record?.supplier_id,
                supplier_uom_id: record?.supplier_uom_id,
                conversion_factor: record ? Number(record.conversion_factor) : 1,
                price: record ? Number(record.price) : undefined,
                supplier_item_code: record?.supplier_item_code ?? "",
                supplier_item_name: record?.supplier_item_name ?? "",
                minimum_quantity: record ? Number(record.minimum_quantity) : 1,
                valid_from: dateOnly(record?.valid_from),
                valid_to: dateOnly(record?.valid_to),
                status: record?.status ?? "active",
            },
        },
    });

    const notNegative = {min: {value: 0, message: t('valueMustNotBeNegative')}};

    return (
        <SettingsFormPage
            onSubmit={handleSubmitRequest({request: onSubmit, onSuccess})}
            submitting={submitting}
            isEditing={!!record}
            backTo={PURCHASING_PRICING_PATH}
            onDelete={onDelete}
        >
            <FormSectionTitle title={t('general')} />
            <Row className="gx-3">
                <Col md={8}>
                    <SelectField control={control} name="item_id" label={t('item')} options={itemOptions} numeric required placeholder="" />
                </Col>
                <Col md={4}>
                    <StatusField control={control} name="status" />
                </Col>
                <Col md={8}>
                    <SelectField control={control} name="supplier_id" label={t('supplier')} options={supplierOptions} numeric required placeholder="" />
                </Col>
            </Row>

            <FormSectionTitle title={t('supplierItem')} hint={t('supplierItemHint')} />
            <Row className="gx-3">
                <Col md={4}>
                    <TextField control={control} name="supplier_item_code" label={t('supplierItemCode')} required maxLength={255} />
                </Col>
                <Col md={8}>
                    <TextField control={control} name="supplier_item_name" label={t('supplierItemName')} required maxLength={255} />
                </Col>
                <Col md={4}>
                    <SelectField control={control} name="supplier_uom_id" label={t('supplierUom')} options={uomOptions} numeric required placeholder="" />
                </Col>
                <Col md={4}>
                    <TextField
                        control={control}
                        name="conversion_factor"
                        label={t('conversionFactor')}
                        hint={t('conversionFactorHint')}
                        type="number"
                        numeric
                        required
                        step="0.000001"
                        rules={{validate: (v) => Number(v) > 0 || t('valueMustBePositive')}}
                    />
                </Col>
            </Row>

            <FormSectionTitle title={t('pricing')} />
            <Row className="gx-3">
                <Col md={4}>
                    <TextField control={control} name="price" label={t('price')} type="number" numeric required min={0} step="0.0001" rules={notNegative} />
                </Col>
                <Col md={4}>
                    <TextField control={control} name="minimum_quantity" label={t('minimumQuantity')} type="number" numeric required min={0} step="0.0001" rules={notNegative} />
                </Col>
                <Col md={4} />
                <Col md={4}>
                    <TextField control={control} name="valid_from" label={t('validFrom')} type="date" />
                </Col>
                <Col md={4}>
                    <TextField
                        control={control}
                        name="valid_to"
                        label={t('validTo')}
                        type="date"
                        rules={{validate: (v) => !v || !getValues("valid_from") || String(v) >= String(getValues("valid_from")) || t('validToAfterFrom')}}
                    />
                </Col>
            </Row>
        </SettingsFormPage>
    );
}
