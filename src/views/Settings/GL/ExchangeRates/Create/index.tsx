import {useAreaNavigate as useNavigate} from "@/utils/setup-area";
import {ExchangeRateForm} from "../ExchangeRateForm";
import {addExchangeRate} from "@/apis/requests/exchange-rate-api";

export default function CreateExchangeRate() {
    const navigate = useNavigate();

    return (
        <ExchangeRateForm
            onSubmit={async (formData) => {
                await addExchangeRate(formData);
            }}
            onSuccess={async () => {
                navigate("/gl/setup/exchange-rates");
            }}
        />
    );
}
