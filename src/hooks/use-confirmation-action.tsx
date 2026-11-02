// src/hooks/use-confirm-action.ts
import Swal from "sweetalert2";
import {useSmartTranslation} from "@/hooks/use-translation";

type ConfirmActionOptions = {
    title?: string;
    text?: string;
    confirmText?: string;
    cancelText?: string;
    icon?: "warning" | "question" | "error" | "info" | "success";
};

export function useConfirmAction() {
    const { t } = useSmartTranslation();

    const confirmAndExecute = async (
        action: () => Promise<void>,
        options?: ConfirmActionOptions
    ) => {
        const result = await Swal.fire({
            title: options?.title ?? t("are_you_sure") + "?",
            text: options?.text ?? "",
            icon: options?.icon ?? "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#b00020",
            confirmButtonText: options?.confirmText ?? t("yes"),
            cancelButtonText: options?.cancelText ?? t("cancel"),
        });

        if (!result.isConfirmed) return;

        await action();
    };

    return { confirmAndExecute };
}