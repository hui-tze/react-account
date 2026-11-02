import {useEffect} from "react";
import {Col, Row} from "react-bootstrap";
import {useRequestForm} from "@/hooks/use-request-handler";
import {Item} from "@/apis/models/item";
import {ItemRequest} from "@/apis/requests/item-api";
import {useGetItemCategoryOptions} from "@/apis/requests/item-category-api";
import {useGetItemTaxCategoryOptions} from "@/apis/requests/item-tax-category-api";
import {useGetUomOptions} from "@/apis/requests/uom-api";
import {einvoiceSettingApi} from "@/apis/requests/einvoice-api";
import {SelectField, StatusField, SwitchField, TextAreaField, TextField} from "@/components/FormField/FormFields";
import SettingsFormPage, {FormSectionTitle} from "@/views/Settings/shared/SettingsFormPage";
import {RecordFormProps} from "@/views/Settings/shared/SettingsEditPage";
import {useAccountOptions} from "@/views/Settings/shared/options";
import {useSmartTranslation} from "@/hooks/use-translation";
import {ITEMS_PATH} from "../inventory-menu";
import {ITEM_KIND_LABEL_KEYS} from "./index";

type AccountFieldName = "sales_account_id" | "cogs_account_id" | "inventory_account_id" | "adjustment_account_id" | "wip_account_id";

