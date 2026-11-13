import {Fragment, ReactNode, useEffect, useMemo, useRef, useState} from "react";
import {Button, Card, Col, Dropdown, Form, Row, Spinner, Table} from "react-bootstrap";
import {ChevronRight, Download, FileText, Play, Printer, RotateCcw, Search} from "react-feather";
import {Route, useParams, useSearchParams} from "react-router-dom";
import Select, {type StylesConfig} from "react-select";
import SimpleBar from "simplebar-react";
import {Link} from "@/components/Access/Guarded";
import {ConditionalError} from "@/components/Display/ErrorBoundary";
import {useNotification} from "@/hooks/notification";
import {useSmartTranslation} from "@/hooks/use-translation";
import {saveBlobAs} from "@/lib/request-util/http-request";
import {printElement} from "@/utils/print-area";
import {reactSelectCustomStyles} from "@/utils/ReactSelect";
import {formatAmount, formatDate, formatDateTime, formatPercent, formatQuantity} from "@/utils/display-format";
import {DocRef} from "@/views/Documents/DocumentPreview";
import {
    reportApi,
    type ReportColumn,
    type ReportColumnType,
    type ReportExportFormat,
    type ReportFilter,
    type ReportResult,
    type ReportRow,
    type ReportTotals,
    type ReportValue,
} from "@/apis/requests/report-api";
import {reportPath, type ReportSectionKey} from "./report-menu";

const NUMERIC: ReportColumnType[] = ["money", "qty", "number", "percent"];
// free-text columns that may run long: these wrap, everything else stays on one line
const WRAPPING = ["description", "memo", "reason", "error_message", "last_error", "remark", "step"];
const Loading = () => <div className="loader-pendulums my-5" />;

/** A value as the report shows it: negatives in brackets, nothing for blanks. */
function display(value: ReportValue, type: ReportColumnType): string {
    if (value === null || value === undefined || value === "") {
        return "";
    }
    switch (type) {
        case "money": {
            const n = Number(value);
            return n < 0 ? `(${formatAmount(-n)})` : formatAmount(n);
        }
        case "qty":
            return formatQuantity(value);
        case "percent":
            return `${formatPercent(value)}%`;
        case "date":
            return formatDate(String(value), "");
        case "datetime":
            return formatDateTime(String(value), "");
        default:
            return String(value);
    }
}

/** Report titles and descriptions are written in English by the API; a translation wins when there is one. */
function useReportText() {
    const {t} = useSmartTranslation();
    return {
        title: (key: string, fallback: string) => t(`report_${key}`, {defaultValue: fallback}),
        description: (key: string, fallback: string) => t(`reportHint_${key}`, {defaultValue: fallback}),
    };
}

// ---------------------------------------------------------------- list of a module's reports

/** The reports of one module, as a searchable list. */
export function ReportIndex({section}: {section: ReportSectionKey}) {
    const {t} = useSmartTranslation();
    const text = useReportText();
    const {data, error, isLoading} = reportApi.useCatalog();
    const [term, setTerm] = useState("");

    const reports = useMemo(() => {
        const all = data?.find(s => s.key === section)?.reports ?? [];
        const q = term.trim().toLowerCase();
        return q ? all.filter(r => `${text.title(r.key, r.title)} ${text.description(r.key, r.description)}`.toLowerCase().includes(q)) : all;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, section, term]);

    return (
        <div className="app-body">
            <SimpleBar className="nicescroll-bar">
                <div className="container-fluid py-3">
                    <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                        <div className="me-auto">
                            <h5 className="mb-1">{t('menu_Reports')}</h5>
                            <p className="text-muted small mb-0">{t('reportsLead')}</p>
                        </div>
                        <div className="position-relative" style={{width: 260}}>
                            <Search size={14} className="position-absolute text-muted" style={{left: 10, top: 10}} />
                            <Form.Control size="sm" value={term} onChange={(e) => setTerm(e.target.value)} placeholder={t('reportsSearch')}
                                aria-label={t('reportsSearch')} style={{paddingLeft: 30}} />
                        </div>
                    </div>
                    {error ? <ConditionalError error={error} /> : isLoading || !data ? <Loading /> : reports.length === 0 ? (
                        <p className="text-center text-muted py-5">{t('reportsNone')}</p>
                    ) : (
                        <Row className="g-3">
                            {reports.map(report => (
                                <Col key={report.key} md={6} xl={4}>
                                    <Link to={reportPath(section, report.key)} className="text-reset text-decoration-none">
                                        <Card className="card-border report-card h-100 mb-0">
                                            <Card.Body className="d-flex align-items-start gap-3">
                                                <span className="report-card-icon"><FileText size={18} /></span>
                                                <span className="flex-grow-1">
                                                    <span className="d-block fw-semibold text-dark">{text.title(report.key, report.title)}</span>
                                                    <span className="d-block small text-muted">{text.description(report.key, report.description)}</span>
                                                </span>
                                                <ChevronRight size={16} className="text-muted flex-shrink-0 mt-1" />
                                            </Card.Body>
                                        </Card>
                                    </Link>
                                </Col>
                            ))}
                        </Row>
                    )}
                </div>
            </SimpleBar>
        </div>
    );
}

