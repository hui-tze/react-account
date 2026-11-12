import {useCallback, useState} from "react";
import {Alert, Badge, Col, Form, Row} from "react-bootstrap";
import {AlertTriangle} from "react-feather";
import type {PendingConsolidationDocument} from "@/apis/models/pos";
import type {EinvoiceProcessStatus} from "@/apis/models/einvoice";
import {consolidationApi} from "@/apis/requests/pos-api";
import {useGetPosSettingOptions} from "@/apis/requests/pos-setting-api";
import {Link} from "@/components/Access/Guarded";
import SettingsListPage from "@/views/Settings/shared/SettingsListPage";
import {SearchBox} from "@/views/Sales/shared/SearchBox";
import {DocRef} from "@/views/Documents/DocumentPreview";
import {POS_CREDIT_NOTES_PATH, POS_RECEIPTS_PATH} from "@/views/Sales/sales-menu";
import {formatDecimal} from "@/views/Inventory/shared/options";
import {formatDate} from "@/utils/display-format";
import {useSmartTranslation} from "@/hooks/use-translation";
import {EINVOICE_CONSOLIDATION_PATH} from "../einvoice-menu";
import {EinvoiceStatusBadge} from "../shared/einvoice-ui";

/**
 * One place for every consolidated POS receipt / refund that LHDN doesn't have yet: still
 * waiting for its month's consolidated e-invoice, or in one that failed, was rejected or cancelled.
 */
export function PendingConsolidationPage() {
    const {t} = useSmartTranslation();
    const {data: posList} = useGetPosSettingOptions();
    const [filters, setFilters] = useState({q: "", source_type: "", pos_setting_id: "", state: "", date_from: "", date_to: ""});
    const set = (key: keyof typeof filters) => (value: string) => setFilters(f => ({...f, [key]: value}));

    // the table calls this as a hook with its paging params; the filters ride along
    const useFetcher = useCallback((params: URLSearchParams) => {
        const query = new URLSearchParams(params);
        Object.entries(filters).forEach(([key, value]) => value && query.set(key, value));
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return consolidationApi.usePending(query);
    }, [filters]);

    return (
        <SettingsListPage<PendingConsolidationDocument>
            useFetcher={useFetcher}
            tableKey="pos-pending"
            editPath={(row) => `${row.trans_type === "pos_receipt" ? POS_RECEIPTS_PATH : POS_CREDIT_NOTES_PATH}/${row.id}`}
            toolbar={(
                <>
                    <Alert variant="light" className="border small mt-3 mb-0 d-flex flex-wrap align-items-center gap-2">
                        <span>{t('posPendingIntro')}</span>
                        <Link to={EINVOICE_CONSOLIDATION_PATH} className="ms-auto">{t('posOpenConsolidation')}</Link>
                    </Alert>
                    <Row className="g-2 py-3 align-items-center">
                        <Col md={3}>
                            <SearchBox value={filters.q} onChange={set("q")} placeholder={t('posSearchPlaceholder')} />
                        </Col>
                        <Col md="auto">
                            <Form.Select value={filters.source_type} onChange={(e) => set("source_type")(e.target.value)} aria-label={t('type')}>
                                <option value="">{t('posPendingAllTypes')}</option>
                                <option value="pos_receipt">{t('docType_pos_receipt')}</option>
                                <option value="pos_credit_note">{t('docType_pos_credit_note')}</option>
                            </Form.Select>
                        </Col>
                        <Col md="auto">
                            <Form.Select value={filters.pos_setting_id} onChange={(e) => set("pos_setting_id")(e.target.value)} aria-label={t('posCounter')}>
                                <option value="">{t('posAllCounters')}</option>
                                {(posList ?? []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </Form.Select>
                        </Col>
                        <Col md="auto">
                            <Form.Select value={filters.state} onChange={(e) => set("state")(e.target.value)} aria-label={t('status')}>
                                <option value="">{t('allStatuses')}</option>
                                <option value="waiting">{t('posPendingWaiting')}</option>
                                <option value="in_batch">{t('posPendingInBatch')}</option>
                                <option value="overdue">{t('consOverdue')}</option>
                            </Form.Select>
                        </Col>
                        <Col md="auto" className="d-flex align-items-center gap-2">
                            <Form.Control type="date" value={filters.date_from} onChange={(e) => set("date_from")(e.target.value)} aria-label={t('dateFrom')} />
                            <span className="text-muted">–</span>
                            <Form.Control type="date" value={filters.date_to} onChange={(e) => set("date_to")(e.target.value)} aria-label={t('dateTo')} />
                        </Col>
                    </Row>
                </>
            )}
            columns={[
                {accessor: "trans_date", title: t('date')},
                {accessor: "reference_no", title: t('referenceNo'), render: (row) => <DocRef type={row.trans_type} id={row.id} reference={row.reference_no} />},
                {accessor: "trans_type", title: t('type'), render: (row) => t(`docType_${row.trans_type}`)},
                {accessor: "buyer_name", title: t('posBuyer')},
                {accessor: "pos", title: t('posCounter'), render: (row) => row.pos ?? "-"},
                {accessor: "grand_total", title: t('total'), tdClasses: "text-end", render: (row) => <span>{formatDecimal(row.grand_total)} <span className="text-muted small">{row.currency}</span></span>},
                {accessor: "deadline", title: t('posPendingDueBy'), render: (row) => (
                    <span className={row.overdue ? "text-danger fw-semibold" : ""}>
                        {row.overdue && <AlertTriangle size={13} className="me-1" />}{formatDate(row.deadline)}
                    </span>
                )},
                {accessor: "state", title: t('status'), render: (row) => row.batch ? (
                    <div>
                        <div className="d-flex align-items-center gap-1">
                            <Link to={`${EINVOICE_CONSOLIDATION_PATH}?year=${row.period.slice(0, 4)}&batch=${row.batch.id}`} className="fw-semibold">{row.batch.doc_number}</Link>
                            <EinvoiceStatusBadge status={row.batch.process_status as EinvoiceProcessStatus | null} />
                        </div>
                        {row.batch.last_error_message && <div className="small text-danger text-truncate" style={{maxWidth: 280}} title={row.batch.last_error_message}>{row.batch.last_error_message}</div>}
                    </div>
                ) : <Badge bg="light" text="dark" className="border fw-normal">{t('posPendingWaiting')}</Badge>},
            ]}
        />
    );
}
