import {useNavigate, useParams} from "react-router-dom";
import {FiscalYearForm} from "../FiscalYearForm";
import {deleteFiscalYear, updateFiscalYear, useGetOneFiscalYear} from "@/apis/requests/fiscal-year-api";
import {ConditionalError} from "@/components/Display/ErrorBoundary";
import {useConfirmAction} from "@/hooks/use-confirmation-action";
import {useNotification} from "@/hooks/notification";
import {useSmartTranslation} from "@/hooks/use-translation";

export default function EditFiscalYear() {
    const navigate = useNavigate();
    const {t} = useSmartTranslation();
    const {confirmAndExecute} = useConfirmAction();
    const notify = useNotification();
    const {id = ""} = useParams();
    const {data, mutate, error} = useGetOneFiscalYear(id, {revalidateOnFocus: false});

    if (error) {
        return <ConditionalError error={error} />;
    }

    if (!data) {
        return <div className="loader-pendulums mt-10" />;
    }

    return (
        <FiscalYearForm
            fiscalYear={data}
            onSubmit={async (formData) => {
                await updateFiscalYear(id, formData);
                await mutate();
            }}
            onSuccess={async () => {
                navigate("/settings/gl/fiscal-years");
            }}
            onDelete={data.status === "active" ? () => confirmAndExecute(async () => {
                try {
                    await deleteFiscalYear(id);
                    notify.success(t('fiscalYearDeleted'));
                    navigate("/settings/gl/fiscal-years");
                } catch (err) {
                    notify.error(err);
                }
            }, {text: t('fiscalYearDeleteText', {begin: data.begin, end: data.end})}) : undefined}
        />
    );
}
