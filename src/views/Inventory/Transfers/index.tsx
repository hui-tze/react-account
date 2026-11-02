import {ArrowRight} from "react-feather";
import {InventoryDocument} from "@/apis/models/inventory-document";
import {useGetAllLocationTransfer, voidLocationTransfer} from "@/apis/requests/location-transfer-api";
import SettingsListPage from "@/views/Settings/shared/SettingsListPage";
import {useSmartTranslation} from "@/hooks/use-translation";
import {TRANSFERS_PATH} from "../inventory-menu";
import {dateOnly} from "../shared/options";
import {DocumentStatusBadge} from "../shared/DocumentStatusBadge";

export default function Transfers() {
    const {t} = useSmartTranslation();

    return (
        <SettingsListPage<InventoryDocument>
            useFetcher={useGetAllLocationTransfer}
            editPath={(row) => `${TRANSFERS_PATH}/${row.id}`}
            onDelete={(row) => voidLocationTransfer(row.id)}
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
                    title: t('route'),
                    render: (row) => (
                        <span className="text-nowrap">
                            {row.inventory_location?.name ?? "-"}
                            <ArrowRight size={14} className="mx-2 text-muted" />
                            {row.to_inventory_location?.name ?? "-"}
                        </span>
                    ),
                },
                {accessor: "line_count", title: t('lines'), tdClasses: "text-end"},
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
