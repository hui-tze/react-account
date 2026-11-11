import {useMemo} from "react";
import {formatQuantity} from "@/utils/display-format";
import {Button, Col, Row, Table} from "react-bootstrap";
import {Plus, Repeat, Trash2} from "react-feather";
import {useFieldArray, useWatch} from "react-hook-form";
import {useRequestForm} from "@/hooks/use-request-handler";
import {InventoryDocument} from "@/apis/models/inventory-document";
import {LocationTransferRequest} from "@/apis/requests/inventory-document-request";
import {useGetInventoryLocationOptions} from "@/apis/requests/inventory-location-api";
import {useGetStockOnHand} from "@/apis/requests/inventory-movement-api";
import {SelectField, TextAreaField, TextField} from "@/components/FormField/FormFields";
import SettingsFormPage, {FormSectionTitle} from "@/views/Settings/shared/SettingsFormPage";
import {RecordFormProps} from "@/views/Settings/shared/SettingsEditPage";
import {useSmartTranslation} from "@/hooks/use-translation";
import {TRANSFERS_PATH} from "../inventory-menu";
import {formatDecimal} from "../shared/options";
import {applyServerErrors, ItemPicker, LineNumberInput, SignedQuantity, today, useStockItems, VoidedAlert} from "../shared/document";

const EMPTY_LINE = {item_id: null, quantity: null};

