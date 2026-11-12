import {InventoryLocation} from "@/apis/models/inventory-location";
import {deleteInventoryLocation, useGetAllInventoryLocation} from "@/apis/requests/inventory-location-api";
import SettingsListPage from "@/views/Settings/shared/SettingsListPage";
import {StatusBadge, YesNoBadge} from "@/views/Settings/shared/StatusBadge";
import {useSmartTranslation} from "@/hooks/use-translation";

export const INVENTORY_LOCATIONS_PATH = "/inventory/setup/inventory-locations";

export default function InventoryLocations() {
    const {t} = useSmartTranslation();

    return (
        <SettingsListPage<InventoryLocation>
            useFetcher={useGetAllInventoryLocation}
            editPath={(row) => `${INVENTORY_LOCATIONS_PATH}/${row.id}`}
            onDelete={(row) => deleteInventoryLocation(row.id)}
            deleteText={(row) => t('recordDeactivateNamed', {name: row.name})}
            columns={[
                {
                    accessor: "code",
                    title: t('code'),
                    render: (row) => <span className="fw-semibold text-dark">{row.code}</span>,
                },
                {
                    accessor: "name",
                    title: t('name'),
                },
                {
                    accessor: "fixed_asset",
                    title: t('fixedAsset'),
                    render: (row) => <YesNoBadge value={row.fixed_asset} />,
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
