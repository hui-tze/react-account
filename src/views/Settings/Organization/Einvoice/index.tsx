import {ConditionalError} from "@/components/Display/ErrorBoundary";
import {einvoiceSettingApi} from "@/apis/requests/einvoice-api";
import {EinvoiceSettingsForm} from "./EinvoiceSettingsForm";

/** MyInvois (LHDN e-invoice) settings of the working company — a single record. */
export default function EinvoiceSettings() {
    const {data, error, mutate} = einvoiceSettingApi.useGet({revalidateOnFocus: false});

    if (error) {
        return <ConditionalError error={error} />;
    }
    if (!data) {
        return <div className="loader-pendulums mt-10" />;
    }

    // keyed on what the server last confirmed, so a save or certificate change remounts with fresh defaults
    return <EinvoiceSettingsForm key={`${data.environment}-${data.has_client_secret}-${data.certificate?.serial_no ?? ""}`} setting={data} onSaved={() => mutate()} />;
}
