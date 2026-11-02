import {useMemo} from "react";
import {PosSetting} from "@/apis/models/pos-setting";
import {deletePosSetting, useGetAllPosSetting} from "@/apis/requests/pos-setting-api";
import {useGetInventoryLocationOptions} from "@/apis/requests/inventory-location-api";
import SettingsListPage from "@/views/Settings/shared/SettingsListPage";
import {StatusBadge, YesNoBadge} from "@/views/Settings/shared/StatusBadge";
import {useAccountOptions} from "@/views/Settings/shared/options";
import {useSmartTranslation} from "@/hooks/use-translation";

export const POS_SETTINGS_PATH = "/settings/sales/pos-settings";

export default function PosSettings() {
    const {t} = useSmartTranslation();
    const accounts = useAccountOptions();
    const {data: locations} = useGetInventoryLocationOptions();

    const locationOf = useMemo(() => {
        const byId = new Map((locations ?? []).map(l => [l.id, `${l.code} - ${l.name}`]));
        return (id: number) => byId.get(id) ?? "-";
    }, [locations]);

    return (
        <SettingsListPage<PosSetting>
            useFetcher={useGetAllPosSetting}
            editPath={(row) => `${POS_SETTINGS_PATH}/${row.id}`}
            onDelete={(row) => deletePosSetting(row.id)}
            deleteText={(row) => t('recordDeactivateNamed', {name: row.name})}
            tableKey={`${accounts.options.length}|${locations?.length ?? 0}`}
            columns={[
                {
                    accessor: "name",
                    title: t('name'),
                    render: (row) => <span className="fw-semibold text-dark">{row.name}</span>,
                },
                {
                    accessor: "account_id",
                    title: t('cashAccount'),
                    render: (row) => accounts.labelOf(row.account_id),
                },
                {
                    accessor: "location_id",
                    title: t('inventoryLocation'),
                    render: (row) => locationOf(row.location_id),
                },
                {
                    accessor: "allow_credit_sale_terms",
                    title: t('allowCreditSaleTerms'),
                    render: (row) => <YesNoBadge value={row.allow_credit_sale_terms} />,
                },
                {
                    accessor: "allow_cash_sale_terms",
                    title: t('allowCashSaleTerms'),
                    render: (row) => <YesNoBadge value={row.allow_cash_sale_terms} />,
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
