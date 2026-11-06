import {Col, Row} from "react-bootstrap";
import {Control, FieldValues, Path, UseFormSetValue} from "react-hook-form";
import {SelectField, TextField} from "@/components/FormField/FormFields";
import {FormSectionTitle} from "@/views/Settings/shared/SettingsFormPage";
import {useSmartTranslation} from "@/hooks/use-translation";
import {einvoiceSettingApi} from "@/apis/requests/einvoice-api";
import {TinFields, TinLookup} from "./TinLookup";

/**
 * Tax & e-invoice identity of a customer / supplier: what the ID is, the ID itself and SST no. on
 * the first row; the TIN with its LHDN check beside it on the second.
 */
export function TaxIdentityFields<T extends FieldValues & TinFields>({control, setValue}: {control: Control<T>, setValue: UseFormSetValue<T>}) {
    const {t} = useSmartTranslation();
    const field = (name: string) => name as Path<T>;
    // e-invoice on: every document to / from this party needs its TIN and ID
    const {data: setting} = einvoiceSettingApi.useGet({revalidateOnFocus: false});
    const required = !!setting?.is_einvoice_enabled;

    return (
        <>
            <FormSectionTitle title={t('taxIdentity')} hint={required ? t('taxIdentityRequiredHint') : t('taxIdentityHint')} />
            <div className="tax-identity-panel">
                <Row className="gx-3">
                    <Col md={4}>
                        <SelectField control={control} name={field("einv_id_type")} label={t('einvIdType')} placeholder="BRN" options={[
                            {value: "BRN", label: t('einvIdType_BRN')},
                            {value: "NRIC", label: t('einvIdType_NRIC')},
                            {value: "PASSPORT", label: t('einvIdType_PASSPORT')},
                            {value: "ARMY", label: t('einvIdType_ARMY')},
                        ]} />
                    </Col>
                    <Col md={4}>
                        <TextField control={control} name={field("registration_no")} label={t('registrationNo')} maxLength={100} required={required} />
                    </Col>
                    <Col md={4}>
                        <TextField control={control} name={field("tax_no")} label={t('sstNo')} maxLength={100} />
                    </Col>
                </Row>
                <Row className="gx-3">
                    <Col md={4}>
                        <TextField control={control} name={field("tin")} label={t('tin')} maxLength={50} required={required} />
                    </Col>
                    <Col md={8}>
                        <TinLookup control={control} setValue={setValue} />
                    </Col>
                </Row>
            </div>
        </>
    );
}
