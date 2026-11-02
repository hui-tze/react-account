import {Col, Row} from "react-bootstrap";
import {useRequestForm} from "@/hooks/use-request-handler";
import {TinLookup} from "@/views/Einvoice/shared/TinLookup";
import {Supplier} from "@/apis/models/supplier";
import {SupplierRequest} from "@/apis/requests/supplier-api";
import {useGetCurrencyOptions} from "@/apis/requests/currency-api";
import {useGetPaymentTermOptions} from "@/apis/requests/payment-term-api";
import {useGetTaxGroupOptions} from "@/apis/requests/tax-group-api";
import {SelectField, StatusField, SwitchField, TextAreaField, TextField} from "@/components/FormField/FormFields";
import SettingsFormPage, {FormSectionTitle} from "@/views/Settings/shared/SettingsFormPage";
import {RecordFormProps} from "@/views/Settings/shared/SettingsEditPage";
import {AddressRows} from "@/views/Settings/Organization/Profile/AddressRows";
import {ContactRows} from "@/views/Settings/Organization/Profile/ContactRows";
import {addressesToForm, addressesToPayload, blankToNull, contactsToForm, contactsToPayload} from "@/views/Settings/Organization/Profile/profile-form";
import {useAccountOptions} from "@/views/Settings/shared/options";
import {useSmartTranslation} from "@/hooks/use-translation";
import {SUPPLIERS_PATH} from "../purchases-menu";

type Option = {id: number, status: string};

/** Active options plus the currently saved value, so an inactive default stays visible. */
function activeOptions<T extends Option>(rows: T[] | undefined, selected: number | null | undefined, label: (row: T) => string) {
    return (rows ?? [])
        .filter(r => r.status === "active" || r.id === selected)
        .map(r => ({value: r.id, label: label(r)}));
}

