import {Uom} from "@/apis/models/uom";
import {deleteUom, useGetAllUom} from "@/apis/requests/uom-api";
import SettingsListPage from "@/views/Settings/shared/SettingsListPage";
import {StatusBadge} from "@/views/Settings/shared/StatusBadge";
import {useSmartTranslation} from "@/hooks/use-translation";

export const UNITS_OF_MEASUREMENT_PATH = "/inventory/setup/units-of-measurement";

export default function UnitsOfMeasurement() {
    const {t} = useSmartTranslation();

    return (
        <SettingsListPage<Uom>
            useFetcher={useGetAllUom}
            editPath={(row) => `${UNITS_OF_MEASUREMENT_PATH}/${row.id}`}
            onDelete={(row) => deleteUom(row.id)}
            deleteText={(row) => t('recordDeactivateNamed', {name: row.name})}
            columns={[
                {
                    accessor: "abbreviation",
                    title: t('abbreviation'),
                    render: (row) => <span className="fw-semibold text-dark">{row.abbreviation}</span>,
                },
                {
                    accessor: "name",
                    title: t('name'),
                },
                {
                    accessor: "decimal_places",
                    title: t('decimalPlaces'),
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
