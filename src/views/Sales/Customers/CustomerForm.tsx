import {Col, Row} from "react-bootstrap";
import {useRequestForm} from "@/hooks/use-request-handler";
import {TaxIdentityFields} from "@/views/Einvoice/shared/TaxIdentityFields";
import {Customer} from "@/apis/models/customer";
import {CustomerRequest} from "@/apis/requests/customer-api";
import {useGetCurrencyOptions} from "@/apis/requests/currency-api";
import {useGetPaymentTermOptions} from "@/apis/requests/payment-term-api";
import {useGetCreditStatusOptions} from "@/apis/requests/credit-status-api";
import {SelectField, StatusField, TextAreaField, TextField} from "@/components/FormField/FormFields";
import SettingsFormPage, {FormSectionTitle} from "@/views/Settings/shared/SettingsFormPage";
import {RecordFormProps} from "@/views/Settings/shared/SettingsEditPage";
import {AddressRows} from "@/views/Settings/Organization/Profile/AddressRows";
import {ContactRows} from "@/views/Settings/Organization/Profile/ContactRows";
import {addressesToForm, addressesToPayload, blankToNull, contactsToForm, contactsToPayload, EMPTY_ADDRESS, EMPTY_CONTACT} from "@/views/Settings/Organization/Profile/profile-form";
import {useSmartTranslation} from "@/hooks/use-translation";
import {CUSTOMERS_PATH} from "../sales-menu";
import {BranchDefaultsFields, EMPTY_BRANCH_DEFAULTS} from "./BranchDefaultsFields";
import {BranchesPanel} from "./BranchesPanel";
import {AccountSummary} from "./AccountSummary";

export function CustomerForm({record, onSubmit, onSuccess, onDelete}: RecordFormProps<Customer, CustomerRequest>) {
    const {t} = useSmartTranslation();
    const {data: currencies} = useGetCurrencyOptions();
    const {data: terms} = useGetPaymentTermOptions();
    const {data: creditStatuses} = useGetCreditStatusOptions();

    // keep the saved (possibly inactive) value selectable
    const currencyOptions = (currencies ?? [])
        .filter(c => c.status === "active" || c.id === record?.currency_id)
        .map(c => ({value: c.id, label: `${c.code} - ${c.name}`}));
    const termOptions = (terms ?? [])
        .filter(p => p.status === "active" || p.id === record?.payment_terms_id)
        .map(p => ({value: p.id, label: p.name}));
    const creditOptions = (creditStatuses ?? [])
        .filter(s => s.status === "active" || s.id === record?.credit_status_id)
        .map(s => ({value: s.id, label: s.allow_invoice ? s.name : `${s.name} (${t('creditHold')})`}));

    const {control, watch, setValue, submitting, handleSubmitRequest} = useRequestForm<CustomerRequest>({
        formOptions: {
            defaultValues: {
                name: record?.name ?? "",
                short_name: record?.short_name ?? "",
                tin: record?.tin ?? "",
                tax_no: record?.tax_no ?? "",
                registration_no: record?.registration_no ?? "",
                einv_id_type: record?.einv_id_type ?? null,
                currency_id: record?.currency_id ?? null,
                payment_terms_id: record?.payment_terms_id ?? null,
                credit_status_id: record?.credit_status_id ?? null,
                credit_limit: Number(record?.credit_limit ?? 0),
                default_discount: Number(record?.default_discount ?? 0),
                payment_discount: Number(record?.payment_discount ?? 0),
                notes: record?.notes ?? "",
                status: record?.status ?? "active",
                // at least one address and one contact are required; a new record starts with an empty one of each
                addresses: record ? addressesToForm(record.addresses) : [{...EMPTY_ADDRESS, is_primary: true}],
                contacts: record ? contactsToForm(record.contacts) : [{...EMPTY_CONTACT}],
                branch: record ? undefined : {...EMPTY_BRANCH_DEFAULTS},
            },
        },
    });

    const submit = (values: CustomerRequest) => onSubmit({
        ...values,
        name: values.name.trim(),
        short_name: blankToNull(values.short_name),
        tin: blankToNull(values.tin),
        tax_no: blankToNull(values.tax_no),
        registration_no: blankToNull(values.registration_no),
        notes: blankToNull(values.notes),
        addresses: addressesToPayload(values.addresses),
        contacts: contactsToPayload(values.contacts),
        // the first branch is created with the customer; later branches have their own form
        branch: record ? undefined : values.branch,
    });

    const percent = {min: {value: 0, message: t('valueMustNotBeNegative')}, max: {value: 100, message: t('percentMax100')}};

    return (
        <SettingsFormPage
            onSubmit={handleSubmitRequest({request: submit, onSuccess})}
            submitting={submitting}
            isEditing={!!record}
            backTo={CUSTOMERS_PATH}
            onDelete={onDelete}
        >
            {record && <AccountSummary customer={record} />}

            <FormSectionTitle title={t('general')} />
            <Row className="gx-3">
                <Col md={6}>
                    <TextField control={control} name="name" label={t('customerName')} required maxLength={255} />
                </Col>
                <Col md={3}>
                    <TextField control={control} name="short_name" label={t('shortName')} maxLength={60} />
                </Col>
                <Col md={3}>
                    <StatusField control={control} name="status" />
                </Col>
            </Row>

            <TaxIdentityFields control={control} setValue={setValue} />

            <FormSectionTitle title={t('creditAndTerms')} />
            <Row className="gx-3">
                <Col md={6}>
                    <SelectField control={control} name="currency_id" label={t('currency')} options={currencyOptions} numeric required placeholder="" />
                </Col>
                <Col md={6}>
                    <SelectField control={control} name="payment_terms_id" label={t('paymentTerms')} options={termOptions} numeric required placeholder="" />
                </Col>
                <Col md={6}>
                    <SelectField control={control} name="credit_status_id" label={t('creditStatus')} options={creditOptions} numeric required placeholder="" hint={t('creditStatusHint')} />
                </Col>
                <Col md={6}>
                    <TextField control={control} name="credit_limit" label={t('creditLimit')} type="number" numeric min={0} step="0.01"
                        rules={{min: {value: 0, message: t('valueMustNotBeNegative')}}} hint={t('creditLimitHint')} />
                </Col>
                <Col md={6}>
                    <TextField control={control} name="default_discount" label={t('defaultDiscountPercent')} type="number" numeric min={0} max={100} step="0.01"
                        rules={percent} hint={t('defaultDiscountHint')} />
                </Col>
                <Col md={6}>
                    <TextField control={control} name="payment_discount" label={t('promptPaymentDiscountPercent')} type="number" numeric min={0} max={100} step="0.01"
                        rules={percent} hint={t('promptPaymentDiscountHint')} />
                </Col>
            </Row>

            {!record && <BranchDefaultsFields control={control} prefix="branch." />}

            <hr className="my-3" />
            <AddressRows control={control} watch={watch} setValue={setValue} required />

            <hr className="my-3" />
            <ContactRows control={control} usedCategoryIds={(record?.contacts ?? []).map(c => c.category_id)} entityType="customer" required />

            <hr className="my-3" />
            <TextAreaField control={control} name="notes" label={t('notes')} rows={3} />

            {record && <BranchesPanel customer={record} />}
        </SettingsFormPage>
    );
}
