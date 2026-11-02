import {useMemo} from "react";
import {mutate} from "swr";
import {useConfirmAction} from "@/hooks/use-confirmation-action";
import {useNotification} from "@/hooks/notification";
import {useGetSupplierOptions} from "@/apis/requests/supplier-api";
import {useSmartTranslation} from "@/hooks/use-translation";

export const Loading = () => <div className="loader-pendulums mt-10" />;

// lists other documents read: what is still to receive / bill / pay / apply
const DEPENDENT_LISTS = ["/goods-receipt/open-items", "/supplier-allocation/", "/purchase-order?state=open"];

/** Drops the cached open-goods / open-bills / open-orders lists after a purchase document changes. */
export function refreshPurchaseLists(): Promise<unknown> {
    return mutate((key) => typeof key === "string" && DEPENDENT_LISTS.some(part => key.includes(part)), undefined, {revalidate: true});
}

/** Confirm, run a document action, report it and refresh the record. */
export function useDocumentAction(refresh: () => Promise<unknown>) {
    const {confirmAndExecute} = useConfirmAction();
    const notify = useNotification();

    return (action: () => Promise<unknown>, text: string, done: string) => confirmAndExecute(async () => {
        try {
            await action();
            notify.success(done);
            await refreshPurchaseLists();
            await refresh();
        } catch (err) {
            notify.error(err);
        }
    }, {text});
}

/** The supplier dropdown of a purchase listing. */
export function useSupplierFilter() {
    const {t} = useSmartTranslation();
    const {data: suppliers} = useGetSupplierOptions();

    return useMemo(() => ({
        param: "supplier_id",
        placeholder: t('allSuppliers'),
        options: (suppliers ?? []).map(s => ({value: s.id, label: s.name})),
    }), [suppliers, t]);
}
