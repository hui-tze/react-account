import {FormEvent, useEffect, useState} from "react";
import {Card, Form, InputGroup} from "react-bootstrap";
import {Calendar, Search, X} from "react-feather";
import moment from "moment";
import {formatDate} from "@/utils/display-format";
import {useNavigate, useSearchParams} from "react-router-dom";
import SimpleBar from "simplebar-react";
import classNames from "classnames";
import {searchApi} from "@/apis/requests/search-api";
import {useSmartTranslation} from "@/hooks/use-translation";
import {useAccess} from "@/providers/access";
import {DOCUMENT_TYPE_MODULES} from "@/constants/permissions";
import {DocumentPreviewModal} from "@/views/Documents/DocumentPreview";
import {rememberSearch} from "@/layout/Header/GlobalSearch";
import {DOCUMENT_GROUPS, DocumentResult, RECORD_KINDS, RECORD_LABEL_KEYS, RecordResult, recordPath} from "./search-ui";

const day = (m: moment.Moment) => m.format("YYYY-MM-DD");

/** Quick periods for the date range. */
const PERIODS: {key: string, labelKey: string, range: () => {from: string, to: string}}[] = [
    {key: "today", labelKey: 'periodToday', range: () => ({from: day(moment()), to: day(moment())})},
    {key: "last7", labelKey: 'periodLast7Days', range: () => ({from: day(moment().subtract(6, "days")), to: day(moment())})},
    {key: "thisMonth", labelKey: 'periodThisMonth', range: () => ({from: day(moment().startOf("month")), to: day(moment().endOf("month"))})},
    {key: "lastMonth", labelKey: 'periodLastMonth', range: () => ({from: day(moment().subtract(1, "month").startOf("month")), to: day(moment().subtract(1, "month").endOf("month"))})},
    {key: "thisYear", labelKey: 'periodThisYear', range: () => ({from: day(moment().startOf("year")), to: day(moment().endOf("year"))})},
    {key: "lastYear", labelKey: 'periodLastYear', range: () => ({from: day(moment().subtract(1, "year").startOf("year")), to: day(moment().subtract(1, "year").endOf("year"))})},
];

