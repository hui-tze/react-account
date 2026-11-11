import {useEffect, useRef, useState} from "react";
import {Alert, Button, Col, Form, Row, Spinner} from "react-bootstrap";
import {CheckCircle, Zap} from "react-feather";
import {Link} from "@/components/Access/Guarded";
import {Control, Controller, FieldValues, Path} from "react-hook-form";
import type {EinvoiceSetting} from "@/apis/models/einvoice";
import {einvoiceSettingApi} from "@/apis/requests/einvoice-api";
import {useRequestForm} from "@/hooks/use-request-handler";
import {useNotification} from "@/hooks/notification";
import {useSmartTranslation} from "@/hooks/use-translation";
import {SelectField, SwitchField, TextField} from "@/components/FormField/FormFields";
import SettingsFormPage, {FormSectionTitle} from "@/views/Settings/shared/SettingsFormPage";
import {ORGANIZATION_PROFILE_PATH} from "@/views/Settings/Organization/Profile";
import {EnvironmentBadge} from "@/views/Einvoice/shared/einvoice-ui";
import {CertificateCard} from "./CertificateCard";
import {EinvoiceFormValues, toFormValues, toPayload} from "./einvoice-form";

type Props = {
    setting: EinvoiceSetting,
    // re-fetches the settings; resolves with the fresh record
    onSaved: () => Promise<EinvoiceSetting | undefined>,
};

/** Plain input (password / time) bound through Controller, for types TextField doesn't cover. */
function InputField<T extends FieldValues>({control, name, label, type, hint, required, placeholder}: {
    control: Control<T>, name: Path<T>, label: string, type: "password" | "time", hint?: string, required?: boolean, placeholder?: string,
}) {
    const {t} = useSmartTranslation();
    return (
        <Controller
            control={control}
            name={name}
            rules={{required: required ? '*' + t('required') : undefined}}
            render={({field, fieldState}) => (
                <Form.Group className="mb-3">
                    <Form.Label className={required ? "require-label" : ""}>{label}</Form.Label>
                    <Form.Control
                        type={type}
                        name={field.name}
                        ref={field.ref}
                        value={field.value ?? ""}
                        onBlur={field.onBlur}
                        onChange={(e) => field.onChange(e.target.value)}
                        isInvalid={!!fieldState.error}
                        autoComplete={type === "password" ? "new-password" : undefined}
                        placeholder={placeholder}
                    />
                    <Form.Control.Feedback type="invalid">{fieldState.error?.message}</Form.Control.Feedback>
                    {hint && <Form.Text className="text-muted">{hint}</Form.Text>}
                </Form.Group>
            )}
        />
    );
}

