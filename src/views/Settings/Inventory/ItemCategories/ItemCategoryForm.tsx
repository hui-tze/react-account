import {Col, Row} from "react-bootstrap";
import {useRequestForm} from "@/hooks/use-request-handler";
import {ItemCategory} from "@/apis/models/item-category";
import {ItemCategoryRequest} from "@/apis/requests/item-category-api";
import {useGetItemTaxCategoryOptions} from "@/apis/requests/item-tax-category-api";
import {useGetUomOptions} from "@/apis/requests/uom-api";
import {SelectField, StatusField, SwitchField, TextField} from "@/components/FormField/FormFields";
import SettingsFormPage, {FormSectionTitle} from "@/views/Settings/shared/SettingsFormPage";
import {RecordFormProps} from "@/views/Settings/shared/SettingsEditPage";
import {useAccountOptions} from "@/views/Settings/shared/options";
import {useSmartTranslation} from "@/hooks/use-translation";
import {ITEM_CATEGORIES_PATH, ITEM_TYPE_LABEL_KEYS} from "./index";

export function ItemCategoryForm({record, onSubmit, onSuccess, onDelete}: RecordFormProps<ItemCategory, ItemCategoryRequest>) {
    const {t} = useSmartTranslation();
    const {options: accountOptions} = useAccountOptions();
    const {data: taxCategories} = useGetItemTaxCategoryOptions();
    const {data: uoms} = useGetUomOptions();

    // keep the saved (possibly inactive) value selectable
    const taxOptions = (taxCategories ?? [])
        .filter(c => c.status === "active" || c.id === record?.item_tax_type_id)
        .map(c => ({value: c.id, label: c.name}));
    const uomOptions = (uoms ?? [])
        .filter(u => u.status === "active" || u.id === record?.uom_id)
        .map(u => ({value: u.id, label: `${u.abbreviation} - ${u.name}`}));
    const itemTypeOptions = Object.entries(ITEM_TYPE_LABEL_KEYS).map(([value, key]) => ({value, label: t(key)}));

    const {control, submitting, handleSubmitRequest} = useRequestForm<ItemCategoryRequest>({
        formOptions: {
            defaultValues: {
                name: record?.name ?? "",
                item_tax_type_id: record?.item_tax_type_id,
                item_type: record?.item_type ?? "stock",
                sales_account_id: record?.sales_account_id,
                cogs_account_id: record?.cogs_account_id,
                inventory_account_id: record?.inventory_account_id,
                adjustment_account_id: record?.adjustment_account_id,
                assembly_cost_account_id: record?.assembly_cost_account_id,
                uom_id: record?.uom_id ?? null,
                exclude_from_sales: record?.exclude_from_sales ?? false,
                exclude_from_purchases: record?.exclude_from_purchases ?? false,
                status: record?.status ?? "active",
            },
        },
    });

    const accountField = (name: "sales_account_id" | "cogs_account_id" | "inventory_account_id" | "adjustment_account_id" | "assembly_cost_account_id", labelKey: string) => (
        <Col md={6}>
            <SelectField control={control} name={name} label={t(labelKey)} options={accountOptions} numeric required placeholder="" />
        </Col>
    );

    return (
        <SettingsFormPage
            onSubmit={handleSubmitRequest({request: onSubmit, onSuccess})}
            submitting={submitting}
            isEditing={!!record}
            backTo={ITEM_CATEGORIES_PATH}
            onDelete={onDelete}
        >
            <FormSectionTitle title={t('general')} />
            <Row className="gx-3">
                <Col md={8}>
                    <TextField control={control} name="name" label={t('name')} required maxLength={100} />
                </Col>
                <Col md={4}>
                    <StatusField control={control} name="status" />
                </Col>
                <Col md={4}>
                    <SelectField control={control} name="item_type" label={t('itemType')} options={itemTypeOptions} />
                </Col>
                <Col md={4}>
                    <SelectField control={control} name="item_tax_type_id" label={t('itemTaxType')} options={taxOptions} numeric required placeholder="" />
                </Col>
                <Col md={4}>
                    <SelectField control={control} name="uom_id" label={t('unitOfMeasurement')} options={uomOptions} numeric placeholder="" />
                </Col>
            </Row>

            <FormSectionTitle title={t('glAccounts')} />
            <Row className="gx-3">
                {accountField("sales_account_id", 'salesAccount')}
                {accountField("cogs_account_id", 'cogsAccount')}
                {accountField("inventory_account_id", 'inventoryAccount')}
                {accountField("adjustment_account_id", 'inventoryAdjustmentAccount')}
                {accountField("assembly_cost_account_id", 'assemblyCostAccount')}
            </Row>

            <FormSectionTitle title={t('options')} />
            <Row className="gx-3">
                <Col md={6}>
                    <SwitchField control={control} name="exclude_from_sales" label={t('excludeFromSales')} />
                </Col>
                <Col md={6}>
                    <SwitchField control={control} name="exclude_from_purchases" label={t('excludeFromPurchases')} />
                </Col>
            </Row>
        </SettingsFormPage>
    );
}
