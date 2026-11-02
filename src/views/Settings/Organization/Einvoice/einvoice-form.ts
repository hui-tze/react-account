import type {EinvoiceSetting} from "@/apis/models/einvoice";
import type {EinvoiceSettingRequest} from "@/apis/requests/einvoice-api";
import {blankToNull} from "@/views/Settings/Organization/Profile/profile-form";

export type EinvoiceFormValues = EinvoiceSettingRequest;

export function toFormValues(setting: EinvoiceSetting): EinvoiceFormValues {
    return {
        is_einvoice_enabled: setting.is_einvoice_enabled,
        einvoice_start_date: setting.einvoice_start_date,
        environment: setting.environment,
        api_base_url: setting.api_base_url,
        client_id: setting.client_id,
        client_secret: null,
        id_type: setting.id_type,
        id_value: setting.id_value ?? setting.company.registration_no,
        ttx_reg_no: setting.ttx_reg_no,
        msic_code: setting.msic_code,
        business_activity_description: setting.business_activity_description,
        default_classification_code: setting.default_classification_code,
        is_intermediary: setting.is_intermediary,
        on_behalf_of_tin: setting.on_behalf_of_tin,
        cron_enabled: setting.cron_enabled,
        scheduled_time: setting.scheduled_time,
        self_billed_submission_mode: setting.self_billed_submission_mode,
    };
}

/** PUT /einvoice/settings body; a blank secret keeps the stored one. */
export function toPayload(values: EinvoiceFormValues): EinvoiceSettingRequest {
    return {
        ...values,
        is_einvoice_enabled: !!values.is_einvoice_enabled,
        einvoice_start_date: blankToNull(values.einvoice_start_date),
        api_base_url: blankToNull(values.api_base_url),
        client_id: blankToNull(values.client_id),
        client_secret: blankToNull(values.client_secret),
        id_value: blankToNull(values.id_value),
        ttx_reg_no: blankToNull(values.ttx_reg_no),
        msic_code: blankToNull(values.msic_code),
        business_activity_description: blankToNull(values.business_activity_description),
        is_intermediary: !!values.is_intermediary,
        on_behalf_of_tin: values.is_intermediary ? blankToNull(values.on_behalf_of_tin) : null,
        cron_enabled: !!values.cron_enabled,
    };
}
