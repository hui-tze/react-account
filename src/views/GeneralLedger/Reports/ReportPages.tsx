import {useState} from "react";
import {Badge, Form} from "react-bootstrap";
import {CheckCircle, AlertTriangle, Edit2} from "react-feather";
import {Link} from "react-router-dom";
import type {StatementAmounts, TrialBalanceAmounts} from "@/apis/models/ledger";
import {ledgerApi} from "@/apis/requests/ledger-api";
import {ConditionalError} from "@/components/Display/ErrorBoundary";
import {useSmartTranslation} from "@/hooks/use-translation";
import {GL_CHART_SETTINGS_PATH} from "../gl-menu";
import {AccountTypeBadge, DateRangeBar, LedgerTreeTable, money, ReportPage, today, useYearToDate} from "../shared/report-ui";

const Loading = () => <div className="loader-pendulums my-5" />;

function ShowZeroSwitch({value, onChange}: {value: boolean, onChange: (v: boolean) => void}) {
    const {t} = useSmartTranslation();
    return <Form.Check type="switch" id="gl-show-zero" label={t('showZeroAccounts')} checked={value} onChange={(e) => onChange(e.target.checked)} />;
}

function BalancedBadge({balanced, difference}: {balanced: boolean, difference?: number}) {
    const {t} = useSmartTranslation();
    return balanced
        ? <Badge bg="light" className="badge-soft-success"><CheckCircle size={12} className="me-1" />{t('glBalanced')}</Badge>
        : <Badge bg="light" className="badge-soft-danger"><AlertTriangle size={12} className="me-1" />{t('glOutOfBalance', {amount: money(difference ?? 0, false)})}</Badge>;
}

/** The chart in sequence order with every account's balance at a date. */
export function GlChartOfAccounts() {
    const {t} = useSmartTranslation();
    const [asOf, setAsOf] = useState(today());
    const {data, error, isLoading} = ledgerApi.useChart(asOf || null);

    return (
        <ReportPage
            title={t('menu_ChartOfAccount')}
            subtitle={data ? t('glChartCounts', {classes: data.counts.classes, groups: data.counts.groups, accounts: data.counts.accounts}) : undefined}
            toolbar={(
                <>
                    <span className="small text-muted">{t('glBalanceAsOf')}</span>
                    <Form.Control type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} style={{width: 170}} />
                    <Link to={GL_CHART_SETTINGS_PATH} className="btn btn-sm btn-outline-primary">
                        <Edit2 size={14} className="me-1" />{t('glEditChart')}
                    </Link>
                </>
            )}
        >
            {error ? <ConditionalError error={error} /> : isLoading || !data ? <Loading /> : (
                <LedgerTreeTable
                    classes={data.classes}
                    classBadges
                    columns={[{key: "balance", label: t('balance'), width: 180}]}
                    accountExtra={(account) => (
                        <>
                            <AccountTypeBadge type={account.account_type} />
                            {account.is_control_account && <Badge bg="light" className="badge-soft-secondary ms-1">{t('controlAccount')}</Badge>}
                            {!account.allow_transaction && <Badge bg="light" className="badge-soft-secondary ms-1">{t('glNoPosting')}</Badge>}
                        </>
                    )}
                    emptyText={t('glNoChart')}
                />
            )}
        </ReportPage>
    );
}

/** Opening, period movement and closing balance per account; debits must equal credits. */
export function TrialBalance() {
    const {t} = useSmartTranslation();
    const [range, setRange] = useYearToDate();
    const [showZero, setShowZero] = useState(false);
    const {data, error, isLoading} = ledgerApi.useTrialBalance(range.from || null, range.to || null, showZero);

    const columns: {key: keyof TrialBalanceAmounts & string, label: string}[] = [
        {key: "opening_debit", label: t('glOpeningDr')},
        {key: "opening_credit", label: t('glOpeningCr')},
        {key: "debit", label: t('debit')},
        {key: "credit", label: t('credit')},
        {key: "closing_debit", label: t('glClosingDr')},
        {key: "closing_credit", label: t('glClosingCr')},
    ];

    return (
        <ReportPage
            title={t('menu_TrialBalance')}
            subtitle={<>{t('glPeriod', {from: range.from, to: range.to})} {data && <BalancedBadge balanced={data.balanced} difference={data.totals.closing_debit - data.totals.closing_credit} />}</>}
            toolbar={<><DateRangeBar range={range} onChange={setRange} /><ShowZeroSwitch value={showZero} onChange={setShowZero} /></>}
        >
            {error ? <ConditionalError error={error} /> : isLoading || !data ? <Loading /> : (
                <LedgerTreeTable
                    classes={data.classes}
                    classBadges
                    columns={columns.map(c => ({...c, width: 130}))}
                    emptyText={t('glNoPostings')}
                    footer={(
                        <tr>
                            <td>{t('grandTotal')}</td>
                            {columns.map(c => <td key={c.key} className="text-end">{money(data.totals[c.key], false)}</td>)}
                        </tr>
                    )}
                />
            )}
        </ReportPage>
    );
}

