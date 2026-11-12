import {useParams} from "react-router-dom";
import {useAreaNavigate as useNavigate} from "@/utils/setup-area";
import {ExchangeRateForm} from "../ExchangeRateForm";
import {deleteExchangeRate, updateExchangeRate, useGetOneExchangeRate} from "@/apis/requests/exchange-rate-api";
import {ConditionalError} from "@/components/Display/ErrorBoundary";
import {useConfirmAction} from "@/hooks/use-confirmation-action";
import {useNotification} from "@/hooks/notification";
import {useSmartTranslation} from "@/hooks/use-translation";

export default function EditExchangeRate() {
    const navigate = useNavigate();
    const {t} = useSmartTranslation();
    const {confirmAndExecute} = useConfirmAction();
    const notify = useNotification();
    const {id = ""} = useParams();
    const {data, mutate, error} = useGetOneExchangeRate(id, {revalidateOnFocus: false});

    if (error) {
        return <ConditionalError error={error} />;
    }

    if (!data) {
        return <div className="loader-pendulums mt-10" />;
    }

    return (
        <ExchangeRateForm
            exchangeRate={data}
            onSubmit={async (formData) => {
                await updateExchangeRate(id, formData);
                await mutate();
            }}
            onSuccess={async () => {
                navigate("/gl/setup/exchange-rates");
            }}
            onDelete={data.status === "active" ? () => confirmAndExecute(async () => {
                try {
                    await deleteExchangeRate(id);
                    notify.success(t('exchangeRateDeleted'));
                    navigate("/gl/setup/exchange-rates");
                } catch (err) {
                    notify.error(err);
                }
            }, {text: t('exchangeRateDeleteText', {code: data.currency?.code ?? "", date: data.rate_date})}) : undefined}
        />
    );
}