export function TransferForm({record, onSubmit, onSuccess, onDelete}: RecordFormProps<InventoryDocument, LocationTransferRequest>) {
    const {t} = useSmartTranslation();
    const {items, byId} = useStockItems();
    const {data: locations} = useGetInventoryLocationOptions();
    const voided = record?.status === "inactive";

    const {control, getValues, setValue, setError, submitting, handleSubmitRequest} = useRequestForm<LocationTransferRequest>({
        formOptions: {
            defaultValues: {
                reference_no: record?.reference_no ?? "",
                trans_date: record?.trans_date?.slice(0, 10) ?? today(),
                inventory_location_id: record?.inventory_location_id,
                to_inventory_location_id: record?.to_inventory_location_id ?? undefined,
                memo: record?.memo ?? "",
                lines: record?.lines?.length
                    ? record.lines.map(l => ({item_id: l.item_id, quantity: Number(l.quantity)}))
                    : [EMPTY_LINE],
            },
        },
    });

    const {fields, append, remove} = useFieldArray({control, name: "lines"});
    const lines = useWatch({control, name: "lines"}) ?? [];
    const fromId = useWatch({control, name: "inventory_location_id"});
    const toId = useWatch({control, name: "to_inventory_location_id"});
    const {data: fromOnHand} = useGetStockOnHand(fromId);
    const {data: toOnHand} = useGetStockOnHand(toId);

    // stock before this document: when editing, take this transfer's own effect back out
    const ownQuantity = useMemo(() => {
        const own = new Map<number, number>();
        if (record && !voided) {
            record.lines?.forEach(l => own.set(l.item_id, Number(l.quantity)));
        }
        return own;
    }, [record, voided]);
    const baselineAt = (locationId: number | null | undefined, onHand: Record<string, number> | undefined, itemId: number) => {
        let qty = Number(onHand?.[itemId] ?? 0);
        if (locationId === record?.inventory_location_id) qty += ownQuantity.get(itemId) ?? 0;
        if (locationId === record?.to_inventory_location_id) qty -= ownQuantity.get(itemId) ?? 0;
        return qty;
    };

    const locationOptions = (locations ?? [])
        .filter(l => l.status === "active" || l.id === record?.inventory_location_id || l.id === record?.to_inventory_location_id)
        .map(l => ({value: l.id, label: `${l.code} - ${l.name}`}));

    const swapLocations = () => {
        const [from, to] = getValues(["inventory_location_id", "to_inventory_location_id"]);
        setValue("inventory_location_id", to, {shouldValidate: true});
        setValue("to_inventory_location_id", from, {shouldValidate: true});
    };

    const totalQuantity = lines.reduce((sum, l) => sum + Number(l?.quantity ?? 0), 0);

    const submit = async (data: LocationTransferRequest) => {
        try {
            await onSubmit({...data, reference_no: data.reference_no.trim()});
        } catch (e) {
            applyServerErrors(e, setError, ["reference_no", "trans_date", "inventory_location_id", "to_inventory_location_id", "lines"]);
            throw e;
        }
    };

    return (
        <SettingsFormPage
            onSubmit={handleSubmitRequest({request: submit, onSuccess})}
            submitting={submitting}
            isEditing={!!record}
            backTo={TRANSFERS_PATH}
            onDelete={onDelete}
            deleteLabel={t('void')}
            submitLabel={record ? undefined : t('processTransfer')}
            readOnly={voided}
        >
            {voided && <VoidedAlert />}

            <FormSectionTitle title={t('details')} />
            <Row className="gx-3 align-items-start">
                <Col md>
                    <SelectField 
                        control={control}
                        name="inventory_location_id"
                        label={t('fromLocation')}
                        options={locationOptions} 
                        numeric
                        required
                        placeholder=""
                        disabled={voided}
                    />
                </Col>
                <Col md="auto" className="d-flex justify-content-center pt-md-4">
                    <Button variant="flush-primary" className="btn-icon btn-rounded mt-md-2 mb-3" title={t('swapLocations')} onClick={swapLocations} disabled={voided}>
                        <Repeat size={16} />
                    </Button>
                </Col>
                <Col md>
                    <SelectField
                        control={control}
                        name="to_inventory_location_id"
                        label={t('toLocation')}
                        options={locationOptions}
                        numeric
                        required
                        placeholder=""
                        disabled={voided}
                        rules={{validate: (v) => v == null || v !== getValues("inventory_location_id") || t('sameLocation')}}
                    />
                </Col>
            </Row>
            <Row className="gx-3">
                <Col md={6}>
                    <TextField control={control} name="trans_date" label={t('date')} type="date" required disabled={voided} />
                </Col>
                <Col md={6}>
                    <TextField
                        control={control}
                        name="reference_no"
                        label={t('referenceNo')}
                        maxLength={255}
                        placeholder={record ? undefined : t('autoGenerated')}
                        hint={record ? undefined : t('referenceAutoHint')}
                        disabled={voided}
                    />
                </Col>
            </Row>

            <FormSectionTitle title={t('transferItems')} />
            <div className="table-responsive mb-2">
                <Table className="align-middle mb-0 inventory-lines">
                    <thead className="table-light">
                        <tr>
                            <th style={{width: 40}}>#</th>
                            <th style={{minWidth: 260}}>{t('item')}</th>
                            <th style={{width: 70}}>{t('unit')}</th>
                            <th style={{width: 120}} className="text-end">{t('availableAtSource')}</th>
                            <th style={{width: 140}} className="text-end">{t('quantity')}</th>
                            <th style={{width: 120}} className="text-end">{t('sourceAfter')}</th>
                            <th style={{width: 130}} className="text-end">{t('destinationAfter')}</th>
                            <th style={{width: 44}} />
                        </tr>
                    </thead>
                    <tbody>
                        {fields.map((field, index) => {
                            const line = lines[index];
                            const itemId = line?.item_id ?? null;
                            const item = itemId != null ? byId.get(itemId) : undefined;
                            const qty = Number(line?.quantity ?? 0);
                            const available = fromId && itemId != null ? baselineAt(fromId, fromOnHand, itemId) : null;
                            const destination = toId && itemId != null ? baselineAt(toId, toOnHand, itemId) : null;

                            return (
                                <tr key={field.id}>
                                    <td className="text-muted">{index + 1}</td>
                                    <td>
                                        <ItemPicker
                                            control={control}
                                            name={`lines.${index}.item_id`}
                                            items={items}
                                            excludeIds={lines.filter((_, i) => i !== index).map(l => l?.item_id).filter((id): id is number => id != null)}
                                            disabled={voided}
                                        />
                                    </td>
                                    <td className="text-muted">{item?.uom ?? "-"}</td>
                                    <td className="text-end text-muted">{available != null ? formatDecimal(available) : "-"}</td>
                                    <td>
                                        <LineNumberInput
                                            control={control}
                                            name={`lines.${index}.quantity`}
                                            min={0}
                                            disabled={voided}
                                            validate={(v) => v > 0 || t('valueMustBePositive')}
                                        />
                                    </td>
                                    <td className="text-end fw-semibold">{available != null ? <SignedQuantity value={available - qty} /> : "-"}</td>
                                    <td className="text-end">{destination != null ? formatQuantity(destination + qty) : "-"}</td>
                                    <td className="text-end">
                                        {!voided && fields.length > 1 && (
                                            <Button variant="flush-danger" size="sm" className="btn-icon btn-rounded" title={t('remove')} onClick={() => remove(index)}>
                                                <Trash2 size={16} />
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={4} className="text-end fw-semibold">{t('totalQuantity')}</td>
                            <td className="text-end fw-bold">{formatQuantity(totalQuantity)}</td>
                            <td colSpan={3} />
                        </tr>
                    </tfoot>
                </Table>
            </div>
            {!voided && (
                <Button variant="outline-primary" size="sm" className="mb-4" onClick={() => append(EMPTY_LINE)}>
                    <Plus size={14} className="me-1" /> {t('addLine')}
                </Button>
            )}

            <TextAreaField control={control} name="memo" label={t('memo')} rows={3} disabled={voided} />
        </SettingsFormPage>
    );
}
