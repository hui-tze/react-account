import {Fragment, useState} from "react";
import {formatDate} from "@/utils/display-format";
import {Badge, Breadcrumb, Button, Form, ProgressBar, Table} from "react-bootstrap";
import {ChevronRight} from "react-feather";
import {useSearchParams} from "react-router-dom";
import {Link} from "@/components/Access/Guarded";
import moment from "moment";
import type {BudgetReportRow} from "@/apis/models/dimension";
import {dimensionApi} from "@/apis/requests/dimension-api";
import {ConditionalError} from "@/components/Display/ErrorBoundary";
import {useSmartTranslation} from "@/hooks/use-translation";
import {DateRangeBar, LedgerTreeTable, money, ReportPage, useYearToDate} from "@/views/GeneralLedger/shared/report-ui";
import {useActiveDimensions} from "../shared/DimensionFields";
import {BUDGETS_PATH, budgetPath, DIMENSION_LIST_PATH} from "../dimensions-menu";

const Loading = () => <div className="loader-pendulums my-5" />;
const monthLabel = (m: string) => moment(m, "YYYY-MM").format("MMM YYYY");

/** How much of the year-to-date budget is used, coloured by whether that is good. */
function UsedBar({row}: {row: Pick<BudgetReportRow, "used_pct" | "favourable">}) {
    if (row.used_pct === null) {
        return <span className="text-muted">-</span>;
    }
    return (
        <div className="d-flex align-items-center gap-2 justify-content-end">
            <ProgressBar now={Math.min(row.used_pct, 100)} variant={row.favourable ? "success" : "danger"} style={{width: 70, height: 6}} />
            <span className={row.favourable ? undefined : "text-danger fw-semibold"}>{row.used_pct}%</span>
        </div>
    );
}

/**
 * Budget vs actual for one month and the year to date, per budget line, grouped by account
 * class. Variance = actual − budget, green when favourable (income above / costs within budget).
 */
