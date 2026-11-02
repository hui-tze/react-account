import {deletePaymentTerm, updatePaymentTerm, useGetOnePaymentTerm} from "@/apis/requests/payment-term-api";
import SettingsEditPage from "@/views/Settings/shared/SettingsEditPage";
import {useSmartTranslation} from "@/hooks/use-translation";
import {PaymentTermForm} from "../PaymentTermForm";
import {PAYMENT_TERMS_PATH} from "../index";

export default function EditPaymentTerm() {
    const {t} = useSmartTranslation();

    return (
        <SettingsEditPage
            useGetOne={useGetOnePaymentTerm}
            update={updatePaymentTerm}
            remove={deletePaymentTerm}
            backTo={PAYMENT_TERMS_PATH}
            deleteText={(record) => t('recordDeactivateNamed', {name: record.name})}
            renderForm={(props) => <PaymentTermForm {...props} />}
        />
    );
}