// ---------------------------------------------------------------- one report

type Values = Record<string, string>;

const asText = (value: ReportFilter["default"]) => value === null || value === undefined || value === false ? "" : value === true ? "1" : String(value);

/** Filter values as a query string, blanks left out (the API then applies its defaults). */
function toQuery(values: Values): string {
    const q = new URLSearchParams();
    Object.entries(values).forEach(([key, value]) => {
        if (value !== "") {
            q.set(key, value);
        }
    });
    return q.toString();
}

// the app's select look, at the height of a small input
const FILTER_SELECT_STYLES: StylesConfig = {
    ...reactSelectCustomStyles,
    control: (base, state) => ({...(reactSelectCustomStyles.control?.(base, state) ?? base), minHeight: 31, height: 31, fontSize: ".875rem"}),
    valueContainer: (base) => ({...base, padding: "0 8px"}),
    input: (base) => ({...base, margin: 0, padding: 0}),
    indicatorsContainer: (base) => ({...base, height: 29}),
    dropdownIndicator: (base) => ({...base, padding: 4}),
    clearIndicator: (base) => ({...base, padding: 4}),
    menu: (base) => ({...base, zIndex: 20, fontSize: ".875rem"}),
};

function FilterField({filter, value, onChange}: {filter: ReportFilter, value: string, onChange: (value: string) => void}) {
    const {t} = useSmartTranslation();
    const id = `report-filter-${filter.key}`;

    if (filter.type === "boolean") {
        return (
            <Form.Check type="switch" id={id} className="report-filter-switch" label={filter.label} checked={value === "1"}
                onChange={(e) => onChange(e.target.checked ? "1" : "")} />
        );
    }

    return (
        <Form.Group controlId={id} className="report-filter">
            <Form.Label className="small text-muted mb-1">{filter.label}{filter.required && <span className="text-danger"> *</span>}</Form.Label>
            {filter.type === "date" ? (
                <Form.Control type="date" size="sm" value={value} onChange={(e) => onChange(e.target.value)} />
            ) : (
                <Select
                    inputId={id}
                    options={filter.options ?? []}
                    value={(filter.options ?? []).find(o => String(o.value) === value) ?? null}
                    onChange={(option) => onChange(option ? String((option as {value: string | number}).value) : "")}
                    isClearable={!filter.required}
                    placeholder={t('all')}
                    styles={FILTER_SELECT_STYLES}
                />
            )}
        </Form.Group>
    );
}

