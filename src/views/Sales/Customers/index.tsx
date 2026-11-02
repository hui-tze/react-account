import {useCallback, useMemo, useState} from "react";
import {Badge} from "react-bootstrap";
import {Customer} from "@/apis/models/customer";
import {deleteCustomer, useGetAllCustomer} from "@/apis/requests/customer-api";
import {useGetCurrencyOptions} from "@/apis/requests/currency-api";
import {useGetPaymentTermOptions} from "@/apis/requests/payment-term-api";
import {useGetCreditStatusOptions} from "@/apis/requests/credit-status-api";
import SettingsListPage from "@/views/Settings/shared/SettingsListPage";
import {StatusBadge} from "@/views/Settings/shared/StatusBadge";
import {useSmartTranslation} from "@/hooks/use-translation";
import {CUSTOMERS_PATH} from "../sales-menu";
import {SearchBox} from "../shared/SearchBox";

export default function Customers() {
    const {t} = useSmartTranslation();
    const [search, setSearch] = useState("");
    const {data: currencies} = useGetCurrencyOptions();
    const {data: terms} = useGetPaymentTermOptions();
    const {data: creditStatuses} = useGetCreditStatusOptions();

    const lookups = useMemo(() => ({
        currency: new Map((currencies ?? []).map(c => [c.id, c.code])),
        term: new Map((terms ?? []).map(p => [p.id, p.name])),
        credit: new Map((creditStatuses ?? []).map(s => [s.id, s])),
    }), [currencies, terms, creditStatuses]);

    // the table calls this as a hook with its paging params; the search rides along as `q`
    const useFetcher = useCallback((params: URLSearchParams) => {
        const query = new URLSearchParams(params);
        if (search) {
            query.set("q", search);
        }
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useGetAllCustomer(query);
    }, [search]);

    return (
        <SettingsListPage<Customer>
            useFetcher={useFetcher}
            editPath={(row) => `${CUSTOMERS_PATH}/${row.id}`}
            onDelete={(row) => deleteCustomer(row.id)}
            deleteText={(row) => t('recordDeactivateNamed', {name: row.name})}
            tableKey={`${currencies?.length ?? 0}|${terms?.length ?? 0}|${creditStatuses?.length ?? 0}`}
            toolbar={(
                <div className="d-flex justify-content-between align-items-center py-3">
                    <SearchBox value={search} onChange={setSearch} placeholder={t('searchCustomers')} />
                </div>
            )}
            columns={[
                {
                    accessor: "name",
                    title: t('customer'),
                    render: (row) => (
                        <div>
                            <div className="fw-semibold text-dark">{row.name}</div>
                            {row.short_name && <div className="text-muted small">{row.short_name}</div>}
                        </div>
                    ),
                },
                {accessor: "tin", title: t('tin'), render: (row) => row.tin ?? "-"},
                {accessor: "currency_id", title: t('currency'), render: (row) => lookups.currency.get(row.currency_id) ?? "-"},
                {accessor: "payment_terms_id", title: t('paymentTerms'), render: (row) => lookups.term.get(row.payment_terms_id) ?? "-"},
                {
                    accessor: "credit_status_id",
                    title: t('creditStatus'),
                    render: (row) => {
                        const status = lookups.credit.get(row.credit_status_id);
                        if (!status) {
                            return "-";
                        }
                        return (
                            <Badge bg="light" className={status.allow_invoice ? "badge-soft-success" : "badge-soft-danger"}>
                                {status.name}
                            </Badge>
                        );
                    },
                },
                {accessor: "branches_count", title: t('branches'), tdClasses: "text-end"},
                {accessor: "status", title: t('status'), render: (row) => <StatusBadge status={row.status} />},
            ]}
        />
    );
}
