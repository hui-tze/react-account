import {useMemo} from "react";
import {Button, Col, Row} from "react-bootstrap";
import {Plus, Trash2} from "react-feather";
import {Control, useFieldArray, useFormState} from "react-hook-form";
import {useGetContactCategoryOptions} from "@/apis/requests/contact-category-api";
import {SelectField, TextAreaField, TextField} from "@/components/FormField/FormFields";
import {FormSectionTitle} from "@/views/Settings/shared/SettingsFormPage";
import {useSmartTranslation} from "@/hooks/use-translation";
import {CompanyContactRequest} from "@/apis/requests/company-api";
import {EMPTY_CONTACT} from "./profile-form";

// contact_persons.language is max 5 chars — store a short code
const LANGUAGE_OPTIONS = [
    {value: "en", label: "English"},
    {value: "ms", label: "Bahasa Melayu"},
    {value: "zh", label: "中文"},
    {value: "ta", label: "தமிழ்"},
];

// any form with a `contacts` array (company profile, customer)
type ContactForm = {contacts: CompanyContactRequest[]};

type ContactRowsProps<T extends ContactForm> = {
    control: Control<T>,
    // categories already used by saved contacts stay selectable even if inactive / another entity's
    usedCategoryIds: (number | null)[],
    // whose contacts these are — offers that entity's contact categories
    entityType?: string,
    // at least one contact person (customers, suppliers)
    required?: boolean,
};

export function ContactRows<T extends ContactForm>(props: ContactRowsProps<T>) {
    // react-hook-form can't resolve `contacts.${n}` paths on an open generic, so work on the slice type
    const {control, usedCategoryIds, entityType = "company", required} = props as unknown as ContactRowsProps<ContactForm>;
    const {t} = useSmartTranslation();
    // keyName avoids clobbering the contact link's own `id`, which must be sent back on save
    const {fields, append, remove} = useFieldArray({control, name: "contacts", keyName: "fieldKey",
        rules: required ? {minLength: {value: 1, message: t('contactRequired')}} : undefined});
    const {errors} = useFormState({control, name: "contacts"});
    const listError = (errors.contacts as {root?: {message?: string}} | undefined)?.root?.message;
    const {data: categories} = useGetContactCategoryOptions();

    const categoryOptions = useMemo(() => (categories ?? [])
        .filter(c => usedCategoryIds.includes(c.id) || (c.status === "active" && c.entity_type === entityType))
        .map(c => ({value: c.id, label: c.name})), [categories, usedCategoryIds, entityType]);

    return (
        <>
            <div className="d-flex align-items-start justify-content-between">
                <FormSectionTitle title={required ? `${t('contacts')} *` : t('contacts')} />
                <Button variant="outline-primary" size="sm" type="button" onClick={() => append({...EMPTY_CONTACT})}>
                    <Plus size={14} className="me-1" />{t('addContact')}
                </Button>
            </div>

            {listError && <p className="text-danger small mb-2">{listError}</p>}
            {fields.length === 0 && !listError && <p className="text-muted small">{required ? t('contactRequired') : t('noContacts')}</p>}

            {fields.map((field, index) => (
                <div key={field.fieldKey} className="border rounded p-3 mb-3">
                    <Row className="gx-3">
                        <Col md={4}>
                            <SelectField
                                control={control}
                                name={`contacts.${index}.category_id`}
                                label={t('contactCategory')}
                                numeric
                                placeholder=""
                                options={categoryOptions}
                                hint={t('contactCategoryHint')}
                            />
                        </Col>
                        <Col md={4}>
                            <TextField control={control} name={`contacts.${index}.first_name`} label={t('firstName')} required />
                        </Col>
                        <Col md={4}>
                            <TextField control={control} name={`contacts.${index}.last_name`} label={t('lastName')} />
                        </Col>
                        <Col md={4}>
                            <TextField control={control} name={`contacts.${index}.phone`} label={t('phone')} />
                        </Col>
                        <Col md={4}>
                            <TextField control={control} name={`contacts.${index}.phone2`} label={t('phone2')} />
                        </Col>
                        <Col md={4}>
                            <TextField control={control} name={`contacts.${index}.fax`} label={t('fax')} />
                        </Col>
                        <Col md={8}>
                            <TextField control={control} name={`contacts.${index}.email`} type="email" label={t('email')} />
                        </Col>
                        <Col md={4}>
                            <SelectField
                                control={control}
                                name={`contacts.${index}.language`}
                                label={t('language')}
                                placeholder=""
                                options={LANGUAGE_OPTIONS}
                            />
                        </Col>
                        <Col md={12}>
                            <TextAreaField control={control} name={`contacts.${index}.remark`} label={t('remark')} rows={2} />
                        </Col>
                        <Col md={12} className="text-end">
                            <Button variant="flush-danger" size="sm" type="button" disabled={required && fields.length <= 1} onClick={() => remove(index)}>
                                <Trash2 size={14} className="me-1" />{t('remove')}
                            </Button>
                        </Col>
                    </Row>
                </div>
            ))}
        </>
    );
}
