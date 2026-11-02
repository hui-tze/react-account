import {PaymentTerm, PAYMENT_TERM_TYPES} from "@/apis/models/payment-term";
import {deletePaymentTerm, useGetAllPaymentTerm} from "@/apis/requests/payment-term-api";
import {SelectOption} from "@/components/FormField/FormFields";
import SettingsListPage from "@/views/Settings/shared/SettingsListPage";
import {StatusBadge} from "@/views/Settings/shared/StatusBadge";
import {useSmartTranslation} from "@/hooks/use-translation";

export const PAYMENT_TERMS_PATH = "/settings/sales/payment-terms";

const PAYMENT_TERM_TYPE_LABEL_KEYS: Record<string, string> = {
    day: "paymentTermTypeDay",
    month_end: "paymentTermTypeMonthEnd",
    following_month: "paymentTermTypeFollowingMonth",
};

type Translate = (key: string, options?: Record<string, unknown>) => string;

export function paymentTermTypeLabel(t: Translate, type: string): string {
    const key = PAYMENT_TERM_TYPE_LABEL_KEYS[type];
    return key ? t(key) : type;
}

/** Human-readable due rule, e.g. "Due 30 days after invoice date". */
export function describePaymentTerm(t: Translate, term: Pick<PaymentTerm, "type" | "days_before_due" | "day_in_following_month">): string {
    switch (term.type) {
        case "day":
            return t('paymentTermDescDay', {days: term.days_before_due ?? 0});
        case "month_end":
            return t('paymentTermDescMonthEnd');
        case "following_month":
            return t('paymentTermDescFollowingMonth', {day: term.day_in_following_month ?? 0});
        default:
            return "-";
    }
}

export function usePaymentTermTypeOptions(): SelectOption[] {
    const {t} = useSmartTranslation();
    return PAYMENT_TERM_TYPES.map(value => ({value, label: paymentTermTypeLabel(t, value)}));
}

export default function PaymentTerms() {
    const {t} = useSmartTranslation();

    return (
        <SettingsListPage<PaymentTerm>
            useFetcher={useGetAllPaymentTerm}
            editPath={(row) => `${PAYMENT_TERMS_PATH}/${row.id}`}
            onDelete={(row) => deletePaymentTerm(row.id)}
            deleteText={(row) => t('recordDeactivateNamed', {name: row.name})}
            columns={[
                {
                    accessor: "name",
                    title: t('name'),
                    render: (row) => <span className="fw-semibold text-dark">{row.name}</span>,
                },
                {
                    accessor: "type",
                    title: t('paymentTermType'),
                    render: (row) => paymentTermTypeLabel(t, row.type),
                },
                {
                    accessor: undefined,
                    title: t('paymentTermDueRule'),
                    render: (row) => describePaymentTerm(t, row),
                },
                {
                    accessor: "status",
                    title: t('status'),
                    render: (row) => <StatusBadge status={row.status} />,
                },
            ]}
        />
    );
}
