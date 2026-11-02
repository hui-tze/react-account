import {useRef} from "react";
import {Button} from "react-bootstrap";
import {ArrowRightCircle, Slash, Truck, XCircle} from "react-feather";
import {Link, useNavigate, useParams, useSearchParams} from "react-router-dom";
import {SalesOrderDocument} from "@/apis/models/sales-document";
import {orderApi, quotationApi, SalesOrderRequest} from "@/apis/requests/sales-order-api";
import {ConditionalError} from "@/components/Display/ErrorBoundary";
import {useConfirmAction} from "@/hooks/use-confirmation-action";
import {useNotification} from "@/hooks/notification";
import {formatDecimal} from "@/views/Inventory/shared/options";
import {useSmartTranslation} from "@/hooks/use-translation";
import {DELIVERIES_PATH, ORDERS_PATH, QUOTATIONS_PATH} from "../sales-menu";
import {DocumentBanner} from "../shared/DocumentBanner";
import {quotationToOrderValues} from "../shared/sales-form";
import {SalesOrderForm, SalesOrderKind} from "./SalesOrderForm";

const CONFIG = {
    quotation: {api: quotationApi, path: QUOTATIONS_PATH},
    order: {api: orderApi, path: ORDERS_PATH},
} as const;

const Loading = () => <div className="loader-pendulums mt-10" />;

/** New quotation / order; saving opens the saved document. Orders may start from ?from_quotation=ID. */
function CreatePage({kind}: {kind: SalesOrderKind}) {
    const navigate = useNavigate();
    const [search] = useSearchParams();
    const createdId = useRef<number>();
    const {api, path} = CONFIG[kind];

    const fromQuotation = kind === "order" ? search.get("from_quotation") : null;
    const {data: quotation, error} = quotationApi.useGetOne(fromQuotation, {revalidateOnFocus: false});

    if (fromQuotation && error) {
        return <ConditionalError error={error} />;
    }
    if (fromQuotation && !quotation) {
        return <Loading />;
    }

    return (
        <SalesOrderForm
            kind={kind}
            initialValues={quotation ? quotationToOrderValues(quotation) : undefined}
            backTo={path}
            onSubmit={async (data: SalesOrderRequest) => {
                createdId.current = (await api.add(data)).id;
            }}
            onSuccess={async () => navigate(`${path}/${createdId.current}`)}
        />
    );
}

/** Saved quotation / order with its status strip and workflow actions. */
function EditPage({kind}: {kind: SalesOrderKind}) {
    const {t} = useSmartTranslation();
    const {id = ""} = useParams();
    const {confirmAndExecute} = useConfirmAction();
    const notify = useNotification();
    const {api, path} = CONFIG[kind];
    const {data: record, mutate, error} = api.useGetOne(id, {revalidateOnFocus: false});

    if (error) {
        return <ConditionalError error={error} />;
    }
    if (!record) {
        return <Loading />;
    }

    const run = (action: () => Promise<void>, text: string, done: string) => confirmAndExecute(async () => {
        try {
            await action();
            notify.success(done);
            await mutate();
        } catch (err) {
            notify.error(err);
        }
    }, {text});

    const live = record.status === "active";
    const progress = record.ordered_qty > 0 && record.progress_qty > 0
        ? t(kind === "quotation" ? 'orderedOf' : 'deliveredOf', {done: formatDecimal(record.progress_qty), total: formatDecimal(record.ordered_qty)})
        : undefined;

    const actions = <OrderActions kind={kind} record={record} run={run} />;

    return (
        <SalesOrderForm
            // remount after actions so the form shows the refreshed record
            key={`${record.id}-${record.status}-${record.state}`}
            kind={kind}
            record={record}
            backTo={path}
            onSubmit={async (data) => {
                await api.update(record.id, data);
                await mutate();
            }}
            banner={(
                <DocumentBanner
                    state={record.state}
                    progress={progress}
                    source={record.source_quotation ? {type: "sales_quotation", id: record.source_quotation.id, reference_no: record.source_quotation.reference_no} : null}
                    related={record.related}
                    actions={live ? actions : undefined}
                />
            )}
        />
    );
}

type OrderActionsProps = {
    kind: SalesOrderKind,
    record: SalesOrderDocument,
    run: (action: () => Promise<void>, text: string, done: string) => void,
};

function OrderActions({kind, record, run}: OrderActionsProps) {
    const {t} = useSmartTranslation();

    if (kind === "quotation") {
        return (
            <>
                {record.state !== "converted" && (
                    <Link to={`${ORDERS_PATH}/create?from_quotation=${record.id}`} className="btn btn-primary btn-sm">
                        <ArrowRightCircle size={14} className="me-1" />{t('convertToSalesOrder')}
                    </Link>
                )}
                <Button variant="outline-danger" size="sm" onClick={() => run(() => quotationApi.cancel(record.id), t('cancelQuotationText', {ref: record.reference_no}), t('quotationCancelled'))}>
                    <XCircle size={14} className="me-1" />{t('cancelQuotation')}
                </Button>
            </>
        );
    }

    const delivered = record.progress_qty > 0;
    const outstanding = record.progress_qty < record.ordered_qty;
    return (
        <>
            {outstanding && (
                <Link to={`${DELIVERIES_PATH}/create?from_order=${record.id}`} className="btn btn-primary btn-sm">
                    <Truck size={14} className="me-1" />{t('deliver')}
                </Link>
            )}
            {delivered && outstanding && (
                <Button variant="outline-secondary" size="sm" onClick={() => run(() => orderApi.close(record.id), t('closeOrderText', {ref: record.reference_no}), t('orderClosed'))}>
                    <Slash size={14} className="me-1" />{t('closeOrder')}
                </Button>
            )}
            {!delivered && (
                <Button variant="outline-danger" size="sm" onClick={() => run(() => orderApi.cancel(record.id), t('cancelOrderText', {ref: record.reference_no}), t('orderCancelled'))}>
                    <XCircle size={14} className="me-1" />{t('cancelOrder')}
                </Button>
            )}
        </>
    );
}

export const CreateQuotation = () => <CreatePage kind="quotation" />;
export const EditQuotation = () => <EditPage kind="quotation" />;
export const CreateSalesOrder = () => <CreatePage kind="order" />;
export const EditSalesOrder = () => <EditPage kind="order" />;
