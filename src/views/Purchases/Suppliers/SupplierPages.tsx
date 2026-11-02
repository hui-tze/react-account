import {useCallback, useMemo, useState} from "react";
import {Badge} from "react-bootstrap";
import {Supplier} from "@/apis/models/supplier";
import {addSupplier, deleteSupplier, updateSupplier, useGetAllSupplier, useGetOneSupplier} from "@/apis/requests/supplier-api";
import {useGetPaymentTermOptions} from "@/apis/requests/payment-term-api";
import SettingsListPage from "@/views/Settings/shared/SettingsListPage";
import SettingsEditPage, {SettingsCreatePage} from "@/views/Settings/shared/SettingsEditPage";
import {StatusBadge} from "@/views/Settings/shared/StatusBadge";
import {useSmartTranslation} from "@/hooks/use-translation";
import {SearchBox} from "@/views/Sales/shared/SearchBox";
import {SUPPLIERS_PATH} from "../purchases-menu";
import {SupplierForm} from "./SupplierForm";

export function Suppliers() {
    const {t} = useSmartTranslation();
    const [search, setSearch] = useState("");
    const {data: terms} = useGetPaymentTermOptions();
    const termName = useMemo(() => new Map((terms ?? []).map(p => [p.id, p.name])), [terms]);

    // the table calls this as a hook with its paging params; the search rides along as `q`
    const useFetcher = useCallback((params: URLSearchParams) => {
        const query = new URLSearchParams(params);
        if (search) {
            query.set("q", search);
        }
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useGetAllSupplier(query);
    }, [search]);

    return (
        <SettingsListPage<Supplier>
            useFetcher={useFetcher}
            editPath={(row) => `${SUPPLIERS_PATH}/${row.id}`}
            onDelete={(row) => deleteSupplier(row.id)}
            deleteText={(row) => t('recordDeactivateNamed', {name: row.name})}
            tableKey={`${terms?.length ?? 0}`}
            toolbar={(
                <div className="d-flex justify-content-between align-items-center py-3">
                    <SearchBox value={search} onChange={setSearch} placeholder={t('searchSuppliers')} />
                </div>
            )}
            columns={[
                {
                    accessor: "name",
                    title: t('supplier'),
                    render: (row) => (
                        <div>
                            <div className="fw-semibold text-dark">{row.name}</div>
                            {(row.code || row.short_name) && <div className="text-muted small">{[row.code, row.short_name].filter(Boolean).join(" · ")}</div>}
                        </div>
                    ),
                },
                {accessor: "tin", title: t('tin'), render: (row) => row.tin ?? "-"},
                {accessor: "currency_id", title: t('currency'), render: (row) => row.currency?.code ?? "MYR"},
                {accessor: "payment_terms_id", title: t('paymentTerms'), render: (row) => (row.payment_terms_id ? termName.get(row.payment_terms_id) : null) ?? "-"},
                {
                    accessor: "tax_included",
                    title: t('prices'),
                    render: (row) => <Badge bg="light" className="badge-soft-secondary">{row.tax_included ? t('inclTax') : t('exclTax')}</Badge>,
                },
                {accessor: "status", title: t('status'), render: (row) => <StatusBadge status={row.status} />},
            ]}
        />
    );
}

export function CreateSupplier() {
    return <SettingsCreatePage create={addSupplier} backTo={SUPPLIERS_PATH} renderForm={(props) => <SupplierForm {...props} />} />;
}

export function EditSupplier() {
    const {t} = useSmartTranslation();

    return (
        <SettingsEditPage
            useGetOne={useGetOneSupplier}
            update={updateSupplier}
            remove={deleteSupplier}
            backTo={SUPPLIERS_PATH}
            deleteText={(record) => t('recordDeactivateNamed', {name: record.name})}
            renderForm={(props) => <SupplierForm {...props} />}
        />
    );
}
