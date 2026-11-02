import type {SWRConfiguration, SWRResponse} from "swr";
import {authApiRequest, authFetcher, authMultipartApiRequest, useConsoleSwr} from "@/lib/request-client/client";
import type {PaginationResponse} from "@/apis/pagination";
import type {
    EinvoiceCodes,
    EinvoiceDocument,
    EinvoiceDocumentDetail,
    EinvoiceEnvironment,
    EinvoiceIdType,
    EinvoiceOutstanding,
    EinvoiceReadiness,
    EinvoiceSetting,
    EinvoiceSourceStatus,
    EinvoiceSubmissionMode,
    EinvoiceTinStatus,
    EinvoiceTransType,
} from "@/apis/models/einvoice";

type Id = number | string;

export type EinvoiceSettingRequest = {
    is_einvoice_enabled: boolean,
    einvoice_start_date: string | null,
    environment: EinvoiceEnvironment,
    api_base_url: string | null,
    client_id: string | null,
    // blank keeps the stored secret
    client_secret: string | null,
    id_type: EinvoiceIdType,
    id_value: string | null,
    ttx_reg_no: string | null,
    msic_code: string | null,
    business_activity_description: string | null,
    default_classification_code: string,
    is_intermediary: boolean,
    on_behalf_of_tin: string | null,
    cron_enabled: boolean,
    scheduled_time: string,
    self_billed_submission_mode: EinvoiceSubmissionMode,
};

export const einvoiceSettingApi = {
    useGet(config?: SWRConfiguration): SWRResponse<EinvoiceSetting> {
        return useConsoleSwr("/einvoice/settings", authFetcher, config);
    },
    save: (data: EinvoiceSettingRequest): Promise<EinvoiceSetting> => authApiRequest("/einvoice/settings").add(data).put(),
    uploadCertificate(file: File, passphrase: string): Promise<EinvoiceSetting> {
        return authMultipartApiRequest("/einvoice/settings/certificate")
            .add("certificate", file, file.name)
            .add("passphrase", passphrase)
            .execute<EinvoiceSetting>()
            // the multipart helper rejects with "<status> <message>"; Laravel errors have no status field
            .catch((e) => { throw new Error(String(e).replace(/^undefined\s*/, "")); });
    },
    removeCertificate: (): Promise<EinvoiceSetting> => authApiRequest("/einvoice/settings/certificate").delete(),
    testConnection: (): Promise<{environment: EinvoiceEnvironment, api_base_url: string, expires_in: number}> =>
        authApiRequest("/einvoice/settings/test-connection").post(),
    // TIN + ID pair: last cached LHDN answer (no LHDN call)
    useTinStatus(tin: string | null, idType: EinvoiceIdType | null, idValue: string | null): SWRResponse<EinvoiceTinStatus> {
        const ok = tin && idType && idValue;
        return useConsoleSwr(ok ? `/einvoice/tin-status?${new URLSearchParams({tin, id_type: idType, id_value: idValue})}` : null, authFetcher,
            {revalidateOnFocus: false});
    },
    // asks LHDN unless a fresh answer is cached; force re-checks
    validateTin: (tin: string, idType: EinvoiceIdType, idValue: string, force = false): Promise<EinvoiceTinStatus> =>
        authApiRequest("/einvoice/validate-tin").add({tin, id_type: idType, id_value: idValue, force}).post(),
    // TIN registered to an ID (or a name)
    searchTin: (idType: EinvoiceIdType | null, idValue: string | null, name: string | null): Promise<{tin: string | null, status: EinvoiceTinStatus | null}> =>
        authApiRequest("/einvoice/search-tin").add({id_type: idType, id_value: idValue, name}).post(),
    // LHDN code lists rarely change — fetch once per session
    useCodes(): SWRResponse<EinvoiceCodes> {
        return useConsoleSwr("/einvoice/codes", authFetcher, {revalidateOnFocus: false, revalidateIfStale: false});
    },
};

export const einvoiceDocumentApi = {
    useReadiness(transType: EinvoiceTransType | null, partyId: Id | null | undefined, transId?: Id | null): SWRResponse<EinvoiceReadiness> {
        const params = new URLSearchParams({trans_type: transType ?? ""});
        if (partyId) params.set("party_id", String(partyId));
        if (transId) params.set("trans_id", String(transId));
        return useConsoleSwr(transType ? `/einvoice/readiness?${params}` : null, authFetcher);
    },
    // listing table — always sends `page`, so the backend paginates
    useGetAll(params: URLSearchParams): SWRResponse<PaginationResponse<EinvoiceDocument>> {
        return useConsoleSwr(`/einvoice/documents?${params}`, authFetcher);
    },
    useOutstanding(params: URLSearchParams): SWRResponse<PaginationResponse<EinvoiceOutstanding>> {
        return useConsoleSwr(`/einvoice/documents/outstanding?${params}`, authFetcher);
    },
    useGetOne(id: Id | null | undefined, config?: SWRConfiguration): SWRResponse<EinvoiceDocumentDetail> {
        return useConsoleSwr(id ? `/einvoice/documents/${id}` : null, authFetcher, config);
    },
    useForSource(transType: EinvoiceTransType | null, transId: Id | null | undefined, config?: SWRConfiguration): SWRResponse<EinvoiceSourceStatus> {
        return useConsoleSwr(transType && transId ? `/einvoice/source/${transType}/${transId}` : null, authFetcher, config);
    },
    submit: (documents: {trans_type: EinvoiceTransType, trans_id: number}[]): Promise<EinvoiceDocument[]> =>
        authApiRequest("/einvoice/documents/submit").add({documents}).post(),
    resubmit: (id: Id): Promise<EinvoiceDocument> => authApiRequest(`/einvoice/documents/${id}/resubmit`).post(),
    refresh: (id: Id): Promise<EinvoiceDocumentDetail> => authApiRequest(`/einvoice/documents/${id}/refresh`).post(),
    cancel: (id: Id, reason: string): Promise<EinvoiceDocumentDetail> =>
        authApiRequest(`/einvoice/documents/${id}/cancel`).add({reason}).post(),
    payload: (id: Id): Promise<{payload: unknown, doc_hash?: string, is_signed?: boolean, doc_version?: string}> =>
        authApiRequest(`/einvoice/documents/${id}/payload`).get(),
};
