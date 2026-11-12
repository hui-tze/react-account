import {ReactElement} from "react";
import {useParams} from "react-router-dom";
import {useAreaNavigate as useNavigate} from "@/utils/setup-area";
import type {SWRConfiguration, SWRResponse} from "swr";
import {ConditionalError} from "@/components/Display/ErrorBoundary";
import {useConfirmAction} from "@/hooks/use-confirmation-action";
import {useNotification} from "@/hooks/notification";
import {useSmartTranslation} from "@/hooks/use-translation";

export type RecordFormProps<T, R> = {
    record?: T,
    onSubmit: (formData: R) => Promise<void>,
    onSuccess?: () => Promise<void>,
    onDelete?: () => void,
};

export type SettingsEditPageProps<T extends {status?: string}, R> = {
    useGetOne: (id: string, config?: SWRConfiguration) => SWRResponse<T>,
    update: (id: string, data: R) => Promise<unknown>,
    remove?: (id: string) => Promise<void>,
    canDelete?: (record: T) => boolean,
    backTo: string,
    deleteText?: (record: T) => string,
    deletedMessage?: string,
    renderForm: (props: RecordFormProps<T, R> & {record: T}) => ReactElement,
};

/** Loads a record by the `:id` route param and renders its form with save + delete wired. */
export default function SettingsEditPage<T extends {status?: string}, R>({useGetOne, update, remove, canDelete, backTo, deleteText, deletedMessage, renderForm}: SettingsEditPageProps<T, R>) {
    const navigate = useNavigate();
    const {t} = useSmartTranslation();
    const {confirmAndExecute} = useConfirmAction();
    const notify = useNotification();
    const {id = ""} = useParams();
    const {data, mutate, error} = useGetOne(id, {revalidateOnFocus: false});

    if (error) {
        return <ConditionalError error={error} />;
    }

    if (!data) {
        return <div className="loader-pendulums mt-10" />;
    }

    const onDelete = remove && data.status !== "inactive" && (canDelete?.(data) ?? true) ? () => confirmAndExecute(async () => {
        try {
            await remove(id);
            notify.success(deletedMessage ?? t('recordDeactivated'));
            navigate(backTo);
        } catch (err) {
            notify.error(err);
        }
    }, {text: deleteText ? deleteText(data) : t('recordDeactivateText')}) : undefined;

    return renderForm({
        record: data,
        onSubmit: async (formData) => {
            await update(id, formData);
            await mutate();
        },
        onSuccess: async () => {
            navigate(backTo);
        },
        onDelete,
    });
}

export type SettingsCreatePageProps<R> = {
    create: (data: R) => Promise<unknown>,
    backTo: string,
    renderForm: (props: Omit<RecordFormProps<unknown, R>, "record" | "onDelete">) => ReactElement,
};

export function SettingsCreatePage<R>({create, backTo, renderForm}: SettingsCreatePageProps<R>) {
    const navigate = useNavigate();

    return renderForm({
        onSubmit: async (formData) => {
            await create(formData);
        },
        onSuccess: async () => {
            navigate(backTo);
        },
    });
}
