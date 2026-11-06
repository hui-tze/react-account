import {useState} from "react";
import {Button, Form, Spinner} from "react-bootstrap";
import {CheckCircle, HelpCircle, Search, XCircle} from "react-feather";
import {Control, FieldValues, Path, PathValue, UseFormSetValue, useWatch} from "react-hook-form";
import type {EinvoiceIdType} from "@/apis/models/einvoice";
import {einvoiceSettingApi} from "@/apis/requests/einvoice-api";
import {useNotification} from "@/hooks/notification";
import {useSmartTranslation} from "@/hooks/use-translation";
import {formatDateTime} from "./einvoice-ui";

// the customer / supplier form fields this works on
export type TinFields = {name: string, tin: string | null, registration_no: string | null, einv_id_type?: EinvoiceIdType | null};

/**
 * LHDN check beside the TIN of a customer / supplier: search the TIN registered to the
 * registration / ID number (or name), and validate the TIN + ID pair. Hidden when e-invoice is off.
 */
export function TinLookup<T extends FieldValues & TinFields>({control, setValue}: {control: Control<T>, setValue: UseFormSetValue<T>}) {
    const {t} = useSmartTranslation();
    const notify = useNotification();
    const {data: setting} = einvoiceSettingApi.useGet({revalidateOnFocus: false});
    const [name, tin, idValue, idTypeField] = useWatch({control, name: ["name", "tin", "registration_no", "einv_id_type"] as Path<T>[]}) as unknown as
        [string, string | null, string | null, EinvoiceIdType | null];
    const idType: EinvoiceIdType = idTypeField ?? "BRN";
    const cleanTin = (tin ?? "").trim() || null;
    const cleanId = (idValue ?? "").trim() || null;
    const {data: status, mutate} = einvoiceSettingApi.useTinStatus(cleanTin, idType, cleanId);
    const [busy, setBusy] = useState<"search" | "validate" | null>(null);

    if (!setting?.is_einvoice_enabled) {
        return null;
    }

    const search = async () => {
        setBusy("search");
        try {
            const result = await einvoiceSettingApi.searchTin(cleanId ? idType : null, cleanId, cleanId ? null : (name || null));
            if (result.tin) {
                setValue("tin" as Path<T>, result.tin as PathValue<T, Path<T>>, {shouldDirty: true});
                notify.success(t('einvTinFound', {tin: result.tin}));
            } else {
                notify.error(t('einvTinNotFound'));
            }
        } catch (err) {
            notify.error(err);
        } finally {
            setBusy(null);
        }
    };

    const validate = async () => {
        if (!cleanTin || !cleanId) {
            return;
        }
        setBusy("validate");
        try {
            const result = await einvoiceSettingApi.validateTin(cleanTin, idType, cleanId, true);
            await mutate(result, {revalidate: false});
            if (result.status === "valid") {
                notify.success(t('einvTinValid'));
            } else {
                notify.error(t('einvTinInvalid', {tin: cleanTin, type: idType, id: cleanId}));
            }
        } catch (err) {
            notify.error(err);
        } finally {
            setBusy(null);
        }
    };

    // status in words, coloured by outcome
    const state = !cleanTin || !cleanId
        ? {tone: "muted", icon: <HelpCircle size={15} />, text: cleanId ? t('einvTinEnterTin') : t('einvTinNeedsId')}
        : status?.status === "valid"
            ? {tone: "success", icon: <CheckCircle size={15} />, text: t('einvTinVerified', {at: formatDateTime(status.validated_at)})}
            : status?.status === "invalid"
                ? {tone: "danger", icon: <XCircle size={15} />, text: t('einvTinMismatch', {at: formatDateTime(status.validated_at)})}
                : {tone: "muted", icon: <HelpCircle size={15} />, text: t('einvTinUnchecked')};

    return (
        <Form.Group className="mb-3">
            <Form.Label>{t('einvLhdnCheck')}</Form.Label>
            <div className={`tin-lookup tin-lookup-${state.tone}`}>
                <span className="tin-lookup-status">
                    {state.icon}
                    <span>{state.text}</span>
                </span>
                <span className="tin-lookup-actions">
                    <Button variant="outline-secondary" size="sm" type="button" disabled={!!busy || (!cleanId && !name)} onClick={search}
                        title={t('einvTinSearchHint')}>
                        {busy === "search" ? <Spinner animation="border" size="sm" className="me-1" /> : <Search size={14} className="me-1" />}
                        {t('einvTinSearch')}
                    </Button>
                    <Button variant="primary" size="sm" type="button" disabled={!!busy || !cleanTin || !cleanId} onClick={validate}
                        title={t('einvTinValidateHint')}>
                        {busy === "validate" ? <Spinner animation="border" size="sm" className="me-1" /> : <CheckCircle size={14} className="me-1" />}
                        {t('einvTinValidate')}
                    </Button>
                </span>
            </div>
            <Form.Text className="text-muted">{t('einvTinLookupHint')}</Form.Text>
        </Form.Group>
    );
}
