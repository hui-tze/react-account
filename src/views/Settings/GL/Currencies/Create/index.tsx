import {useAreaNavigate as useNavigate} from "@/utils/setup-area";
import {CurrencyForm} from "../CurrencyForm";
import {addCurrency} from "@/apis/requests/currency-api";

export default function CreateCurrency() {
    const navigate = useNavigate();

    return (
        <CurrencyForm
            onSubmit={async (formData) => {
                await addCurrency(formData);
            }}
            onSuccess={async () => {
                navigate("/gl/setup/currencies");
            }}
        />
    );
}