export function EinvoiceSettingsForm({setting, onSaved}: Props) {
    const {t} = useSmartTranslation();
    const notify = useNotification();
    const {data: codes} = einvoiceSettingApi.useCodes();
    const [testing, setTesting] = useState(false);
    const [tested, setTested] = useState<string | null>(null);

    const {control, watch, setValue, reset, submitting, handleSubmitRequest, formState} = useRequestForm<EinvoiceFormValues>({
        formOptions: {defaultValues: toFormValues(setting)},
    });

    const enabled = watch("is_einvoice_enabled");
    const environment = watch("environment");
    const intermediary = watch("is_intermediary");
    const msicCode = watch("msic_code");

    // picking an MSIC code sets the business activity to its description ("01111 - Growing of maize" → "Growing of maize");
    // the field isn't shown — it is saved with the settings and sent to MyInvois
    const lastMsic = useRef(setting.msic_code);
    useEffect(() => {
        if (msicCode === lastMsic.current) {
            return;
        }
        lastMsic.current = msicCode;
        const label = codes?.msic.find(o => String(o.value) === String(msicCode))?.label ?? "";
        const description = label.includes(" - ") ? label.slice(label.indexOf(" - ") + 3) : label;
        setValue("business_activity_description", msicCode ? description : null, {shouldDirty: true});
    }, [msicCode, codes, setValue]);
    const switchingToProd = environment === "PROD" && setting.environment !== "PROD";

    const testConnection = async () => {
        setTesting(true);
        setTested(null);
        try {
            const result = await einvoiceSettingApi.testConnection();
            setTested(t('einvConnectionOk', {environment: t(`einvEnvironment_${result.environment}`), url: result.api_base_url}));
        } catch (err) {
            notify.error(err);
        } finally {
            setTesting(false);
        }
    };

    return (
        <SettingsFormPage
            onSubmit={handleSubmitRequest({
                request: (values) => einvoiceSettingApi.save(toPayload(values)),
                onSuccess: async () => {
                    const fresh = await onSaved();
                    if (fresh) {
                        reset(toFormValues(fresh));
                    }
                    setTested(null);
                },
            })}
            submitting={submitting}
            isEditing
        >
            <FormSectionTitle title={t('einvGeneral')} hint={t('einvoiceHint')} />
            <Row className="gx-3">
                <Col md={6}>
                    <TextField control={control} name="einvoice_start_date" type="date" label={t('einvoiceStartDate')} required={enabled}
                        hint={t('einvStartDateHint')} />
                </Col>
                <Col md={6}>
                    <SwitchField control={control} name="is_einvoice_enabled" label={t('enableEinvoice')} groupLabel={t('einvoice')} />
                </Col>
            </Row>

            <hr className="my-3" />
            <FormSectionTitle title={t('einvConnection')} hint={t('einvConnectionHint')} />
            <Row className="gx-3">
                <Col md={12}>
                    <SelectField
                        control={control}
                        name="environment"
                        label={t('einvEnvironment')}
                        required
                        options={[
                            {value: "SANDBOX", label: t('einvEnvironment_SANDBOX')},
                            {value: "PROD", label: t('einvEnvironment_PROD')},
                        ]}
                        hint={setting.endpoints[environment] ?? undefined}
                    />
                </Col>
                <Col md={6}>
                    <TextField control={control} name="client_id" label={t('einvClientId')} required={enabled} maxLength={255} />
                </Col>
                <Col md={6}>
                    <InputField
                        control={control}
                        name="client_secret"
                        type="password"
                        label={t('einvClientSecret')}
                        required={enabled && !setting.has_client_secret}
                        placeholder={setting.has_client_secret ? "••••••••" : undefined}
                        hint={setting.has_client_secret ? t('einvClientSecretKept') : t('einvClientSecretHint')}
                    />
                </Col>
            </Row>
            {switchingToProd && <Alert variant="warning" className="py-2 small">{t('einvProductionWarning')}</Alert>}
            <Row className="gx-3">
                <Col md={12}>
                    <SwitchField control={control} name="is_intermediary" label={t('einvIntermediary')} hint={t('einvIntermediaryHint')} />
                </Col>
                {intermediary && (
                    <Col md={4}>
                        <TextField control={control} name="on_behalf_of_tin" label={t('einvOnBehalfOfTin')} required maxLength={20} />
                    </Col>
                )}
                <Col md={8}>
                    <TextField control={control} name="api_base_url" label={t('einvApiBaseUrl')} hint={t('einvApiBaseUrlHint')} maxLength={255}
                        placeholder={setting.endpoints[environment]} />
                </Col>
            </Row>
            <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                <Button variant="outline-primary" type="button" onClick={testConnection} disabled={testing || formState.isDirty}>
                    {testing ? <Spinner animation="border" size="sm" className="me-1" /> : <Zap size={14} className="me-1" />}
                    {t('einvTestConnection')}
                </Button>
                <span className="small text-muted d-flex align-items-center gap-2">
                    {t('einvCurrentEnvironment')} <EnvironmentBadge environment={setting.environment} />
                </span>
                {formState.isDirty && <span className="small text-muted">{t('einvSaveBeforeTest')}</span>}
                {tested && <span className="small text-success d-flex align-items-center gap-1"><CheckCircle size={14} />{tested}</span>}
            </div>

            <hr className="my-3" />
            <FormSectionTitle title={t('einvTaxpayer')} hint={t('einvTaxpayerHint')} />
            <Row className="gx-3">
                <Col md={4}>
                    <Form.Group className="mb-3">
                        <Form.Label>{t('tin')}</Form.Label>
                        <Form.Control value={setting.company.tin ?? ""} disabled />
                        <Form.Text className="text-muted"><Link to={ORGANIZATION_PROFILE_PATH}>{t('einvEditInProfile')}</Link></Form.Text>
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <SelectField control={control} name="id_type" label={t('einvIdType')} required options={codes?.id_types ?? [
                        {value: "BRN", label: "BRN"}, {value: "NRIC", label: "NRIC"}, {value: "PASSPORT", label: "PASSPORT"}, {value: "ARMY", label: "ARMY"},
                    ]} />
                </Col>
                <Col md={4}>
                    <TextField control={control} name="id_value" label={t('einvIdValue')} required={enabled} maxLength={30} />
                </Col>
                <Col md={4}>
                    <Form.Group className="mb-3">
                        <Form.Label>{t('einvSstNo')}</Form.Label>
                        <Form.Control value={setting.company.tax_no ?? ""} disabled placeholder="NA" />
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <TextField control={control} name="ttx_reg_no" label={t('einvTtxNo')} maxLength={50} hint={t('einvTtxNoHint')} />
                </Col>
                <Col md={7}>
                    {/* business_activity_description follows the chosen code (set above), so it isn't shown */}
                    <SelectField control={control} name="msic_code" label={t('msicCode')} required={enabled} placeholder="" options={codes?.msic ?? []} />
                </Col>
                <Col md={5}>
                    <SelectField control={control} name="default_classification_code" label={t('einvDefaultClassification')} required
                        options={codes?.classifications ?? [{value: "022", label: "022 - Others"}]} hint={t('einvDefaultClassificationHint')} />
                </Col>
            </Row>

            <hr className="my-3" />
            <CertificateCard setting={setting} onChanged={onSaved} />

            <FormSectionTitle title={t('einvSubmission')} hint={t('einvSubmissionHint')} />
            <Row className="gx-3">
                <Col md={6}>
                    <InputField control={control} name="scheduled_time" type="time" label={t('einvScheduledTime')} required hint={t('einvScheduledTimeHint')} />
                </Col>
                <Col md={6}>
                    <SelectField control={control} name="self_billed_submission_mode" label={t('einvSelfBilledMode')} required options={[
                        {value: "IMMEDIATE", label: t('submissionMode_I')},
                        {value: "SCHEDULED", label: t('submissionMode_S')},
                        {value: "MANUAL", label: t('submissionMode_H')},
                    ]} />
                </Col>
                <Col md={12}>
                    <SwitchField control={control} name="cron_enabled" label={t('einvCronEnabled')} hint={t('einvCronEnabledHint')} />
                </Col>
            </Row>
        </SettingsFormPage>
    );
}
