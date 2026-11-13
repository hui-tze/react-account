import {Col, Row} from "react-bootstrap";
import {useRequestForm} from "@/hooks/use-request-handler";
import {BankAccount} from "@/apis/models/bank-account";
import {BankAccountRequest} from "@/apis/requests/bank-account-api";
import {useGetCurrencyOptions} from "@/apis/requests/currency-api";
import {SelectField, StatusField, SwitchField, TextField} from "@/components/FormField/FormFields";
import SettingsFormPage, {FormSectionTitle} from "@/views/Settings/shared/SettingsFormPage";
import {RecordFormProps} from "@/views/Settings/shared/SettingsEditPage";
import {useAccountOptions} from "@/views/Settings/shared/options";
import {useSetupDefaults} from "@/hooks/use-setup-defaults";
import {useSmartTranslation} from "@/hooks/use-translation";
import {BANK_ACCOUNT_TYPE_LABEL_KEYS, BANK_ACCOUNTS_PATH} from "./index";

export function BankAccountForm({record, onSubmit, onSuccess, onDelete}: RecordFormProps<BankAccount, BankAccountRequest>) {
    const {t} = useSmartTranslation();
    const {options: accountOptions} = useAccountOptions();
    const {data: currencies} = useGetCurrencyOptions();

    const currencyOptions = (currencies ?? []).map(c => ({value: c.id, label: `${c.code} - ${c.name}`}));
    const typeOptions = Object.entries(BANK_ACCOUNT_TYPE_LABEL_KEYS).map(([value, key]) => ({value, label: t(key)}));

    const {control, getValues, setValue, submitting, handleSubmitRequest} = useRequestForm<BankAccountRequest>({
        formOptions: {
            defaultValues: {
                account_name: record?.account_name ?? "",
                account_number: record?.account_number ?? "",
                type: record?.type,
                currency_id: record?.currency_id,
                account_id: record?.account_id,
                charge_account_id: record?.charge_account_id,
                is_default: record?.is_default ?? false,
                // decimal:2 cast arrives as a string — send it back as a number
                ending_reconcile_balance: record ? Number(record.ending_reconcile_balance) : 0,
                status: record?.status ?? "active",
            },
        },
    });

    // bank charges post to System Setup's default unless this bank needs its own
    useSetupDefaults(getValues, setValue, {charge_account_id: "default_bank_charges_account_id"});

    return (
        <SettingsFormPage
            onSubmit={handleSubmitRequest({request: onSubmit, onSuccess})}
            submitting={submitting}
            isEditing={!!record}
            backTo={BANK_ACCOUNTS_PATH}
            onDelete={onDelete}
        >
            <FormSectionTitle title={t('general')} />
            <Row className="gx-3">
                <Col md={6}>
                    <TextField control={control} name="account_name" label={t('bankAccountName')} maxLength={255} />
                </Col>
                <Col md={6}>
                    <TextField control={control} name="account_number" label={t('bankAccountNumber')} maxLength={255} />
                </Col>
                <Col md={4}>
                    <SelectField control={control} name="type" label={t('bankAccountType')} options={typeOptions} required placeholder="" />
                </Col>
                <Col md={4}>
                    <SelectField control={control} name="currency_id" label={t('currency')} options={currencyOptions} numeric required placeholder="" />
                </Col>
                <Col md={4}>
                    <StatusField control={control} name="status" />
                </Col>
            </Row>

            <FormSectionTitle title={t('glAccounts')} />
            <Row className="gx-3">
                <Col md={6}>
                    <SelectField control={control} name="account_id" label={t('bankGlAccount')} options={accountOptions} numeric required placeholder="" />
                </Col>
                <Col md={6}>
                    <SelectField control={control} name="charge_account_id" label={t('bankChargesAccount')} options={accountOptions} numeric required placeholder="" />
                </Col>
            </Row>

            <FormSectionTitle title={t('options')} />
            <Row className="gx-3">
                <Col md={4}>
                    <TextField
                        control={control}
                        name="ending_reconcile_balance"
                        label={t('endingReconcileBalance')}
                        type="number"
                        numeric
                        required
                        step="0.01"
                    />
                </Col>
                <Col md={8} className="d-flex align-items-center">
                    <SwitchField control={control} name="is_default" label={t('defaultBankAccount')} />
                </Col>
            </Row>
        </SettingsFormPage>
    );
}
