import {ReactNode, useState} from "react";
import {Button, Card, Table} from "react-bootstrap";
import {BarChart2, List} from "react-feather";
import Chart from "react-apexcharts";
import type {ApexOptions} from "apexcharts";
import moment from "moment";
import {Link} from "@/components/Access/Guarded";
import {money} from "@/views/GeneralLedger/shared/report-ui";
import {useSmartTranslation} from "@/hooks/use-translation";

/*
 * Chart colours: the validated reference palette (dataviz skill), light mode — the app has no dark theme.
 * Two-series charts use slot 1 / slot 2 (blue / orange, an adjacent pair that passes the colour-blind checks);
 * single-series bars use slot 1 only.
 */
export const SERIES_1 = "#2a78d6";
export const SERIES_2 = "#eb6834";
const GRID = "#e9ecef";
const AXIS_TEXT = "#6f6f6f";

/** Signed amount for display: 1,234.00 or (1,234.00). */
export const amount = (value: number) => money(value, false);

/** Short axis labels: 950, 1.2k, 3.4M. */
export function compact(value: number): string {
    const n = Math.abs(value);
    const sign = value < 0 ? "-" : "";
    if (n >= 1_000_000) return `${sign}${+(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${sign}${+(n / 1_000).toFixed(1)}k`;
    return `${sign}${+n.toFixed(0)}`;
}

export const monthLabel = (ym: string) => moment(ym, "YYYY-MM").format("MMM YY");

/** A dashboard panel: title, optional subtitle and header link, body. */
export function Panel({title, subtitle, action, children, className, bodyClassName}: {
    title: ReactNode, subtitle?: ReactNode, action?: ReactNode, children: ReactNode, className?: string, bodyClassName?: string,
}) {
    return (
        <Card className={`card-border dash-panel h-100 mb-0 ${className ?? ""}`}>
            <Card.Header className="card-header-action">
                <div className="min-w-0">
                    <h6 className="mb-0">{title}</h6>
                    {subtitle && <div className="small text-muted text-truncate">{subtitle}</div>}
                </div>
                {action && <div className="card-action-wrap">{action}</div>}
            </Card.Header>
            <Card.Body className={bodyClassName}>{children}</Card.Body>
        </Card>
    );
}

/** A headline figure with one or two lines of context; the whole tile links to its module. */
export function StatTile({label, value, currency, lines, to, tone}: {
    label: string, value: number, currency: string | null, lines: ReactNode[], to?: string, tone?: "danger" | "success",
}) {
    const body = (
        <Card.Body>
            <div className="text-muted small fw-medium text-uppercase dash-stat-label">{label}</div>
            <div className={`dash-stat-value ${tone ? `text-${tone}` : "text-dark"}`}>
                {currency && <span className="dash-stat-currency">{currency}</span>}
                {amount(value)}
            </div>
            {lines.filter(Boolean).map((line, i) => <div key={i} className="small text-muted">{line}</div>)}
        </Card.Body>
    );
    return (
        <Card className="card-border dash-stat h-100 mb-0">
            {to ? <Link to={to} className="text-reset text-decoration-none h-100 d-block">{body}</Link> : body}
        </Card>
    );
}

