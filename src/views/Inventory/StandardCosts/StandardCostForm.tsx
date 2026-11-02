import {Col, Row} from "react-bootstrap";
import {useRequestForm} from "@/hooks/use-request-handler";
import {Item} from "@/apis/models/item";
import {ItemStandardCostRequest} from "@/apis/requests/item-api";
import {TextField} from "@/components/FormField/FormFields";
import SettingsFormPage, {FormSectionTitle} from "@/views/Settings/shared/SettingsFormPage";
import {RecordFormProps} from "@/views/Settings/shared/SettingsEditPage";
import {useSmartTranslation} from "@/hooks/use-translation";
import {STANDARD_COSTS_PATH} from "../inventory-menu";
import {formatDecimal} from "../shared/options";
import {standardCostOf} from "./index";

type CostFieldName = keyof ItemStandardCostRequest;

export function StandardCostForm({record, onSubmit, onSuccess}: RecordFormProps<Item, ItemStandardCostRequest> & {record: Item}) {
    const {t} = useSmartTranslation();

    const {control, watch, submitting, handleSubmitRequest} = useRequestForm<ItemStandardCostRequest>({
        formOptions: {
            defaultValues: {
                purchase_cost: Number(record.purchase_cost ?? 0),
                material_cost: Number(record.material_cost ?? 0),
                labour_cost: Number(record.labour_cost ?? 0),
                overhead_cost: Number(record.overhead_cost ?? 0),
            },
        },
    });

    const [material, labour, overhead] = watch(["material_cost", "labour_cost", "overhead_cost"]);
    const total = standardCostOf({material_cost: String(material ?? 0), labour_cost: String(labour ?? 0), overhead_cost: String(overhead ?? 0)});

    const costField = (name: CostFieldName, labelKey: string, hintKey?: string) => (
        <Col md={6} lg={3}>
            <TextField
                control={control}
                name={name}
                label={t(labelKey)}
                hint={hintKey ? t(hintKey) : undefined}
                type="number"
                numeric
                required
                min={0}
                step="0.0001"
                rules={{min: {value: 0, message: t('valueMustNotBeNegative')}}}
            />
        </Col>
    );

    return (
        <SettingsFormPage
            onSubmit={handleSubmitRequest({request: onSubmit, onSuccess})}
            submitting={submitting}
            isEditing
            backTo={STANDARD_COSTS_PATH}
        >
            <FormSectionTitle title={`${record.code} - ${record.name}`} hint={t('standardCostHint')} />
            <Row className="gx-3">
                {costField("material_cost", 'materialCost')}
                {costField("labour_cost", 'labourCost')}
                {costField("overhead_cost", 'overheadCost')}
                <Col md={6} lg={3}>
                    <div className="mb-3">
                        <div className="form-label">{t('standardCost')}</div>
                        <div className="fs-5 fw-semibold text-dark py-1">{formatDecimal(total, 4)}</div>
                    </div>
                </Col>
            </Row>

            <FormSectionTitle title={t('purchasing')} />
            <Row className="gx-3">
                {costField("purchase_cost", 'lastPurchaseCost', 'lastPurchaseCostHint')}
            </Row>
        </SettingsFormPage>
    );
}
