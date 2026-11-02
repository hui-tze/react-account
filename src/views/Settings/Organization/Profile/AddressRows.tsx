import {Button, Col, Form, Row} from "react-bootstrap";
import {Plus, Trash2} from "react-feather";
import {Control, Controller, useFieldArray, UseFormSetValue, UseFormWatch} from "react-hook-form";
import {SelectField, TextField} from "@/components/FormField/FormFields";
import {FormSectionTitle} from "@/views/Settings/shared/SettingsFormPage";
import {useSmartTranslation} from "@/hooks/use-translation";
import {CompanyAddressRequest} from "@/apis/requests/company-api";
import {EMPTY_ADDRESS} from "./profile-form";

const ADDRESS_TYPES = ["registered", "business", "billing", "shipping", "other"];

// any form with an `addresses` array (company profile, customer, customer branch)
type AddressForm = {addresses: CompanyAddressRequest[]};

type AddressRowsProps<T extends AddressForm> = {
    control: Control<T>,
    watch: UseFormWatch<T>,
    setValue: UseFormSetValue<T>,
};

export function AddressRows<T extends AddressForm>(props: AddressRowsProps<T>) {
    // react-hook-form can't resolve `addresses.${n}` paths on an open generic, so work on the slice type
    const {control, watch, setValue} = props as unknown as AddressRowsProps<AddressForm>;
    const {t} = useSmartTranslation();
    // keyName avoids clobbering the record's own `id`, which must be sent back on save
    const {fields, append, remove} = useFieldArray({control, name: "addresses", keyName: "fieldKey"});
    const addresses = watch("addresses");

    const typeOptions = (current: string | null) => {
        const options = ADDRESS_TYPES.map(type => ({value: type, label: t(`addressType_${type}`)}));
        // keep a legacy/free-text value selectable
        if (current && !ADDRESS_TYPES.includes(current)) {
            options.push({value: current, label: current});
        }
        return options;
    };

    return (
        <>
            <div className="d-flex align-items-start justify-content-between">
                <FormSectionTitle title={t('addresses')} />
                <Button
                    variant="outline-primary"
                    size="sm"
                    type="button"
                    onClick={() => append({...EMPTY_ADDRESS, is_primary: fields.length === 0})}
                >
                    <Plus size={14} className="me-1" />{t('addAddress')}
                </Button>
            </div>

            {fields.length === 0 && <p className="text-muted small">{t('noAddresses')}</p>}

            {fields.map((field, index) => (
                <div key={field.fieldKey} className="border rounded p-3 mb-3">
                    <Row className="gx-3">
                        <Col md={4}>
                            <SelectField
                                control={control}
                                name={`addresses.${index}.type`}
                                label={t('addressType')}
                                placeholder=""
                                options={typeOptions(addresses?.[index]?.type ?? null)}
                            />
                        </Col>
                        <Col md={4} className="d-flex align-items-end">
                            <Controller
                                control={control}
                                name={`addresses.${index}.is_primary`}
                                render={({field: primary}) => (
                                    <Form.Group className="mb-3">
                                        <Form.Check
                                            type="switch"
                                            id={`address-primary-${field.fieldKey}`}
                                            label={t('primaryAddress')}
                                            checked={!!primary.value}
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                // only one primary address at a time
                                                if (checked) {
                                                    (addresses ?? []).forEach((_, i) => {
                                                        if (i !== index) {
                                                            setValue(`addresses.${i}.is_primary`, false);
                                                        }
                                                    });
                                                }
                                                primary.onChange(checked);
                                            }}
                                        />
                                    </Form.Group>
                                )}
                            />
                        </Col>
                        <Col md={4} className="d-flex align-items-end justify-content-end">
                            <Button
                                variant="flush-danger"
                                size="sm"
                                type="button"
                                className="mb-3"
                                onClick={() => remove(index)}
                            >
                                <Trash2 size={14} className="me-1" />{t('remove')}
                            </Button>
                        </Col>
                        <Col md={12}>
                            <TextField control={control} name={`addresses.${index}.address1`} label={t('addressLine1')} required />
                        </Col>
                        <Col md={6}>
                            <TextField control={control} name={`addresses.${index}.address2`} label={t('addressLine2')} />
                        </Col>
                        <Col md={6}>
                            <TextField control={control} name={`addresses.${index}.address3`} label={t('addressLine3')} />
                        </Col>
                        <Col md={3}>
                            <TextField control={control} name={`addresses.${index}.postcode`} label={t('postcode')} maxLength={20} />
                        </Col>
                        <Col md={3}>
                            <TextField control={control} name={`addresses.${index}.city`} label={t('city')} />
                        </Col>
                        <Col md={3}>
                            <TextField control={control} name={`addresses.${index}.state`} label={t('state')} />
                        </Col>
                        <Col md={3}>
                            <TextField control={control} name={`addresses.${index}.country`} label={t('country')} />
                        </Col>
                    </Row>
                </div>
            ))}
        </>
    );
}
