import {useParams} from "react-router-dom";
import {useAreaNavigate as useNavigate} from "@/utils/setup-area";
import {CurrencyForm} from "../CurrencyForm";
import {deleteCurrency, updateCurrency, useGetOneCurrency} from "@/apis/requests/currency-api";
import {ConditionalError} from "@/components/Display/ErrorBoundary";
import {useConfirmAction} from "@/hooks/use-confirmation-action";
import {useNotification} from "@/hooks/notification";
import {useSmartTranslation} from "@/hooks/use-translation";

export default function EditCurrency() {
    const navigate = useNavigate();
    const {t} = useSmartTranslation();
    const {confirmAndExecute} = useConfirmAction();
    const notify = useNotification();
    const {id = ""} = useParams();
    const {data, mutate, error} = useGetOneCurrency(id, {revalidateOnFocus: false});

    if (error) {
        return <ConditionalError error={error} />;
    }

    if (!data) {
        return <div className="loader-pendulums mt-10" />;
    }

    return (
        <CurrencyForm
            currency={data}
            onSubmit={async (formData) => {
                await updateCurrency(id, formData);
                await mutate();
            }}
            onSuccess={async () => {
                navigate("/gl/setup/currencies");
            }}
            onDelete={data.status === "active" ? () => confirmAndExecute(async () => {
                try {
                    await deleteCurrency(id);
                    notify.success(t('currencyDeleted'));
                    navigate("/gl/setup/currencies");
                } catch (err) {
                    notify.error(err);
                }
            }, {text: t('currencyDeleteText', {code: data.code})}) : undefined}
        />
    );
}