export function ItemForm({record, onSubmit, onSuccess, onDelete}: RecordFormProps<Item, ItemRequest>) {
    const {t} = useSmartTranslation();
    const {options: accountOptions} = useAccountOptions();
    const {data: categories} = useGetItemCategoryOptions();
    const {data: taxCategories} = useGetItemTaxCategoryOptions();
    const {data: uoms} = useGetUomOptions();
    const {data: einvCodes} = einvoiceSettingApi.useCodes();

    // keep the saved (possibly inactive) value selectable
    const categoryOptions = (categories ?? [])
        .filter(c => c.status === "active" || c.id === record?.item_category_id)
        .map(c => ({value: c.id, label: c.name}));
    const taxOptions = (taxCategories ?? [])
        .filter(c => c.status === "active" || c.id === record?.item_tax_category_id)
        .map(c => ({value: c.id, label: c.name}));
    const uomOptions = (uoms ?? [])
        .filter(u => u.status === "active" || u.id === record?.uom_id)
        .map(u => ({value: u.id, label: `${u.abbreviation} - ${u.name}`}));
    const itemTypeOptions = Object.entries(ITEM_KIND_LABEL_KEYS).map(([value, key]) => ({value, label: t(key)}));

    const {control, watch, setValue, submitting, handleSubmitRequest} = useRequestForm<ItemRequest>({
        formOptions: {
            defaultValues: {
                code: record?.code ?? "",
                name: record?.name ?? "",
                sales_description: record?.sales_description ?? "",
                purchase_description: record?.purchase_description ?? "",
                item_category_id: record?.item_category_id ?? null,
                item_tax_category_id: record?.item_tax_category_id ?? null,
                einv_classification_code: record?.einv_classification_code ?? null,
                uom_id: record?.uom_id ?? null,
                item_type: record?.item_type ?? "stock",
                sales_account_id: record?.sales_account_id ?? null,
                cogs_account_id: record?.cogs_account_id ?? null,
                inventory_account_id: record?.inventory_account_id ?? null,
                adjustment_account_id: record?.adjustment_account_id ?? null,
                wip_account_id: record?.wip_account_id ?? null,
                allow_sales: record?.allow_sales ?? true,
                allow_purchases: record?.allow_purchases ?? true,
                allow_description_override: record?.allow_description_override ?? true,
                status: record?.status ?? "active",
            },
        },
    });

    // a new item takes its defaults from the chosen category; existing items keep their own values
    const categoryId = watch("item_category_id");
    useEffect(() => {
        const category = categories?.find(c => c.id === categoryId);
        if (record || !category) {
            return;
        }
        setValue("item_type", category.item_type);
        setValue("item_tax_category_id", category.item_tax_type_id);
        setValue("uom_id", category.uom_id);
        setValue("sales_account_id", category.sales_account_id);
        setValue("cogs_account_id", category.cogs_account_id);
        setValue("inventory_account_id", category.inventory_account_id);
        setValue("adjustment_account_id", category.adjustment_account_id);
        setValue("wip_account_id", category.assembly_cost_account_id);
        setValue("allow_sales", !category.exclude_from_sales);
        setValue("allow_purchases", !category.exclude_from_purchases);
    }, [categoryId, categories, record, setValue]);

    const accountField = (name: AccountFieldName, labelKey: string) => (
        <Col md={6}>
            <SelectField control={control} name={name} label={t(labelKey)} options={accountOptions} numeric placeholder="" />
        </Col>
    );

    return (
        <SettingsFormPage
            onSubmit={handleSubmitRequest({request: onSubmit, onSuccess})}
            submitting={submitting}
            isEditing={!!record}
            backTo={ITEMS_PATH}
            onDelete={onDelete}
        >
            <FormSectionTitle title={t('general')} />
            <Row className="gx-3">
                <Col md={4}>
                    <TextField control={control} name="code" label={t('code')} required maxLength={50} />
                </Col>
                <Col md={5}>
                    <TextField control={control} name="name" label={t('name')} required maxLength={255} />
                </Col>
                <Col md={3}>
                    <StatusField control={control} name="status" />
                </Col>
                <Col md={4}>
                    <SelectField
                        control={control}
                        name="item_category_id"
                        label={t('itemCategory')}
                        options={categoryOptions}
                        numeric
                        placeholder=""
                        hint={record ? undefined : t('itemCategoryDefaultsHint')}
                    />
                </Col>
                <Col md={4}>
                    <SelectField control={control} name="item_type" label={t('itemType')} options={itemTypeOptions} />
                </Col>
                <Col md={4}>
                    <SelectField control={control} name="uom_id" label={t('unitOfMeasurement')} options={uomOptions} numeric placeholder="" />
                </Col>
                <Col md={4}>
                    <SelectField control={control} name="item_tax_category_id" label={t('itemTaxType')} options={taxOptions} numeric placeholder="" />
                </Col>
                <Col md={4}>
                    <SelectField control={control} name="einv_classification_code" label={t('einvClassification')} placeholder=""
                        options={einvCodes?.classifications ?? []} hint={t('einvClassificationHint')} />
                </Col>
            </Row>

            <FormSectionTitle title={t('description')} />
            <Row className="gx-3">
                <Col md={6}>
                    <TextAreaField control={control} name="sales_description" label={t('salesDescription')} />
                </Col>
                <Col md={6}>
                    <TextAreaField control={control} name="purchase_description" label={t('purchaseDescription')} />
                </Col>
            </Row>

            <FormSectionTitle title={t('glAccounts')} />
            <Row className="gx-3">
                {accountField("sales_account_id", 'salesAccount')}
                {accountField("cogs_account_id", 'cogsAccount')}
                {accountField("inventory_account_id", 'inventoryAccount')}
                {accountField("adjustment_account_id", 'inventoryAdjustmentAccount')}
                {accountField("wip_account_id", 'wipAccount')}
            </Row>

            <FormSectionTitle title={t('options')} />
            <Row className="gx-3">
                <Col md={4}>
                    <SwitchField control={control} name="allow_sales" label={t('allowSales')} />
                </Col>
                <Col md={4}>
                    <SwitchField control={control} name="allow_purchases" label={t('allowPurchases')} />
                </Col>
                <Col md={4}>
                    <SwitchField control={control} name="allow_description_override" label={t('allowDescriptionOverride')} />
                </Col>
            </Row>
        </SettingsFormPage>
    );
}
