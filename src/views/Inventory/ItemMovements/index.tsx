import {ReactNode, useCallback, useMemo, useState} from "react";
import {formatQuantity} from "@/utils/display-format";
import {Badge, Col, Form, Row} from "react-bootstrap";
import Select from "react-select";
import type {SWRResponse} from "swr";
import {InventoryMovement} from "@/apis/models/inventory-movement";
import {PaginationResponse} from "@/apis/pagination";
import {useGetInventoryLocationOptions} from "@/apis/requests/inventory-location-api";
import {useGetAllInventoryMovement, useGetStockCard} from "@/apis/requests/inventory-movement-api";
import {ColumnProps} from "@/components/@hk-data-table";
import SettingsListPage from "@/views/Settings/shared/SettingsListPage";
import {StatusBadge} from "@/views/Settings/shared/StatusBadge";
import {useSmartTranslation} from "@/hooks/use-translation";
import {salesDocumentPath} from "@/views/Sales/sales-menu";
import {ADJUSTMENTS_PATH, ITEM_MOVEMENTS_PATH, TRANSFERS_PATH} from "../inventory-menu";
import {dateOnly, formatDecimal, itemLabel} from "../shared/options";
import {SignedQuantity, useStockItems} from "../shared/document";

// source documents that have their own screen in this module
const SOURCE_PATHS: Record<string, string> = {
    inventory_adjustment: ADJUSTMENTS_PATH,
    location_transfer: TRANSFERS_PATH,
};

const SOURCE_LABEL_KEYS: Record<string, string> = {
    inventory_adjustment: 'itemAdjustment',
    location_transfer: 'locationTransfer',
};

// the stock card's opening / closing lines, slipped into the table around the ledger rows
const OPENING = "opening";
const CLOSING = "closing";
const isSummaryRow = (row: InventoryMovement) => row.trans_type === OPENING || row.trans_type === CLOSING;

export function MovementTypeBadge({type}: {type: string}) {
    const {t} = useSmartTranslation();
    // sales documents (delivery notes, invoices, credit notes) move stock under their own type
    const isSales = !SOURCE_LABEL_KEYS[type] && salesDocumentPath(type, 0) !== null;

    return (
        <Badge bg="light" className={type === "location_transfer" ? "badge-soft-info" : type === "inventory_adjustment" ? "badge-soft-warning" : isSales ? "badge-soft-primary" : "badge-soft-secondary"}>
            {SOURCE_LABEL_KEYS[type] ? t(SOURCE_LABEL_KEYS[type]) : isSales ? t(`docType_${type}`) : type}
        </Badge>
    );
}

/** Where a ledger row leads: its source document when there is a screen for it, else the movement itself. */
export function movementPath(row: InventoryMovement): string {
    const source = SOURCE_PATHS[row.trans_type];
    if (source) {
        return `${source}/${row.trans_id}`;
    }
    return salesDocumentPath(row.trans_type, row.trans_id) ?? `${ITEM_MOVEMENTS_PATH}/${row.id}`;
}

function summaryRow(type: typeof OPENING | typeof CLOSING, balance: number, date: string): InventoryMovement {
    return {
        id: type === OPENING ? -1 : -2,
        trans_type: type,
        trans_date: date,
        balance,
    } as InventoryMovement;
}

type Filters = {itemId: number | null, locationId: string, dateFrom: string, dateTo: string};

/** The filters as API params (item_id, inventory_location_id, date_from, date_to). */
function filterParams({itemId, locationId, dateFrom, dateTo}: Filters): URLSearchParams {
    const params = new URLSearchParams();
    Object.entries({item_id: itemId, inventory_location_id: locationId, date_from: dateFrom, date_to: dateTo}).forEach(([key, value]) => {
        if (value) {
            params.set(key, String(value));
        }
    });
    return params;
}

