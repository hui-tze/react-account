import "react-toastify/dist/ReactToastify.css";
import {toast} from "react-toastify";

export function useNotification() {
    const commonConfig = {
        theme: 'light',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
    };

    const success = (msg = "Success") => {
        toast.success(msg, {
            ...commonConfig,
            toastId: "toast3",
            position: "bottom-right",
        });
    };

    const error = (e: unknown) => {
        if(typeof e == "string") {
            toast.error(e, {
                ...commonConfig,
                toastId: "toast3",
                position: "bottom-right",
                className: 'jq-toast-danger',
            });
            return;
        }

        if (typeof e === "object" && e instanceof Error) {
            toast.error(e.message, {
                ...commonConfig,
                toastId: "toast3",
                position: "bottom-right",
                className: 'jq-toast-danger',
            });
        }
        
        toast.warn('Something went wrong', {
            ...commonConfig,
            toastId: "toast3",
            position: "bottom-right",
            className: 'jq-toast-danger',
        });
    };
    return {
        success,
        error,
    };
}
