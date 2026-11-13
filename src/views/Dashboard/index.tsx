import {Badge, Col, Row, Table} from "react-bootstrap";
import {AlertCircle, ArrowDownLeft, ArrowUpRight, FilePlus, FileText} from "react-feather";
import SimpleBar from "simplebar-react";
import {Link} from "@/components/Access/Guarded";
import {ConditionalError} from "@/components/Display/ErrorBoundary";
import {DocRef} from "@/views/Documents/DocumentPreview";
import {useSmartTranslation} from "@/hooks/use-translation";
import {formatDate} from "@/utils/display-format";
import {useDashboard} from "@/apis/requests/dashboard-api";
import type {AgeingBucket, DashboardSummary, OpenDocument, Payables, Receivables} from "@/apis/requests/dashboard-api";
import {CUSTOMERS_PATH, INVOICES_PATH, PAYMENTS_PATH} from "@/views/Sales/sales-menu";
import {BILLS_PATH, SUPPLIER_PAYMENTS_PATH} from "@/views/Purchases/purchases-menu";
import {BANK_ACCOUNTS_PATH, BANK_ACCOUNT_SETTINGS_PATH, bankRegisterPath} from "@/views/Banking/banking-menu";
import {GL_PROFIT_LOSS_PATH} from "@/views/GeneralLedger/gl-menu";
import {amount, BarList, MonthlyColumns, Panel, SERIES_1, SERIES_2, StatTile} from "./widgets";

const AGEING: AgeingBucket[] = ["current", "1_30", "31_60", "61_90", "over_90"];

/**
 * Home: cash, what is owed both ways, and how the year is going — laid out like the overview screens of
 * common accounting systems (headline tiles, then trends, then the lists that need action).
 * Panels the user's role may not view are not sent by the API and not shown.
 */
