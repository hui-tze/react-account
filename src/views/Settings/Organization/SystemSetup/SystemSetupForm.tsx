import {useMemo} from "react";
import {Col, Row} from "react-bootstrap";
import {useRequestForm} from "@/hooks/use-request-handler";
import {SystemSetupSettings} from "@/apis/models/system-setting";
import {saveSystemSettings} from "@/apis/requests/system-setting-api";
import {useGetFiscalYearOptions} from "@/apis/requests/fiscal-year-api";
import {SelectField, SwitchField} from "@/components/FormField/FormFields";
import SettingsFormPage, {FormSectionTitle} from "@/views/Settings/shared/SettingsFormPage";
import {useAccountOptions} from "@/views/Settings/shared/options";
import {useSmartTranslation} from "@/hooks/use-translation";

type IdKey = Exclude<keyof SystemSetupSettings, "refno_setting" | "allow_negative_inventory">;

const ID_KEYS: IdKey[] = [
    "active_fiscal_year_id",
    "default_sales_account_id",
    "default_purchase_account_id",
    "default_inventory_account_id",
    "default_sales_discount_account_id",
    "default_purchase_discount_account_id",
    "default_prompt_payment_discount_account_id",
    "default_bank_charges_account_id",
    "default_receivable_account_id",
    "default_cogs_account_id",
    "default_payable_account_id",
    "grn_clearing_account_id",
];

const ACCOUNT_FIELDS: {name: IdKey, labelKey: string}[] = [
    {name: "default_sales_account_id", labelKey: "defaultSalesAccount"},
    {name: "default_purchase_account_id", labelKey: "defaultPurchaseAccount"},
    {name: "default_inventory_account_id", labelKey: "defaultInventoryAccount"},
    {name: "default_sales_discount_account_id", labelKey: "defaultSalesDiscountAccount"},
    {name: "default_purchase_discount_account_id", labelKey: "defaultPurchaseDiscountAccount"},
    {name: "default_prompt_payment_discount_account_id", labelKey: "defaultPromptPaymentDiscountAccount"},
    {name: "default_bank_charges_account_id", labelKey: "defaultBankChargesAccount"},
    {name: "default_receivable_account_id", labelKey: "defaultReceivableAccount"},
    {name: "default_cogs_account_id", labelKey: "defaultCogsAccount"},
    {name: "default_payable_account_id", labelKey: "defaultPayableAccount"},
    {name: "grn_clearing_account_id", labelKey: "grnClearingAccount"},
];

/** Ids go to the backend as numbers or null (an unset id may come back as 0/""). */
function normalize(settings: SystemSetupSettings): SystemSetupSettings {
    const result = {...settings, refno_setting: settings.refno_setting || "auto", allow_negative_inventory: !!settings.allow_negative_inventory};
    ID_KEYS.forEach(key => {
        const value = Number(settings[key]);
        result[key] = Number.isFinite(value) && value > 0 ? value : null;
    });
    return result;
}

type SystemSetupFormProps = {
    settings: SystemSetupSettings,
    onSaved: () => Promise<SystemSetupSettings | undefined>,
};

export function SystemSetupForm({settings, onSaved}: SystemSetupFormProps) {
    const {t} = useSmartTranslation();
    const {options: accountOptions, isLoading: accountsLoading} = useAccountOptions();
    const {data: fiscalYears} = useGetFiscalYearOptions();

    const {control, reset, submitting, handleSubmitRequest} = useRequestForm<SystemSetupSettings>({
        formOptions: {defaultValues: normalize(settings)},
    });

    const fiscalYearOptions = useMemo(() => [...(fiscalYears ?? [])]
        .sort((a, b) => b.begin.localeCompare(a.begin))
        .map(fy => ({
            value: fy.id,
            label: `${fy.begin.slice(0, 10)} – ${fy.end.slice(0, 10)}${fy.is_closed ? ` (${t('closed')})` : ""}`,
        })), [fiscalYears, t]);

    const refnoOptions = [
        {value: "auto", label: t('refnoAuto')},
        {value: "manual", label: t('refnoManual')},
    ];

    return (
        <SettingsFormPage
            onSubmit={handleSubmitRequest({
                request: (formData) => saveSystemSettings("system_setup", normalize(formData)),
                onSuccess: async () => {
                    const fresh = await onSaved();
                    if (fresh) {
                        reset(normalize(fresh));
                    }
                },
            })}
            submitting={submitting}
            isEditing
        >
            <FormSectionTitle title={t('general')} />
            <Row className="gx-3">
                <Col md={5}>
                    <SelectField
                        control={control}
                        name="active_fiscal_year_id"
                        label={t('activeFiscalYear')}
                        numeric
                        placeholder=""
                        options={fiscalYearOptions}
                    />
                </Col>
                <Col md={7}>
                    <SelectField
                        control={control}
                        name="refno_setting"
                        label={t('refnoSetting')}
                        required
                        options={refnoOptions}
                        hint={t('refnoSettingHint')}
                    />
                </Col>
                <Col md={12}>
                    <SwitchField
                        control={control}
                        name="allow_negative_inventory"
                        label={t('allowNegativeInventory')}
                        hint={t('allowNegativeInventoryHint')}
                    />
                </Col>
            </Row>

            <hr className="my-3" />
            <FormSectionTitle title={t('defaultAccounts')} hint={t('defaultAccountsHint')} />
            <Row className="gx-3">
                {ACCOUNT_FIELDS.map(field => (
                    <Col md={6} key={field.name}>
                        <SelectField
                            control={control}
                            name={field.name}
                            label={t(field.labelKey)}
                            numeric
                            placeholder=""
                            disabled={accountsLoading}
                            options={accountOptions}
                        />
                    </Col>
                ))}
            </Row>
        </SettingsFormPage>
    );
}
