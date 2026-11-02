import {useNavigate} from "react-router-dom";
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
                navigate("/settings/gl/fiscal-years");
            }}
        />
    );
}