/** A report: its filters, the figures, and print / CSV / PDF. Filter values live in the address, so a report can be bookmarked. */
export function ReportViewer({section}: {section: ReportSectionKey}) {
    const {t} = useSmartTranslation();
    const text = useReportText();
    const notify = useNotification();
    const {key} = useParams<{key: string}>();
    const [search, setSearch] = useSearchParams();
    const {data: meta, error: metaError} = reportApi.useMeta(key);

    // what the form shows; applied to the address (and so to the report) on Run
    const [draft, setDraft] = useState<Values | null>(null);
    const [exporting, setExporting] = useState<ReportExportFormat | null>(null);
    const sheet = useRef<HTMLDivElement>(null);

    const defaults = useMemo<Values>(() => (meta?.filters ?? []).reduce<Values>((all, f) => ({...all, [f.key]: asText(f.default)}), {}), [meta]);
    const applied = useMemo<Values | null>(() => {
        if (!meta) {
            return null;
        }
        const hasAny = meta.filters.some(f => search.has(f.key));
        return meta.filters.reduce<Values>((all, f) => ({...all, [f.key]: hasAny ? search.get(f.key) ?? "" : defaults[f.key]}), {});
    }, [meta, search, defaults]);

    useEffect(() => {
        setDraft(applied);
    }, [applied]);

    const query = applied ? toQuery(applied) : null;
    const {data, error, isLoading, isValidating, mutate} = reportApi.useRun(meta ? key : null, query);

    if (metaError) {
        return <div className="app-body"><div className="container-fluid py-3"><ConditionalError error={metaError} /></div></div>;
    }
    if (!meta || !draft || !key) {
        return <div className="app-body"><Loading /></div>;
    }

    const title = text.title(meta.key, meta.title);
    const dirty = toQuery(draft) !== query;

    const run = () => {
        const missing = meta.filters.find(f => f.required && !draft[f.key]);
        if (missing) {
            notify.error(t('reportFilterRequired', {name: missing.label}));
            return;
        }
        if (dirty) {
            setSearch(new URLSearchParams(Object.entries(draft).filter(([, v]) => v !== "")), {replace: true});
        } else {
            void mutate();
        }
    };

    const download = async (format: ReportExportFormat) => {
        setExporting(format);
        try {
            const blob = await reportApi.export(key, query ?? "", format);
            saveBlobAs(blob, `${meta.title.replace(/[^A-Za-z0-9]+/g, "-")}.${format}`);
        } catch (e) {
            notify.error(e);
        } finally {
            setExporting(null);
        }
    };

    return (
        <div className="app-body">
            <SimpleBar className="nicescroll-bar">
                <div className="container-fluid py-3">
                    <Card className="card-border mb-3 d-print-none">
                        <Card.Body className="py-3">
                            <Form onSubmit={(e) => { e.preventDefault(); run(); }}>
                                <div className="report-filters">
                                    {meta.filters.map(filter => (
                                        <FilterField key={filter.key} filter={filter} value={draft[filter.key] ?? ""}
                                            onChange={(value) => setDraft(prev => ({...(prev ?? {}), [filter.key]: value}))} />
                                    ))}
                                    <div className="report-filter-actions">
                                        <Button type="submit" size="sm" variant="primary" disabled={isValidating}>
                                            {isValidating ? <Spinner size="sm" className="me-1" /> : <Play size={14} className="me-1" />}{t('reportRun')}
                                        </Button>
                                        {meta.filters.length > 0 && (
                                            <Button type="button" size="sm" variant="light" title={t('reportResetFilters')} aria-label={t('reportResetFilters')}
                                                onClick={() => setSearch(new URLSearchParams(), {replace: true})}>
                                                <RotateCcw size={14} />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Form>
                            {dirty && <div className="small text-warning mt-2">{t('reportFiltersChanged')}</div>}
                        </Card.Body>
                    </Card>

                    <Card ref={sheet} className="card-border gl-report report-sheet">
                        <Card.Body>
                            <div className="d-flex flex-wrap align-items-start gap-2 gl-report-head">
                                <div className="me-auto">
                                    <div className="text-muted small d-none d-print-block">{data?.company}</div>
                                    <h4 className="mb-1">{title}</h4>
                                    {data && data.criteria.length > 0 && (
                                        <div className="text-muted small">
                                            {data.criteria.map(c => (
                                                <span key={c.label} className="me-3">
                                                    {c.label}: <span className="text-dark">{c.type === "date" ? formatDate(c.value) : c.value}</span>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="d-flex gap-2 d-print-none">
                                    <Button variant="outline-secondary" size="sm" onClick={() => printElement(sheet.current)} disabled={!data}>
                                        <Printer size={14} className="me-1" />{t('print')}
                                    </Button>
                                    <Dropdown align="end">
                                        <Dropdown.Toggle variant="outline-secondary" size="sm" disabled={!data || exporting !== null}>
                                            {exporting ? <Spinner size="sm" className="me-1" /> : <Download size={14} className="me-1" />}{t('reportExport')}
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item onClick={() => void download("pdf")}>{t('reportExportPdf')}</Dropdown.Item>
                                            <Dropdown.Item onClick={() => void download("csv")}>{t('reportExportCsv')}</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                            </div>

                            {error ? <ConditionalError error={error} /> : isLoading || !data ? <Loading /> : (
                                <div className={isValidating ? "opacity-50" : undefined}>
                                    <ReportBody report={data} />
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </div>
            </SimpleBar>
        </div>
    );
}

/** Headline figures, the table (sections with subtotals, grand totals) and the notes. */
function ReportBody({report}: {report: ReportResult}) {
    const {t} = useSmartTranslation();
    const {columns} = report;
    const titled = report.sections.some(s => s.title);
    // the cell that opens a row's document: its reference, else the first column
    const linkKey = (columns.find(c => c.key === "reference_no") ?? columns.find(c => c.key === "doc_number") ?? columns[0])?.key;

    const cellClass = (column: ReportColumn) => NUMERIC.includes(column.type) ? "text-end text-nowrap" : WRAPPING.includes(column.key) ? "report-cell-wrap" : "text-nowrap";

    const rowCells = (row: ReportRow) => columns.map(column => {
        const shown = display(row[column.key] as ReportValue, column.type);
        return (
            <td key={column.key} className={cellClass(column)}>
                {column.key === linkKey && row._doc && shown
                    ? <DocRef type={row._doc.type} id={row._doc.id} reference={shown} className="doc-ref-link" />
                    : shown}
            </td>
        );
    });

    // the label runs across the columns before the first figure
    const totalCells = (totals: NonNullable<ReportTotals>, label: string): ReactNode => {
        const found = columns.findIndex(column => totals[column.key] !== null && totals[column.key] !== undefined);
        const start = found === -1 ? columns.length : found;
        return (
            <>
                {start > 0 && <td colSpan={start}>{label}</td>}
                {columns.slice(start).map(column => <td key={column.key} className={cellClass(column)}>{display(totals[column.key], column.type)}</td>)}
            </>
        );
    };

    return (
        <>
            {report.summary.length > 0 && (
                <div className="report-summary">
                    {report.summary.map(figure => (
                        <div key={figure.label} className="report-figure">
                            <div className="report-figure-label">{figure.label}</div>
                            <div className="report-figure-value">{display(figure.value, figure.type) || "-"}</div>
                        </div>
                    ))}
                </div>
            )}

            {report.row_count === 0 ? (
                <p className="text-muted text-center py-5 mb-0">{t('reportEmpty')}</p>
            ) : (
                <div className="table-responsive report-scroll">
                    <Table size="sm" hover className="gl-tree report-table mb-0">
                        <thead>
                            <tr>
                                {columns.map(column => <th key={column.key} className={NUMERIC.includes(column.type) ? "text-end" : undefined}>{column.label}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {report.sections.map((section, index) => (
                                <Fragment key={`${section.title ?? ""}-${index}`}>
                                    {section.title && (
                                        <tr className="gl-tree-class">
                                            <td colSpan={columns.length}>
                                                {section.title}
                                                {section.subtitle && <span className="report-section-sub">{section.subtitle}</span>}
                                            </td>
                                        </tr>
                                    )}
                                    {section.rows.map((row, i) => (
                                        <tr key={i} className={row._class === "muted" ? "report-row-muted" : row._class === "strong" ? "fw-semibold" : undefined}>
                                            {rowCells(row)}
                                        </tr>
                                    ))}
                                    {titled && section.totals && (
                                        <tr className="gl-tree-class-total">{totalCells(section.totals, t('totalOf', {name: section.title ?? ""}))}</tr>
                                    )}
                                </Fragment>
                            ))}
                        </tbody>
                        {report.totals && (
                            <tfoot className="gl-tree-footer">
                                <tr>{totalCells(report.totals, report.totals_label === "Grand total" ? t('grandTotal') : report.totals_label)}</tr>
                            </tfoot>
                        )}
                    </Table>
                </div>
            )}

            {report.notes.length > 0 && (
                <div className="report-notes">
                    {report.notes.map(note => <div key={note}>{note}</div>)}
                </div>
            )}
            <div className="report-generated">{t('reportGenerated', {count: report.row_count, at: formatDateTime(report.generated_at)})}</div>
        </>
    );
}

// ---------------------------------------------------------------- routes

/** `reports` (the module's list) and `reports/:key` (one report), for use inside a module's route. */
export function reportRoutes(section: ReportSectionKey) {
    return (
        <Route path="reports" handle={{title: "Reports", canNavigate: true}}>
            <Route index element={<ReportIndex section={section} />} handle={{hide: true}} />
            <Route path=":key" element={<ReportViewer section={section} />} handle={{title: "View", canNavigate: false}} />
        </Route>
    );
}