export function SupplierForm({record, onSubmit, onSuccess, onDelete}: RecordFormProps<Supplier, SupplierRequest>) {
    const {t} = useSmartTranslation();
    const {data: currencies} = useGetCurrencyOptions();
    const {data: terms} = useGetPaymentTermOptions();
    const {data: taxGroups} = useGetTaxGroupOptions();
    const {options: accountOptions} = useAccountOptions();

    const {control, watch, setValue, submitting, handleSubmitRequest} = useRequestForm<SupplierRequest>({
        formOptions: {
            defaultValues: {
                code: record?.code ?? "",
                name: record?.name ?? "",
                short_name: record?.short_name ?? "",
                tin: record?.tin ?? "",
                tax_no: record?.tax_no ?? "",
                registration_no: record?.registration_no ?? "",
                einv_id_type: record?.einv_id_type ?? null,
                currency_id: record?.currency_id ?? null,
                payment_terms_id: record?.payment_terms_id ?? null,
                tax_group_id: record?.tax_group_id ?? null,
                credit_limit: Number(record?.credit_limit ?? 0),
                tax_included: !!record?.tax_included,
                payable_account_id: record?.payable_account_id ?? null,
                purchase_account_id: record?.purchase_account_id ?? null,
                purchase_discount_account_id: record?.purchase_discount_account_id ?? null,
                notes: record?.notes ?? "",
                status: record?.status ?? "active",
                addresses: addressesToForm(record?.addresses),
                contacts: contactsToForm(record?.contacts),
            },
        },
    });

    const submit = (values: SupplierRequest) => onSubmit({
        ...values,
        code: blankToNull(values.code),
        name: values.name.trim(),
        short_name: blankToNull(values.short_name),
        tin: blankToNull(values.tin),
        tax_no: blankToNull(values.tax_no),
        registration_no: blankToNull(values.registration_no),
        notes: blankToNull(values.notes),
        addresses: addressesToPayload(values.addresses),
        contacts: contactsToPayload(values.contacts),
    });

    return (
        <SettingsFormPage
            onSubmit={handleSubmitRequest({request: submit, onSuccess})}
            submitting={submitting}
            isEditing={!!record}
            backTo={SUPPLIERS_PATH}
            onDelete={onDelete}
        >
            <FormSectionTitle title={t('general')} />
            <Row className="gx-3">
                <Col md={3}>
                    <TextField control={control} name="code" label={t('supplierCode')} maxLength={50} />
                </Col>
                <Col md={6}>
                    <TextField control={control} name="name" label={t('supplierName')} required maxLength={255} />
                </Col>
                <Col md={3}>
                    <StatusField control={control} name="status" />
                </Col>
                <Col md={3}>
                    <TextField control={control} name="short_name" label={t('shortName')} maxLength={60} />
                </Col>
                <Col md={3}>
                    <TextField control={control} name="tin" label={t('tin')} maxLength={50} hint={t('tinHint')} />
                </Col>
                <Col md={3}>
                    <TextField control={control} name="registration_no" label={t('registrationNo')} maxLength={100} />
                </Col>
                <Col md={3}>
                    <SelectField control={control} name="einv_id_type" label={t('einvIdType')} placeholder="" hint={t('einvIdTypeHint')} options={[
                        {value: "BRN", label: t('einvIdType_BRN')},
                        {value: "NRIC", label: t('einvIdType_NRIC')},
                        {value: "PASSPORT", label: t('einvIdType_PASSPORT')},
                        {value: "ARMY", label: t('einvIdType_ARMY')},
                    ]} />
                </Col>
                <Col md={3}>
                    <TextField control={control} name="tax_no" label={t('sstNo')} maxLength={100} />
                </Col>
            </Row>
            <TinLookup control={control} setValue={setValue} />

            <FormSectionTitle title={t('purchasingTerms')} />
            <Row className="gx-3">
                <Col md={4}>
                    <SelectField control={control} name="currency_id" label={t('currency')} numeric placeholder=""
                        options={(currencies ?? []).filter(c => c.status === "active" || c.id === record?.currency_id).map(c => ({value: c.id, label: `${c.code} - ${c.name}`}))} />
                </Col>
                <Col md={4}>
                    <SelectField control={control} name="payment_terms_id" label={t('paymentTerms')} numeric placeholder=""
                        options={activeOptions(terms, record?.payment_terms_id, p => p.name)} hint={t('supplierTermsHint')} />
                </Col>
                <Col md={4}>
                    <SelectField control={control} name="tax_group_id" label={t('taxGroup')} numeric placeholder=""
                        options={activeOptions(taxGroups, record?.tax_group_id, g => g.name)} hint={t('supplierTaxGroupHint')} />
                </Col>
                <Col md={4}>
                    <TextField control={control} name="credit_limit" label={t('creditFromSupplier')} type="number" numeric min={0} step="0.01"
                        rules={{min: {value: 0, message: t('valueMustNotBeNegative')}}} />
                </Col>
                <Col md={4}>
                    <SwitchField control={control} name="tax_included" label={t('supplierPricesIncludeTax')} hint={t('supplierTaxIncludedHint')} />
                </Col>
            </Row>

            <FormSectionTitle title={t('glAccounts')} hint={t('supplierAccountsHint')} />
            <Row className="gx-3">
                <Col md={4}>
                    <SelectField control={control} name="payable_account_id" label={t('payableAccount')} numeric placeholder="" options={accountOptions} />
                </Col>
                <Col md={4}>
                    <SelectField control={control} name="purchase_account_id" label={t('purchaseAccount')} numeric placeholder="" options={accountOptions} />
                </Col>
                <Col md={4}>
                    <SelectField control={control} name="purchase_discount_account_id" label={t('purchaseDiscountAccount')} numeric placeholder="" options={accountOptions} />
                </Col>
            </Row>

            <hr className="my-3" />
            <AddressRows control={control} watch={watch} setValue={setValue} />

            <hr className="my-3" />
            <ContactRows control={control} usedCategoryIds={(record?.contacts ?? []).map(c => c.category_id)} entityType="supplier" />

            <hr className="my-3" />
            <TextAreaField control={control} name="notes" label={t('notes')} rows={3} />
        </SettingsFormPage>
    );
}
