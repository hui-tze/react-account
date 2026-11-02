import {addPaymentTerm} from "@/apis/requests/payment-term-api";
import {SettingsCreatePage} from "@/views/Settings/shared/SettingsEditPage";
import {PaymentTermForm} from "../PaymentTermForm";
import {PAYMENT_TERMS_PATH} from "../index";

export default function CreatePaymentTerm() {
    return <SettingsCreatePage create={addPaymentTerm} backTo={PAYMENT_TERMS_PATH} renderForm={(props) => <PaymentTermForm {...props} />} />;
}