const Dashboard = () => {
    const {t} = useSmartTranslation();
    const {data, error} = useDashboard();

    if (error) {
        return <ConditionalError error={error} />;
    }
    if (!data) {
        return <div className="loader-pendulums mt-10" />;
    }

    const {receivables, payables, banks, profit, currency} = data;
    const nothing = !receivables && !payables && !banks && !profit;

    return (
        <div className="hk-pg-body py-0">
            <SimpleBar className="nicescroll-bar">
                <div className="container-fluid py-4 dashboard">
                    <Header data={data} />

                    {nothing && (
                        <div className="card card-border p-5 text-center text-muted">{t('dashNothingToShow')}</div>
                    )}

                    {/* Headline figures */}
                    <Row className="g-3 mb-3">
                        {banks && (
                            <Col sm={6} xl={3}>
                                <StatTile label={t('dashCashAtBank')} value={banks.total} currency={currency} to={BANK_ACCOUNTS_PATH}
                                    tone={banks.total < 0 ? "danger" : undefined}
                                    lines={[
                                        t('dashBankAccounts', {count: banks.accounts.length}),
                                        banks.unconverted_currencies.length > 0 && t('dashUnconverted', {currencies: banks.unconverted_currencies.join(", ")}),
                                    ]} />
                            </Col>
                        )}
                        {receivables && (
                            <Col sm={6} xl={3}>
                                <StatTile label={t('dashOwedToYou')} value={receivables.total} currency={currency} to={INVOICES_PATH}
                                    lines={[
                                        t('dashOpenInvoices', {count: receivables.count}),
                                        receivables.overdue > 0 && <span className="text-danger">{t('dashOverdueAmount', {amount: amount(receivables.overdue)})}</span>,
                                    ]} />
                            </Col>
                        )}
                        {payables && (
                            <Col sm={6} xl={3}>
                                <StatTile label={t('dashYouOwe')} value={payables.total} currency={currency} to={BILLS_PATH}
                                    lines={[
                                        payables.overdue > 0
                                            ? <span className="text-danger">{t('dashOverdueAmount', {amount: amount(payables.overdue)})}</span>
                                            : t('dashOpenBills', {count: payables.count}),
                                        payables.due_7_days > 0 && t('dashDueThisWeek', {amount: amount(payables.due_7_days)}),
                                    ]} />
                            </Col>
                        )}
                        {profit && (
                            <Col sm={6} xl={3}>
                                <StatTile label={t('dashNetProfitYear')} value={profit.year_to_date.net} currency={currency} to={GL_PROFIT_LOSS_PATH}
                                    tone={profit.year_to_date.net < 0 ? "danger" : undefined}
                                    lines={[
                                        `${t('dashIncome')} ${amount(profit.year_to_date.income)}`,
                                        `${t('dashExpenses')} ${amount(profit.year_to_date.expenses)}`,
                                    ]} />
                            </Col>
                        )}
                    </Row>

                    {/* Trend + this month */}
                    {profit && (
                        <Row className="g-3 mb-3">
                            <Col xl={8}>
                                <Panel title={t('dashIncomeExpenses')} subtitle={t('dashLast12Months')}>
                                    <MonthlyColumns currency={currency} emptyText={t('dashNoProfitData')} months={profit.monthly.map(m => m.month)} series={[
                                        {name: t('dashIncome'), color: SERIES_1, data: profit.monthly.map(m => m.income)},
                                        {name: t('dashExpenses'), color: SERIES_2, data: profit.monthly.map(m => m.expenses)},
                                    ]} />
                                </Panel>
                            </Col>
                            <Col xl={4}>
                                <Panel title={t('dashProfitSummary')}
                                    action={<Link to={GL_PROFIT_LOSS_PATH} className="small">{t('dashProfitLossReport')}</Link>}>
                                    <Table size="sm" className="mb-0 dash-profit-table">
                                        <thead>
                                            <tr>
                                                <th />
                                                <th className="text-end">{t('dashThisMonth')}</th>
                                                <th className="text-end">{t('dashLastMonth')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>{t('dashIncome')}</td>
                                                <td className="text-end">{amount(profit.this_month.income)}</td>
                                                <td className="text-end text-muted">{amount(profit.last_month.income)}</td>
                                            </tr>
                                            <tr>
                                                <td>{t('dashExpenses')}</td>
                                                <td className="text-end">{amount(profit.this_month.expenses)}</td>
                                                <td className="text-end text-muted">{amount(profit.last_month.expenses)}</td>
                                            </tr>
                                            <tr className="fw-semibold">
                                                <td>{t('dashNet')}</td>
                                                <td className={`text-end ${profit.this_month.net < 0 ? "text-danger" : "text-dark"}`}>{amount(profit.this_month.net)}</td>
                                                <td className={`text-end ${profit.last_month.net < 0 ? "text-danger" : "text-muted"}`}>{amount(profit.last_month.net)}</td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                    <div className="border-top mt-3 pt-3">
                                        <div className="small text-muted mb-1">{t('dashYearToDate')}</div>
                                        <div className="d-flex justify-content-between small"><span>{t('dashIncome')}</span><span>{amount(profit.year_to_date.income)}</span></div>
                                        <div className="d-flex justify-content-between small"><span>{t('dashExpenses')}</span><span>{amount(profit.year_to_date.expenses)}</span></div>
                                        <div className="d-flex justify-content-between fw-semibold">
                                            <span>{t('dashNet')}</span>
                                            <span className={profit.year_to_date.net < 0 ? "text-danger" : "text-dark"}>{currency} {amount(profit.year_to_date.net)}</span>
                                        </div>
                                    </div>
                                </Panel>
                            </Col>
                        </Row>
                    )}

                    {/* What needs action: money owed both ways */}
                    {(receivables || payables) && (
                        <Row className="g-3 mb-3">
                            {receivables && (
                                <Col xl={6}>
                                    <OpenItemsPanel kind="receivables" data={receivables} currency={currency} />
                                </Col>
                            )}
                            {payables && (
                                <Col xl={6}>
                                    <OpenItemsPanel kind="payables" data={payables} currency={currency} />
                                </Col>
                            )}
                        </Row>
                    )}

                    {/* Cash */}
                    {(banks || receivables) && (
                        <Row className="g-3 mb-3">
                            {banks && (
                                <Col xl={receivables ? 5 : 8}>
                                    <Panel title={t('dashCashFlow')} subtitle={t('dashCashFlowHint')}>
                                        <MonthlyColumns currency={currency} height={240} sparseLabels emptyText={t('dashNoCashFlow')} months={banks.cash_flow.map(m => m.month)} series={[
                                            {name: t('dashMoneyIn'), color: SERIES_1, data: banks.cash_flow.map(m => m.in)},
                                            {name: t('dashMoneyOut'), color: SERIES_2, data: banks.cash_flow.map(m => m.out)},
                                        ]} />
                                    </Panel>
                                </Col>
                            )}
                            {banks && (
                                <Col md={receivables ? 6 : 12} xl={receivables ? 3 : 4}>
                                    <Panel title={t('dashBankBalances')} bodyClassName="p-0"
                                        action={<Link to={BANK_ACCOUNTS_PATH} className="small">{t('dashViewAll')}</Link>}>
                                        {banks.accounts.length === 0 ? (
                                            <div className="text-muted small p-4 text-center">
                                                {t('dashNoBanks')}{" "}
                                                <Link to={BANK_ACCOUNT_SETTINGS_PATH}>{t('bankAddAccount')}</Link>
                                            </div>
                                        ) : (
                                            <ul className="list-group list-group-flush">
                                                {banks.accounts.map(b => (
                                                    <li key={b.id} className="list-group-item px-3">
                                                        <div className="d-flex justify-content-between gap-2">
                                                            <Link to={bankRegisterPath(b.id)} className="fw-medium text-dark text-truncate">{b.account_name}</Link>
                                                            <span className={`fw-semibold flex-shrink-0 ${b.balance < 0 ? "text-danger" : "text-dark"}`}>
                                                                {b.currency_code} {amount(b.balance)}
                                                            </span>
                                                        </div>
                                                        <div className="d-flex justify-content-between gap-2 small text-muted">
                                                            <span className="text-truncate">{b.account_number}</span>
                                                            <span className="flex-shrink-0">
                                                                {b.unreconciled_count > 0
                                                                    ? t('dashUnreconciled', {count: b.unreconciled_count})
                                                                    : b.last_reconciled_at ? t('dashLastReconciled', {date: formatDate(b.last_reconciled_at)}) : ""}
                                                            </span>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </Panel>
                                </Col>
                            )}
                            {receivables && (
                                <Col md={banks ? 6 : 12} xl={banks ? 4 : 12}>
                                    <Panel title={t('dashTopCustomers')} subtitle={t('dashTopCustomersHint')}>
                                        <BarList emptyText={t('dashNoSales')} rows={receivables.top_customers.map(c => ({
                                            key: c.id,
                                            label: <Link to={`${CUSTOMERS_PATH}/${c.id}`} className="text-dark">{c.name}</Link>,
                                            value: c.amount,
                                        }))} />
                                    </Panel>
                                </Col>
                            )}
                        </Row>
                    )}
                </div>
            </SimpleBar>
        </div>
    );
};

function Header({data}: {data: DashboardSummary}) {
    const {t} = useSmartTranslation();
    const period = t(data.period.fiscal_year ? 'dashFinancialYear' : 'dashCalendarYear',
        {from: formatDate(data.period.from), to: formatDate(data.period.to)});

    return (
        <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
            <div>
                <h1 className="pg-title mb-1">{t('dashTitle')}</h1>
                <p className="text-muted mb-0 small">
                    {data.currency ? t('dashSubtitle', {currency: data.currency, date: formatDate(data.as_of)}) : formatDate(data.as_of)}
                    {" · "}{period}
                </p>
            </div>
            {/* create links disappear for roles that may not create */}
            <div className="d-flex flex-wrap gap-2 dash-actions">
                <Link to={`${INVOICES_PATH}/create`} className="btn btn-primary btn-sm">
                    <FilePlus size={14} aria-hidden />{t('dashNewInvoice')}
                </Link>
                <Link to={`${PAYMENTS_PATH}/create`} className="btn btn-outline-secondary btn-sm">
                    <ArrowDownLeft size={14} aria-hidden />{t('dashReceivePayment')}
                </Link>
                <Link to={`${BILLS_PATH}/create`} className="btn btn-outline-secondary btn-sm">
                    <FileText size={14} aria-hidden />{t('dashNewBill')}
                </Link>
                <Link to={`${SUPPLIER_PAYMENTS_PATH}/create`} className="btn btn-outline-secondary btn-sm">
                    <ArrowUpRight size={14} aria-hidden />{t('dashPaySupplier')}
                </Link>
            </div>
        </div>
    );
}

/** Receivables or payables: ageing bars, then the documents that need attention. */
function OpenItemsPanel({kind, data, currency}: {kind: "receivables" | "payables", data: Receivables | Payables, currency: string | null}) {
    const {t} = useSmartTranslation();
    const isPayables = kind === "payables";
    const docs: OpenDocument[] = isPayables ? (data as Payables).upcoming : data.most_overdue;

    return (
        <Panel
            title={t(isPayables ? 'dashPayables' : 'dashReceivables')}
            subtitle={`${currency ?? ""} ${amount(data.total)} · ${t(isPayables ? 'dashOpenBills' : 'dashOpenInvoices', {count: data.count})}`}
            action={<Link to={isPayables ? BILLS_PATH : INVOICES_PATH} className="small">{t('dashViewAll')}</Link>}>
            <Row className="g-4">
                <Col md={5}>
                    <div className="small text-muted fw-medium mb-2">{t('dashAgeing')}</div>
                    <BarList emptyText={t(isPayables ? 'dashNoBills' : 'dashNoInvoices')} color={isPayables ? SERIES_2 : SERIES_1}
                        rows={AGEING.map(b => ({
                            key: b,
                            label: t(`dashAge_${b}`),
                            value: data.ageing[b],
                            tone: b !== "current" && data.ageing[b] > 0 ? "text-danger" : undefined,
                        }))} />
                    {data.unapplied_credits > 0 && (
                        <div className="small text-muted mt-2">
                            {t(isPayables ? 'dashUnappliedSupplierCredits' : 'dashUnappliedCredits', {amount: amount(data.unapplied_credits)})}
                        </div>
                    )}
                </Col>
                <Col md={7}>
                    <div className="small text-muted fw-medium mb-2">{t(isPayables ? 'dashBillsToPay' : 'dashMostOverdue')}</div>
                    {docs.length === 0 ? (
                        <div className="text-muted small py-3 text-center">{t(isPayables ? 'dashNoBills' : 'dashNothingOverdue')}</div>
                    ) : (
                        <ul className="list-group list-group-flush dash-doc-list">
                            {docs.map(d => (
                                <li key={`${d.trans_type}-${d.id}`} className="list-group-item px-0">
                                    <div className="d-flex justify-content-between gap-2">
                                        <div className="min-w-0">
                                            <DocRef type={d.trans_type} id={d.id} reference={d.reference_no} />
                                            <div className="small text-muted text-truncate">{d.party_name}</div>
                                        </div>
                                        <div className="text-end flex-shrink-0">
                                            <div className="fw-semibold text-dark">{amount(d.amount)}</div>
                                            <DueBadge doc={d} />
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </Col>
            </Row>
        </Panel>
    );
}

function DueBadge({doc}: {doc: OpenDocument}) {
    const {t} = useSmartTranslation();
    if (doc.days_overdue > 0) {
        return (
            <Badge bg="light" className="badge-soft-danger d-inline-flex align-items-center gap-1">
                <AlertCircle size={11} aria-hidden />{t('dashDaysOverdue', {count: doc.days_overdue})}
            </Badge>
        );
    }
    return <span className="small text-muted">{doc.due_date ? t('dashDueOn', {date: formatDate(doc.due_date)}) : ""}</span>;
}

export default Dashboard;
