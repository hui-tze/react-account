import {ReactNode} from "react";
import {Button} from "react-bootstrap";
import {Trash2} from "react-feather";
import {useAreaNavigate as useNavigate} from "@/utils/setup-area";
import SimpleBar from "simplebar-react";
import type {SWRResponse} from "swr";
import {AutoGenerateRemoteTable, ColumnRecord} from "@/components/@hk-data-table/tables";
import {ColumnProps} from "@/components/@hk-data-table";
import {PaginationResponse} from "@/apis/pagination";
import {TableFilters} from "@/apis/table";
import {useConfirmAction} from "@/hooks/use-confirmation-action";
import {useNotification} from "@/hooks/notification";
import {useSmartTranslation} from "@/hooks/use-translation";

const NO_FILTERS: TableFilters = {};

type Identifiable = ColumnRecord & {id: number, status?: string};

export type SettingsListPageProps<T extends Identifiable> = {
    useFetcher: (params: URLSearchParams) => SWRResponse<PaginationResponse<T>>,
    columns: ColumnProps<T>[],
    // e.g. (row) => `/sales/setup/sales-areas/${row.id}`
    editPath: (row: T) => string,
    sort?: string[],
    onDelete?: (row: T) => Promise<void>,
    // hide the delete action for some rows (e.g. system records); inactive rows never show it
    canDelete?: (row: T) => boolean,
    // confirmation body shown before deleting
    deleteText?: (row: T) => string,
    deletedMessage?: string,
    // remount key — pass something that changes when lookup data (e.g. account names) arrives
    tableKey?: string,
    // filters / search rendered above the table
    toolbar?: ReactNode,
    rowClassName?: (row: T) => string | undefined,
    // rows that don't open anything, e.g. summary rows
    canClickRow?: (row: T) => boolean,
};

/**
 * Settings listing: paginated SWR table, row click opens the edit page, and an optional
 * delete (deactivate) action for active rows.
 */
export default function SettingsListPage<T extends Identifiable>({useFetcher, columns, editPath, sort, onDelete, canDelete, deleteText, deletedMessage, tableKey, toolbar, rowClassName, canClickRow}: SettingsListPageProps<T>) {
    const navigate = useNavigate();
    const {t, currentLanguage} = useSmartTranslation();
    const {confirmAndExecute} = useConfirmAction();
    const notify = useNotification();

    const allColumns: ColumnProps<T>[] = onDelete ? [
        ...columns,
        {
            accessor: undefined,
            title: "",
            tdClasses: "text-end",
            render: (row, _index, mutate) => row.status !== "inactive" && (canDelete?.(row) ?? true) && (
                <Button
                    variant="flush-danger"
                    size="sm"
                    className="btn-icon btn-rounded"
                    title={t('delete')}
                    onClick={(e) => {
                        e.stopPropagation();
                        confirmAndExecute(async () => {
                            try {
                                await onDelete(row);
                                notify.success(deletedMessage ?? t('recordDeactivated'));
                                await mutate();
                            } catch (err) {
                                notify.error(err);
                            }
                        }, {text: deleteText ? deleteText(row) : t('recordDeactivateText')});
                    }}
                >
                    <Trash2 size={16} />
                </Button>
            ),
        },
    ] : columns;

    return (
        <div className="app-body">
            <SimpleBar className="nicescroll-bar">
                <div className="container-fluid">
                    {toolbar}
                    <AutoGenerateRemoteTable
                        key={`${currentLanguage}|${tableKey ?? ""}`}
                        useFetcher={useFetcher}
                        params={NO_FILTERS}
                        sort={sort}
                        hover
                        onRowClick={(row: T) => navigate(editPath(row))}
                        rowClassName={rowClassName}
                        canClickRow={canClickRow}
                        columns={allColumns}
                    />
                </div>
            </SimpleBar>
        </div>
    );
}