/** All search results for ?q= (and / or a ?from= ?to= document date range), filtered by area, plus matching records. */
export default function SearchPage() {
    const {t} = useSmartTranslation();
    const navigate = useNavigate();
    const {canModule} = useAccess();
    const [search, setSearch] = useSearchParams();
    const query = search.get("q") ?? "";
    const group = search.get("in") ?? "";
    const from = search.get("from") ?? "";
    const to = search.get("to") ?? "";
    const hasRange = !!from || !!to;
    const [text, setText] = useState(query);
    const [preview, setPreview] = useState<{type: string, id: number} | null>(null);

    useEffect(() => setText(query), [query]);

    // areas the user's role can view
    const groups = DOCUMENT_GROUPS.filter(g => g.types.some(type => canModule(DOCUMENT_TYPE_MODULES[type])));
    const types = DOCUMENT_GROUPS.find(g => g.key === group)?.types;
    const {data, isLoading} = searchApi.useSearch(query, types || hasRange ? 50 : 20, types, from || null, to || null);

    // change some of q / in / from / to, keeping the rest
    const update = (changes: Record<string, string>) => setSearch(prev => {
        const next = new URLSearchParams(prev);
        Object.entries(changes).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key));
        return next;
    });
    const submit = (e: FormEvent) => {
        e.preventDefault();
        rememberSearch(text);
        update({q: text.trim()});
    };
    const setGroup = (key: string) => update({in: key});
    const applyPeriod = (key: string) => {
        const period = PERIODS.find(p => p.key === key);
        update(period ? period.range() : {from: "", to: ""});
    };
    const hasCriteria = !!query.trim() || hasRange;

    const recordCount = RECORD_KINDS.reduce((n, kind) => n + (data?.records[kind]?.length ?? 0), 0);

    return (
        <div className="hk-pg-body">
            <SimpleBar className="nicescroll-bar">
                <div className="container-xxl py-4 search-page">
                    <Form onSubmit={submit} className="mb-3">
                        <InputGroup size="lg">
                            <InputGroup.Text><Search size={18} /></InputGroup.Text>
                            <Form.Control autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder={t('globalSearchPlaceholder')} />
                        </InputGroup>
                        <Form.Text>{t('globalSearchHint')}</Form.Text>
                    </Form>

                    <div className="search-page-toolbar mb-3">
                        <div className="search-page-filters">
                            <button type="button" className={classNames("search-chip", {"is-active": !group})} onClick={() => setGroup("")}>{t('all')}</button>
                            {groups.map(g => (
                                <button key={g.key} type="button" className={classNames("search-chip", {"is-active": group === g.key})} onClick={() => setGroup(g.key)}>{t(g.labelKey)}</button>
                            ))}
                        </div>

                        {/* document date range */}
                        <div className="search-page-range">
                            <Calendar size={15} className="text-muted flex-shrink-0" />
                            <Form.Control type="date" size="sm" value={from} max={to || undefined} aria-label={t('dateFrom')}
                                onChange={(e) => update({from: e.target.value})} />
                            <span className="text-muted">–</span>
                            <Form.Control type="date" size="sm" value={to} min={from || undefined} aria-label={t('dateTo')}
                                onChange={(e) => update({to: e.target.value})} />
                            <Form.Select size="sm" value="" onChange={(e) => applyPeriod(e.target.value)} aria-label={t('searchPeriod')} className="search-page-period">
                                <option value="" disabled>{t('searchPeriod')}</option>
                                {PERIODS.map(p => <option key={p.key} value={p.key}>{t(p.labelKey)}</option>)}
                            </Form.Select>
                            {hasRange && (
                                <button type="button" className="btn btn-sm btn-link px-1" onClick={() => applyPeriod("")} title={t('clear')}><X size={15} /></button>
                            )}
                        </div>
                    </div>

                    {hasRange && (
                        <div className="small text-muted mb-2">
                            {from && to ? t('searchRangeBetween', {from: formatDate(from), to: formatDate(to)})
                                : from ? t('searchRangeFrom', {from: formatDate(from)}) : t('searchRangeTo', {to: formatDate(to)})}
                            {!query.trim() && <> · {t('searchRangeAllDocuments')}</>}
                        </div>
                    )}

                    {!hasCriteria ? (
                        <Card className="card-border"><Card.Body className="text-center text-muted py-5">{t('globalSearchHint')}</Card.Body></Card>
                    ) : isLoading && !data ? (
                        <div className="loader-pendulums my-5" />
                    ) : (
                        <>
                            <Card className="card-border mb-3">
                                <Card.Header className="d-flex align-items-center">
                                    <span className="fw-semibold">{t('documents')}</span>
                                    <span className="text-muted small ms-2">{data?.documents.length ?? 0}</span>
                                </Card.Header>
                                <div className="gs-list">
                                    {(data?.documents ?? []).length === 0 ? (
                                        <div className="gs-none">{query.trim() ? t('searchNoResults', {query}) : t('searchNoDocumentsInRange')}</div>
                                    ) : data!.documents.map(doc => (
                                        <DocumentResult key={`${doc.type}-${doc.id}`} doc={doc} query={query} onSelect={() => setPreview({type: doc.type, id: doc.id})} />
                                    ))}
                                </div>
                            </Card>

                            {!group && recordCount > 0 && (
                                <div className="row g-3">
                                    {RECORD_KINDS.filter(kind => data?.records[kind]?.length).map(kind => (
                                        <div key={kind} className="col-md-6">
                                            <Card className="card-border h-100">
                                                <Card.Header className="fw-semibold">{t(RECORD_LABEL_KEYS[kind])}</Card.Header>
                                                <div className="gs-list">
                                                    {data!.records[kind]!.map(record => (
                                                        <RecordResult key={record.id} kind={kind} record={record} query={query} onSelect={() => navigate(recordPath(kind, record.id))} />
                                                    ))}
                                                </div>
                                            </Card>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </SimpleBar>

            {preview && <DocumentPreviewModal type={preview.type} id={preview.id} onClose={() => setPreview(null)} />}
        </div>
    );
}
