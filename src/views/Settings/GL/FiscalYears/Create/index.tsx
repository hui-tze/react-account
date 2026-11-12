import {useAreaNavigate as useNavigate} from "@/utils/setup-area";
import {FiscalYearForm} from "../FiscalYearForm";
import {addFiscalYear} from "@/apis/requests/fiscal-year-api";

export default function CreateFiscalYear() {
    const navigate = useNavigate();

    return (
        <FiscalYearForm
            onSubmit={async (formData) => {
                await addFiscalYear(formData);
            }}
            onSuccess={async () => {
                navigate("/gl/setup/fiscal-years");
            }}
        />
    );
}
