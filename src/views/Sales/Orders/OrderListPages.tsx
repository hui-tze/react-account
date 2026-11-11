import {SalesOrderDocument} from "@/apis/models/sales-document";
import {formatQuantity} from "@/utils/display-format";
import {DocRef} from "@/views/Documents/DocumentPreview";
import {orderApi, quotationApi} from "@/apis/requests/sales-order-api";
import {ColumnProps} from "@/components/@hk-data-table";
import {formatDecimal} from "@/views/Inventory/shared/options";
import {useSmartTranslation} from "@/hooks/use-translation";
import {ORDERS_PATH, QUOTATIONS_PATH} from "../sales-menu";
import {SalesListPage} from "../shared/SalesListPage";
import {SalesStateBadge} from "../shared/SalesStateBadge";

function useColumns(kind: "quotation" | "order"): ColumnProps<SalesOrderDocument>[] {
    const {t} = useSmartTranslation();

    return [
        {accessor: "order_date", title: t('date')},
        {
            accessor: "reference_no",
            title: t('referenceNo'),
            render: (row) => <DocRef type={row.trans_type} id={row.id} reference={row.reference_no} />,
        },
        {
            accessor: "customer_id",
            title: t('customer'),
            render: (row) => (
                <div>
                    <div>{row.customer?.name ?? "-"}</div>
                    {row.branch && row.branch.name !== row.customer?.name && <div className="small text-muted">{row.branch.name}</div>}
                </div>
            ),
        },
        kind === "quotation"
            ? {accessor: "valid_until", title: t('validUntil'), render: (row) => row.valid_until ?? "-"}
            : {accessor: "requested_delivery_date", title: t('requiredBy'), render: (row) => row.requested_delivery_date ?? "-"},
        {
            accessor: "grand_total",
            title: t('total'),
            tdClasses: "text-end",
            render: (row) => <span>{formatDecimal(row.grand_total)} <span className="text-muted small">{row.currency?.code}</span></span>,
        },
        {
            accessor: "state",
            title: t('status'),
            render: (row) => (
                <div>
                    <SalesStateBadge state={row.state} />
                    {(row.state === "partially_delivered" || row.state === "partially_converted") && (
                        <div className="small text-muted">{formatQuantity(row.progress_qty)} / {formatQuantity(row.ordered_qty)}</div>
                    )}
                </div>
            ),
        },
    ];
}

export function Quotations() {
    const {t} = useSmartTranslation();
    return (
        <SalesListPage<SalesOrderDocument>
            useGetAll={quotationApi.useGetAll}
            editPath={(row) => `${QUOTATIONS_PATH}/${row.id}`}
            columns={useColumns("quotation")}
            states={["open", "partially_converted", "converted", "expired", "cancelled"]}
            searchPlaceholder={t('searchSalesDocuments')}
        />
    );
}

export function SalesOrders() {
    const {t} = useSmartTranslation();
    return (
        <SalesListPage<SalesOrderDocument>
            useGetAll={orderApi.useGetAll}
            editPath={(row) => `${ORDERS_PATH}/${row.id}`}
            columns={useColumns("order")}
            states={["outstanding", "open", "partially_delivered", "delivered", "closed", "cancelled"]}
            searchPlaceholder={t('searchSalesDocuments')}
        />
    );
}
