import {useRef} from "react";
import {ActionButton} from "@/components/Access/Guarded";
import {formatQuantity} from "@/utils/display-format";
import {DocRef} from "@/views/Documents/DocumentPreview";
import {Button} from "react-bootstrap";
import {XCircle} from "react-feather";
import {useNavigate, useParams, useSearchParams} from "react-router-dom";
import {CustomerTransDocument} from "@/apis/models/sales-document";
import {addDeliveryNote, DeliveryNoteRequest, DirectDeliveryRequest, updateDeliveryNote, useGetAllDeliveryNote, useGetOneDeliveryNote, voidDeliveryNote} from "@/apis/requests/delivery-note-api";
import {orderApi} from "@/apis/requests/sales-order-api";
import {ConditionalError} from "@/components/Display/ErrorBoundary";
import {useConfirmAction} from "@/hooks/use-confirmation-action";
import {useNotification} from "@/hooks/notification";
import {formatDecimal} from "@/views/Inventory/shared/options";
import {useSmartTranslation} from "@/hooks/use-translation";
import {DELIVERIES_PATH, ORDERS_PATH} from "../sales-menu";
import {DocumentBanner} from "../shared/DocumentBanner";
import {SalesListPage} from "../shared/SalesListPage";
import {SalesStateBadge} from "../shared/SalesStateBadge";
import {DeliveryForm} from "./DeliveryForm";
import {DeliveryActions} from "./DeliveryActions";
import {DirectDeliveryForm} from "./DirectDeliveryForm";

const Loading = () => <div className="loader-pendulums mt-10" />;

export function DeliveryNotes() {
    const {t} = useSmartTranslation();

    return (
        <SalesListPage<CustomerTransDocument>
            useGetAll={useGetAllDeliveryNote}
            editPath={(row) => `${DELIVERIES_PATH}/${row.id}`}
            states={["outstanding", "uninvoiced", "partially_invoiced", "invoiced", "voided"]}
            searchPlaceholder={t('searchSalesDocuments')}
            columns={[
                {accessor: "trans_date", title: t('date')},
                {accessor: "reference_no", title: t('referenceNo'), render: (row) => <DocRef type={row.trans_type} id={row.id} reference={row.reference_no} />},
                {accessor: "sales_order_id", title: t('salesOrder'), render: (row) => row.sales_order?.reference_no ?? "-"},
                {accessor: "customer_id", title: t('customer'), render: (row) => row.customer?.name ?? "-"},
                {accessor: "inventory_location_id", title: t('deliverFrom'), render: (row) => row.inventory_location?.name ?? "-"},
                {accessor: "grand_total", title: t('total'), tdClasses: "text-end", render: (row) => <span>{formatDecimal(row.grand_total)} <span className="text-muted small">{row.currency?.code}</span></span>},
                {accessor: "state", title: t('status'), render: (row) => <SalesStateBadge state={row.state} />},
            ]}
        />
    );
}

/** /sales/deliveries/create — direct delivery; ?from_order=ID ships that order's outstanding lines. */
export function CreateDelivery() {
    const navigate = useNavigate();
    const [search] = useSearchParams();
    const createdId = useRef<number>();
    const orderId = search.get("from_order");
    const {data: order, error} = orderApi.useGetOne(orderId, {revalidateOnFocus: false});

    const onSubmit = async (data: DeliveryNoteRequest | DirectDeliveryRequest) => {
        createdId.current = (await addDeliveryNote(data)).id;
    };
    const onSuccess = async () => navigate(`${DELIVERIES_PATH}/${createdId.current}`);

    // no order: a direct delivery
    if (!orderId) {
        return <DirectDeliveryForm backTo={DELIVERIES_PATH} onSubmit={onSubmit} onSuccess={onSuccess} />;
    }
    if (error) {
        return <ConditionalError error={error} />;
    }
    if (!order) {
        return <Loading />;
    }

    return (
        <DeliveryForm
            order={order}
            backTo={`${ORDERS_PATH}/${order.id}`}
            onSubmit={onSubmit}
            onSuccess={onSuccess}
        />
    );
}

export function EditDelivery() {
    const {t} = useSmartTranslation();
    const {id = ""} = useParams();
    const {confirmAndExecute} = useConfirmAction();
    const notify = useNotification();
    const {data: note, mutate, error} = useGetOneDeliveryNote(id, {revalidateOnFocus: false});
    const {data: order, mutate: mutateOrder} = orderApi.useGetOne(note?.sales_order_id, {revalidateOnFocus: false});

    if (error) {
        return <ConditionalError error={error} />;
    }
    if (!note || (note.sales_order_id && !order)) {
        return <Loading />;
    }
    const refresh = async () => {
        await mutate();
        if (order) {
            await mutateOrder();
        }
    };
    const onSubmit = async (data: DeliveryNoteRequest | DirectDeliveryRequest) => {
        await updateDeliveryNote(note.id, data);
        await refresh();
    };

    const banner = (
        <DocumentBanner
            state={note.state}
            progress={note.invoiced_qty ? t('invoicedOf', {done: formatQuantity(note.invoiced_qty), total: formatQuantity(note.delivered_qty ?? 0)}) : undefined}
            source={order ? {type: "sales_order", id: order.id, reference_no: order.reference_no} : null}
            related={note.related}
            actions={note.status === "active" ? (
                <>
                    <DeliveryActions note={note} />
                    {note.state === "uninvoiced" && (
                        <ActionButton variant="outline-danger" size="sm" onClick={() => confirmAndExecute(async () => {
                            try {
                                await voidDeliveryNote(note.id, null);
                                notify.success(t('deliveryVoided'));
                                await refresh();
                            } catch (err) {
                                notify.error(err);
                            }
                        }, {text: t('voidDeliveryText', {ref: note.reference_no})})}>
                            <XCircle size={14} className="me-1" />{t('void')}
                        </ActionButton>
                    )}
                </>
            ) : undefined}
        />
    );
    const key = `${note.id}-${note.state}`;

    return order
        ? <DeliveryForm key={key} order={order} record={note} backTo={DELIVERIES_PATH} onSubmit={onSubmit} banner={banner} />
        : <DirectDeliveryForm key={key} record={note} backTo={DELIVERIES_PATH} onSubmit={onSubmit} banner={banner} />;
}