export default function ItemMovements() {
    const {t} = useSmartTranslation();
    const {items} = useStockItems();
    const {data: locations} = useGetInventoryLocationOptions();
    const [filters, setFilters] = useState<Filters>({itemId: null, locationId: "", dateFrom: "", dateTo: ""});
    const set = (patch: Partial<Filters>) => setFilters(f => ({...f, ...patch}));
    const {itemId, locationId, dateFrom, dateTo} = filters;
    const scope = useMemo(() => filterParams(filters), [filters]);
    const {data: card} = useGetStockCard(itemId ? scope : null);

    // the table calls this as a hook with its paging params; the filters ride along, and with
    // an item picked the page also gets the opening / closing rows of its stock card
    const useFetcher = useCallback((params: URLSearchParams): SWRResponse<PaginationResponse<InventoryMovement>> => {
        const query = new URLSearchParams(params);
        scope.forEach((value, key) => query.set(key, value));

        /* eslint-disable react-hooks/rules-of-hooks */
        const list = useGetAllInventoryMovement(query);
        const card = useGetStockCard(itemId ? scope : null);

        const data = useMemo(() => {
            if (!list.data || !card.data) {
                return list.data;
            }
            const {meta} = list.data;
            const rows = [...list.data.data];
            if (meta.current_page <= 1) {
                rows.unshift(summaryRow(OPENING, card.data.opening, dateFrom));
            }
            if (meta.current_page >= meta.last_page) {
                rows.push(summaryRow(CLOSING, card.data.closing, dateTo));
            }
            return {...list.data, data: rows};
        }, [list.data, card.data]);
        /* eslint-enable react-hooks/rules-of-hooks */

        return {
            data,
            error: list.error ?? card.error,
            isLoading: list.isLoading || (!!itemId && card.isLoading),
            isValidating: list.isValidating || card.isValidating,
            mutate: async () => {
                await card.mutate();
                return list.mutate();
            },
        } as SWRResponse<PaginationResponse<InventoryMovement>>;
    }, [scope, itemId, dateFrom, dateTo]);

    const itemOptions = useMemo(() => items.map(i => ({value: i.id, label: `${i.code} - ${i.name}`})), [items]);
    const blank = (row: InventoryMovement, value: () => ReactNode) => isSummaryRow(row) ? "" : value();

    const columns: ColumnProps<InventoryMovement>[] = [
        {accessor: "trans_date", title: t('date'), render: (row) => dateOnly(row.trans_date)},
        {
            accessor: "reference_no",
            title: t('referenceNo'),
            render: (row) => isSummaryRow(row)
                ? <span className="fw-bold text-dark">{t(row.trans_type === OPENING ? 'openingStock' : 'closingStock')}</span>
                : <span className="fw-semibold text-dark">{row.reference_no}</span>,
        },
        {
            accessor: "trans_type",
            title: t('movementType'),
            render: (row) => blank(row, () => <MovementTypeBadge type={row.trans_type} />),
        },
        // the item is the filter itself once one is picked
        ...(itemId ? [] : [{
            accessor: "item_id",
            title: t('item'),
            render: (row: InventoryMovement) => itemLabel(row.item),
        }]),
        {
            accessor: "inventory_location_id",
            title: t('inventoryLocation'),
            render: (row) => blank(row, () => row.inventory_location?.name ?? "-"),
        },
        {
            accessor: "quantity",
            title: t('quantity'),
            tdClasses: "text-end",
            render: (row) => blank(row, () => <SignedQuantity value={Number(row.quantity)} />),
        },
        ...(itemId ? [{
            accessor: "balance",
            title: t('stockBalance'),
            tdClasses: "text-end",
            render: (row: InventoryMovement) => (
                <span className={isSummaryRow(row) ? "fw-bold text-dark" : row.status === "active" ? "fw-semibold" : "text-muted"}>
                    {formatDecimal(row.balance)}
                </span>
            ),
        }] : []),
        {
            accessor: "unit_cost",
            title: t('unitCost'),
            tdClasses: "text-end",
            render: (row) => blank(row, () => formatDecimal(row.unit_cost)),
        },
        {
            accessor: "status",
            title: t('status'),
            render: (row) => blank(row, () => <StatusBadge status={row.status} />),
        },
    ];

    return (
        <SettingsListPage<InventoryMovement>
            useFetcher={useFetcher}
            editPath={movementPath}
            canClickRow={(row) => !isSummaryRow(row)}
            rowClassName={(row) => isSummaryRow(row) ? "table-light" : undefined}
            columns={columns}
            toolbar={(
                <div className="py-3">
                    <Row className="g-2 align-items-center">
                        <Col md={4}>
                            <Select
                                options={itemOptions}
                                value={itemOptions.find(o => o.value === itemId) ?? null}
                                onChange={(option) => set({itemId: option?.value ?? null})}
                                isClearable
                                placeholder={t('allItems')}
                                aria-label={t('item')}
                                menuPortalTarget={document.body}
                                styles={{menuPortal: (base) => ({...base, zIndex: 1060})}}
                                classNamePrefix="select"
                            />
                        </Col>
                        <Col md="auto">
                            <Form.Select value={locationId} onChange={(e) => set({locationId: e.target.value})} aria-label={t('inventoryLocation')}>
                                <option value="">{t('allLocations')}</option>
                                {(locations ?? []).map(l => <option key={l.id} value={l.id}>{l.code} - {l.name}</option>)}
                            </Form.Select>
                        </Col>
                        <Col md="auto" className="d-flex align-items-center gap-2">
                            <Form.Control type="date" value={dateFrom} onChange={(e) => set({dateFrom: e.target.value})} aria-label={t('dateFrom')} />
                            <span className="text-muted">–</span>
                            <Form.Control type="date" value={dateTo} min={dateFrom || undefined} onChange={(e) => set({dateTo: e.target.value})} aria-label={t('dateTo')} />
                        </Col>
                    </Row>
                    {!itemId && <div className="form-text mt-2">{t('stockCardHint')}</div>}
                    {itemId && card && (
                        <div className="form-text mt-2">{t('periodInOut', {in: formatQuantity(card.quantity_in), out: formatQuantity(card.quantity_out)})}</div>
                    )}
                </div>
            )}
        />
    );
}