export function BudgetVsActual() {
    const {t} = useSmartTranslation();
    const [search, setSearch] = useSearchParams();
    const budgetId = search.get("budget_id");
    const month = search.get("month");
    const {data: budgets} = dimensionApi.useBudgets();
    const {data, error} = dimensionApi.useBudgetReport(budgetId, month);
    const {dimensions} = useActiveDimensions();

    const set = (key: string, value: string | null) => setSearch(prev => {
        if (value) {
            prev.set(key, value);
        } else {
            prev.delete(key);
        }
        if (key === "budget_id") {
            prev.delete("month");
        }
        return prev;
    }, {replace: true});

    const dimension = dimensions.find(d => d.id === data?.budget.dimension_id);
    const valueName = (id: number | null) => {
        const value = dimension?.values?.find(v => v.id === id);
        return value ? `${value.code} · ${value.name}` : "";
    };

    // net = income less costs, by the class's normal side
    const net = (key: "budget_month" | "actual_month" | "budget_ytd" | "actual_ytd" | "budget_year" | "remaining") =>
        (data?.class_totals ?? []).reduce((s, c) => s + (c.normal_balance === "credit" ? c[key] : -c[key]), 0);

    return (
        <ReportPage
            title={data ? `${t('menu_BudgetVsActual')} · ${data.budget.name}` : t('menu_BudgetVsActual')}
            subtitle={data && (
                <>
                    {t('budgetReportPeriod', {month: monthLabel(data.month), from: formatDate(data.budget.fiscal_year_begin)})}
                    {data.budget.dimension_name && <> · {t('budgetSplitBy')}: {data.budget.dimension_name}</>}
                </>
            )}
            toolbar={(
                <>
                    <Form.Select size="sm" value={budgetId ?? ""} onChange={(e) => set("budget_id", e.target.value || null)} style={{maxWidth: 320}} aria-label={t('budget')}>
                        <option value="">{t('pickBudget')}</option>
                        {(budgets ?? []).map(b => <option key={b.id} value={b.id}>{b.name} ({moment(b.fiscal_year_begin).format("YYYY")})</option>)}
                    </Form.Select>
                    {data && (
                        <Form.Select size="sm" value={data.month} onChange={(e) => set("month", e.target.value)} style={{maxWidth: 170}} aria-label={t('month')}>
                            {data.months.map(m => <option key={m} value={m}>{monthLabel(m)}</option>)}
                        </Form.Select>
                    )}
                    {budgetId && <Link to={budgetPath(Number(budgetId))} className="btn btn-sm btn-outline-secondary">{t('editBudget')}</Link>}
                </>
            )}
        >
            {!budgetId ? (
                <div className="text-center text-muted py-5">
                    {budgets && budgets.length === 0
                        ? <>{t('noBudgetsYet')} <Link to={`${BUDGETS_PATH}/create`}>{t('newBudget')}</Link></>
                        : t('pickBudgetToCompare')}
                </div>
            ) : error ? <ConditionalError error={error} /> : !data ? <Loading /> : data.rows.length === 0 ? (
                <p className="text-center text-muted py-5">{t('budgetNoLines')}</p>
            ) : (
                <div className="table-responsive">
                    <Table size="sm" className="gl-tree mb-0 budget-report">
                        <thead>
                            <tr>
                                <th rowSpan={2}>{t('account')}</th>
                                {dimension && <th rowSpan={2}>{dimension.name}</th>}
                                <th colSpan={2} className="text-center border-start">{monthLabel(data.month)}</th>
                                <th colSpan={4} className="text-center border-start">{t('yearToDate')}</th>
                                <th colSpan={2} className="text-center border-start">{t('fullYear')}</th>
                            </tr>
                            <tr>
                                <th className="text-end border-start">{t('budget')}</th>
                                <th className="text-end">{t('actual')}</th>
                                <th className="text-end border-start">{t('budget')}</th>
                                <th className="text-end">{t('actual')}</th>
                                <th className="text-end">{t('variance')}</th>
                                <th className="text-end">{t('budgetUsed')}</th>
                                <th className="text-end border-start">{t('budget')}</th>
                                <th className="text-end">{t('remaining')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.class_totals.map(cls => (
                                <Fragment key={cls.class_id ?? 0}>
                                    <tr className="gl-tree-class"><td colSpan={dimension ? 10 : 9}>{cls.class_name ?? t('unclassified')}</td></tr>
                                    {data.rows.filter(r => r.class_id === cls.class_id).map(row => (
                                        <tr key={`${row.account_id}-${row.dimension_value_id}`} className="gl-tree-account">
                                            <td className="ps-4"><span className="text-muted small me-2">{row.account_code}</span>{row.account_name}</td>
                                            {dimension && <td className="small">{valueName(row.dimension_value_id)}</td>}
                                            <td className="text-end border-start">{money(row.budget_month)}</td>
                                            <td className="text-end">{money(row.actual_month)}</td>
                                            <td className="text-end border-start">{money(row.budget_ytd)}</td>
                                            <td className="text-end">{money(row.actual_ytd)}</td>
                                            <td className={`text-end fw-semibold ${row.favourable ? "text-success" : "text-danger"}`}>{money(row.variance_ytd)}</td>
                                            <td className="text-end"><UsedBar row={row} /></td>
                                            <td className="text-end border-start">{money(row.budget_year)}</td>
                                            <td className={`text-end ${row.remaining < 0 ? "text-danger" : ""}`}>{money(row.remaining)}</td>
                                        </tr>
                                    ))}
                                    <tr className="gl-tree-class-total">
                                        <td colSpan={dimension ? 2 : 1}>{t('totalOf', {name: cls.class_name ?? ""})}</td>
                                        <td className="text-end border-start">{money(cls.budget_month)}</td>
                                        <td className="text-end">{money(cls.actual_month)}</td>
                                        <td className="text-end border-start">{money(cls.budget_ytd)}</td>
                                        <td className="text-end">{money(cls.actual_ytd)}</td>
                                        <td className="text-end">{money(cls.actual_ytd - cls.budget_ytd)}</td>
                                        <td />
                                        <td className="text-end border-start">{money(cls.budget_year)}</td>
                                        <td className="text-end">{money(cls.remaining)}</td>
                                    </tr>
                                </Fragment>
                            ))}
                        </tbody>
                        {data.class_totals.length > 1 && (
                            <tfoot className="gl-tree-footer">
                                <tr>
                                    <td colSpan={dimension ? 2 : 1}>{t('budgetNetResult')}</td>
                                    <td className="text-end border-start">{money(net("budget_month"), false)}</td>
                                    <td className="text-end">{money(net("actual_month"), false)}</td>
                                    <td className="text-end border-start">{money(net("budget_ytd"), false)}</td>
                                    <td className={`text-end ${net("actual_ytd") >= net("budget_ytd") ? "text-success" : "text-danger"}`}>{money(net("actual_ytd"), false)}</td>
                                    <td className="text-end">{money(net("actual_ytd") - net("budget_ytd"), false)}</td>
                                    <td />
                                    <td className="text-end border-start">{money(net("budget_year"), false)}</td>
                                    <td />
                                </tr>
                            </tfoot>
                        )}
                    </Table>
                </div>
            )}
        </ReportPage>
    );
}