/** Income and expenses for a period, classes in sequence, ending in net profit. */
export function ProfitAndLoss() {
    const {t} = useSmartTranslation();
    const [range, setRange] = useYearToDate();
    const [showZero, setShowZero] = useState(false);
    const {data, error, isLoading} = ledgerApi.useProfitLoss(range.from || null, range.to || null, showZero);

    return (
        <ReportPage
            title={t('menu_ProfitLoss')}
            subtitle={t('glPeriod', {from: range.from, to: range.to})}
            toolbar={<><DateRangeBar range={range} onChange={setRange} /><ShowZeroSwitch value={showZero} onChange={setShowZero} /></>}
        >
            {error ? <ConditionalError error={error} /> : isLoading || !data ? <Loading /> : (
                <LedgerTreeTable<StatementAmounts>
                    classes={data.classes}
                    columns={[{key: "amount", label: t('amount'), width: 180}]}
                    emptyText={t('glNoProfitLoss')}
                    footer={(
                        <tr className={data.net_profit < 0 ? "text-danger" : undefined}>
                            <td>{data.net_profit < 0 ? t('netLoss') : t('netProfit')}</td>
                            <td className="text-end">{money(data.net_profit, false)}</td>
                        </tr>
                    )}
                />
            )}
        </ReportPage>
    );
}

/**
 * Position at a date. Profit & loss to date is shown as earnings under the last credit-normal
 * class (equity) — retained before the fiscal year, current year since — so both sides agree.
 */
export function BalanceSheet() {
    const {t} = useSmartTranslation();
    const [asOf, setAsOf] = useState(today());
    const [showZero, setShowZero] = useState(false);
    const {data, error, isLoading} = ledgerApi.useBalanceSheet(asOf || null, showZero);

    const equityClassId = data ? [...data.classes].reverse().find(c => c.normal_balance === "credit")?.id : undefined;
    const earnings = data && (
        <>
            <tr className="gl-tree-account">
                <td style={{paddingLeft: "2rem"}}>{t('retainedEarnings')}</td>
                <td className="text-end">{money(data.earnings.retained)}</td>
            </tr>
            <tr className="gl-tree-account">
                <td style={{paddingLeft: "2rem"}}>
                    {t('currentYearEarnings')}
                    {data.fiscal_year && <span className="text-muted small ms-2">{t('glSince', {date: data.fiscal_year.begin})}</span>}
                </td>
                <td className="text-end">{money(data.earnings.current)}</td>
            </tr>
        </>
    );

    return (
        <ReportPage
            title={t('menu_BalanceSheet')}
            subtitle={<>{t('glAsAt', {date: asOf})} {data && <BalancedBadge balanced={data.balanced} difference={data.difference} />}</>}
            toolbar={(
                <>
                    <span className="small text-muted">{t('glAsAtLabel')}</span>
                    <Form.Control type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} style={{width: 170}} />
                    <ShowZeroSwitch value={showZero} onChange={setShowZero} />
                </>
            )}
        >
            {error ? <ConditionalError error={error} /> : isLoading || !data ? <Loading /> : (
                <LedgerTreeTable<StatementAmounts>
                    classes={data.classes}
                    columns={[{key: "amount", label: t('amount'), width: 180}]}
                    emptyText={t('glNoBalanceSheet')}
                    afterClass={(cls) => cls.id === equityClassId ? earnings : null}
                    footer={(
                        <>
                            {equityClassId === undefined && earnings}
                            <tr>
                                <td>{t('glDebitSide')}</td>
                                <td className="text-end">{money(data.debit_side, false)}</td>
                            </tr>
                            <tr>
                                <td>{t('glCreditSide')}</td>
                                <td className="text-end">{money(data.credit_side, false)}</td>
                            </tr>
                        </>
                    )}
                />
            )}
        </ReportPage>
    );
}