/** Two series by month as grouped columns, with a switch to a plain table (the accessible view). */
export function MonthlyColumns({months, series, currency, emptyText, height = 280, sparseLabels = false}: {
    months: string[],
    series: {name: string, color: string, data: number[]}[],
    currency: string | null,
    emptyText: string,
    height?: number,
    /** label every other month (for narrow panels) */
    sparseLabels?: boolean,
}) {
    const {t} = useSmartTranslation();
    const [asTable, setAsTable] = useState(false);

    if (series.every(s => s.data.every(v => Math.abs(v) < 0.005))) {
        return (
            <div className="d-flex align-items-center justify-content-center text-muted small text-center" style={{minHeight: height}}>
                {emptyText}
            </div>
        );
    }
    const fmt = (v: number) => `${currency ?? ""} ${amount(v)}`.trim();

    const options: ApexOptions = {
        chart: {type: "bar", toolbar: {show: false}, zoom: {enabled: false}, fontFamily: "inherit", animations: {enabled: false}},
        colors: series.map(s => s.color),
        plotOptions: {bar: {columnWidth: "55%", borderRadius: 4, borderRadiusApplication: "end"}},
        // 2px surface gap between neighbouring bars
        stroke: {show: true, width: 2, colors: ["#ffffff"]},
        dataLabels: {enabled: false},
        legend: {position: "top", horizontalAlign: "left", fontSize: "13px", markers: {size: 6, shape: "circle"} as never, labels: {colors: AXIS_TEXT}},
        grid: {borderColor: GRID, strokeDashArray: 0, xaxis: {lines: {show: false}}},
        // labels stay horizontal; a narrow chart labels every other month (ending on the latest) instead of tilting them
        xaxis: {
            categories: months.map((m, i) => !sparseLabels || (months.length - 1 - i) % 2 === 0 ? monthLabel(m) : ""),
            axisBorder: {show: false}, axisTicks: {show: false},
            labels: {rotate: 0, hideOverlappingLabels: false, trim: false, style: {colors: AXIS_TEXT}},
        },
        yaxis: {labels: {formatter: compact, style: {colors: AXIS_TEXT}}},
        // the tooltip always names the month, even where the axis label is skipped
        tooltip: {shared: true, intersect: false, x: {formatter: (_v: unknown, o?: {dataPointIndex?: number}) => monthLabel(months[o?.dataPointIndex ?? 0])},
            y: {formatter: fmt}},
        states: {hover: {filter: {type: "darken"}} as never},
    };

    return (
        <div>
            <div className="d-flex justify-content-end">
                <Button variant="flush-dark" size="sm" className="btn-icon btn-rounded flush-soft-hover dash-view-toggle"
                    onClick={() => setAsTable(!asTable)} title={asTable ? t('dashShowChart') : t('dashShowTable')}
                    aria-label={asTable ? t('dashShowChart') : t('dashShowTable')} aria-pressed={asTable}>
                    <span className="feather-icon">{asTable ? <BarChart2 /> : <List />}</span>
                </Button>
            </div>
            {asTable ? (
                <div className="table-responsive" style={{maxHeight: height}}>
                    <Table size="sm" className="mb-0">
                        <thead>
                            <tr>
                                <th>{t('dashMonth')}</th>
                                {series.map(s => <th key={s.name} className="text-end">{s.name}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {months.map((m, i) => (
                                <tr key={m}>
                                    <td>{monthLabel(m)}</td>
                                    {series.map(s => <td key={s.name} className="text-end">{amount(s.data[i] ?? 0)}</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            ) : (
                <Chart type="bar" height={height} options={options} series={series.map(s => ({name: s.name, data: s.data}))} />
            )}
        </div>
    );
}

/** Proportional bars with their label and value always visible (no hover needed). */
export function BarList({rows, color = SERIES_1, emptyText}: {
    rows: {key: string | number, label: ReactNode, value: number, tone?: string}[],
    color?: string,
    emptyText: string,
}) {
    const max = Math.max(...rows.map(r => Math.abs(r.value)), 0);
    if (!rows.length || max === 0) {
        return <div className="text-muted small py-3 text-center">{emptyText}</div>;
    }
    return (
        <ul className="list-unstyled mb-0 dash-bar-list">
            {rows.map(r => (
                <li key={r.key} className="mb-2">
                    <div className="d-flex justify-content-between small mb-1 gap-2">
                        <span className="text-truncate">{r.label}</span>
                        <span className={`fw-medium flex-shrink-0 ${r.tone ?? "text-dark"}`}>{amount(r.value)}</span>
                    </div>
                    <div className="dash-bar-track">
                        {Math.abs(r.value) >= 0.005 && (
                            <div className="dash-bar-fill" style={{width: `${Math.max(1.5, Math.abs(r.value) / max * 100)}%`, background: color}} />
                        )}
                    </div>
                </li>
            ))}
        </ul>
    );
}