/**
 * Profit & loss with a column per value of a dimension (e.g. per cost centre), plus postings
 * without a value. A group column can be opened to show the values under it.
 */
export function DimensionProfitLoss() {
    const {t} = useSmartTranslation();
    const {dimensions, isLoading} = useActiveDimensions();
    const [range, setRange] = useYearToDate();
    const [chosen, setChosen] = useState<number | null>(null);
    // drill-down path of group values (empty: top level)
    const [path, setPath] = useState<{id: number, label: string}[]>([]);
    const dimensionId = chosen ?? dimensions[0]?.id ?? null;
    const parentId = path.length ? path[path.length - 1].id : null;
    const {data, error} = dimensionApi.useProfitLoss(dimensionId, range.from, range.to, parentId);

    const columns = (data?.columns ?? []).map(c => ({
        key: c.key,
        label: c.id === null ? t('unassigned') : c.code ?? "",
        width: 130,
    }));

    return (
        <ReportPage
            title={data ? `${t('menu_ProfitLossByDimension')} · ${data.dimension.name}` : t('menu_ProfitLossByDimension')}
            subtitle={t('glPeriod', {from: formatDate(range.from), to: formatDate(range.to)})}
            toolbar={(
                <>
                    <Form.Select size="sm" value={dimensionId ?? ""} onChange={(e) => { setChosen(Number(e.target.value)); setPath([]); }} style={{maxWidth: 220}}
                        aria-label={t('dimension')}>
                        {dimensions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </Form.Select>
                    <DateRangeBar range={range} onChange={setRange} />
                </>
            )}
        >
            {!isLoading && dimensions.length === 0 ? (
                <div className="text-center text-muted py-5">{t('noDimensionsYet')} <Link to={`${DIMENSION_LIST_PATH}?new=1`}>{t('newDimension')}</Link></div>
            ) : error ? <ConditionalError error={error} /> : !data ? <Loading /> : (
                <>
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-3 d-print-none">
                        <Breadcrumb className="mb-0 small">
                            <Breadcrumb.Item active={!path.length} onClick={() => setPath([])}>{t('allValues', {dimension: data.dimension.name})}</Breadcrumb.Item>
                            {path.map((p, i) => (
                                <Breadcrumb.Item key={p.id} active={i === path.length - 1} onClick={() => setPath(path.slice(0, i + 1))}>{p.label}</Breadcrumb.Item>
                            ))}
                        </Breadcrumb>
                        {data.columns.filter(c => c.has_children).map(c => (
                            <Button key={c.key} size="sm" variant="outline-secondary" className="py-0" onClick={() => setPath([...path, {id: c.id!, label: c.code ?? ""}])}>
                                {t('openGroup', {code: c.code})} <ChevronRight size={13} />
                            </Button>
                        ))}
                    </div>
                    <div className="small text-muted mb-2">
                        {data.columns.filter(c => c.id !== null).map((c, i) => (
                            <span key={c.key}>{i > 0 && " · "}<span className="fw-semibold text-dark">{c.code}</span> {c.name}{c.is_group && <Badge bg="light" className="badge-soft-primary ms-1">{t('groupValue')}</Badge>}</span>
                        ))}
                    </div>
                    <LedgerTreeTable<Record<string, number>>
                        classes={data.classes}
                        columns={[...columns, {key: "total", label: t('total'), width: 140}]}
                        emptyText={t('dimensionPlEmpty')}
                        footer={(
                            <tr>
                                <td>{t('netProfit')}</td>
                                {[...columns.map(c => c.key), "total"].map(key => (
                                    <td key={key} className={`text-end ${data.net_profit[key] < 0 ? "text-danger" : ""}`}>{money(data.net_profit[key], false)}</td>
                                ))}
                            </tr>
                        )}
                    />
                </>
            )}
        </ReportPage>
    );
}
