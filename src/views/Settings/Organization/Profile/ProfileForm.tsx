import {Col, Row} from "react-bootstrap";
import {useRequestForm} from "@/hooks/use-request-handler";
import {CompanyDetail} from "@/apis/models/company";
import {updateCompany} from "@/apis/requests/company-api";
import {Link} from "@/components/Access/Guarded";
import {TextField} from "@/components/FormField/FormFields";
import {EINVOICE_SETTINGS_PATH} from "@/views/Einvoice/einvoice-menu";
import SettingsFormPage, {FormSectionTitle} from "@/views/Settings/shared/SettingsFormPage";
import {useSmartTranslation} from "@/hooks/use-translation";
import {ProfileFormValues, toFormValues, toPayload} from "./profile-form";
import {AddressRows} from "./AddressRows";
import {ContactRows} from "./ContactRows";

export type ProfileFormProps = {
    company: CompanyDetail,
    // re-fetches the company; resolves with the fresh record
    onSaved: () => Promise<CompanyDetail | undefined>,
};

export function ProfileForm({company, onSaved}: ProfileFormProps) {
    const {t} = useSmartTranslation();

    const {control, watch, setValue, reset, submitting, handleSubmitRequest} = useRequestForm<ProfileFormValues>({
        formOptions: {
            defaultValues: toFormValues(company),
        },
    });

    return (
        <SettingsFormPage
            onSubmit={handleSubmitRequest({
                request: (values) => updateCompany(company.id, toPayload(values)),
                onSuccess: async () => {
                    // reload so newly added rows pick up their ids (next save updates, not re-creates)
                    const fresh = await onSaved();
                    if (fresh) {
                        reset(toFormValues(fresh));
                    }
                },
            })}
            submitting={submitting}
            isEditing
        >
            <FormSectionTitle title={t('companyDetails')} />
            <Row className="gx-3">
                <Col md={8}>
                    <TextField control={control} name="name" label={t('companyName')} required />
                </Col>
                <Col md={4}>
                    <TextField control={control} name="registration_no" label={t('registrationNo')} maxLength={100} />
                </Col>
                <Col md={6}>
                    <TextField control={control} name="tin" label={t('tin')} maxLength={50} />
                </Col>
                <Col md={6}>
                    <TextField control={control} name="tax_no" label={t('taxNo')} maxLength={100} />
                </Col>
            </Row>

            <hr className="my-3" />
            <FormSectionTitle title={t('einvoice')} hint={t('einvoiceHint')} />
            <p className="small mb-0">
                {t('einvProfileMoved')} <Link to={EINVOICE_SETTINGS_PATH}>{t('einvOpenSettings')}</Link>
            </p>

            <hr className="my-3" />
            <AddressRows control={control} watch={watch} setValue={setValue} />

            <hr className="my-3" />
            <ContactRows control={control} usedCategoryIds={company.contacts.map(c => c.category_id)} />
        </SettingsFormPage>
    );
}
