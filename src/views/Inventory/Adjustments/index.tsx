import {InventoryDocument} from "@/apis/models/inventory-document";
import {useGetAllInventoryAdjustment, voidInventoryAdjustment} from "@/apis/requests/inventory-adjustment-api";
import SettingsListPage from "@/views/Settings/shared/SettingsListPage";
import {useSmartTranslation} from "@/hooks/use-translation";
import {ADJUSTMENTS_PATH} from "../inventory-menu";
import {dateOnly} from "../shared/options";
import {SignedQuantity} from "../shared/document";
import {DocumentStatusBadge} from "../shared/DocumentStatusBadge";

export default function Adjustments() {
    const {t} = useSmartTranslation();

    return (
        <SettingsListPage<InventoryDocument>
            useFetcher={useGetAllInventoryAdjustment}
            editPath={(row) => `${ADJUSTMENTS_PATH}/${row.id}`}
            onDelete={(row) => voidInventoryAdjustment(row.id)}
            deleteText={(row) => t('documentVoidText', {reference: row.reference_no})}
            deletedMessage={t('documentVoidedMessage')}
            columns={[
                {accessor: "trans_date", title: t('date'), render: (row) => dateOnly(row.trans_date)},
                {
                    accessor: "reference_no",
                    title: t('referenceNo'),
                    render: (row) => <span className="fw-semibold text-dark">{row.reference_no}</span>,
                },
                {
                    accessor: "inventory_location_id",
                    title: t('inventoryLocation'),
                    render: (row) => row.inventory_location?.name ?? "-",
                },
                {accessor: "line_count", title: t('lines'), tdClasses: "text-end"},
                {
                    accessor: "total_value",
                    title: t('totalValue'),
                    tdClasses: "text-end",
                    render: (row) => <SignedQuantity value={Number(row.total_value ?? 0)} />,
                },
                {
                    accessor: "memo",
                    title: t('memo'),
                    render: (row) => <span className="text-muted text-truncate d-inline-block" style={{maxWidth: 240}}>{row.memo ?? ""}</span>,
                },
                {
                    accessor: "status",
                    title: t('status'),
                    render: (row) => <DocumentStatusBadge status={row.status} />,
                },
            ]}
        />
    );
}
