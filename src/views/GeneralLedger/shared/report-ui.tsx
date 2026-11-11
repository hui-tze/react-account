import {Fragment, ReactNode, useState} from "react";
import {Badge, Button, ButtonGroup, Card, Form, Table} from "react-bootstrap";
import {ChevronDown, ChevronRight, Printer} from "react-feather";
import {Link} from "@/components/Access/Guarded";
import SimpleBar from "simplebar-react";
import moment from "moment";
import type {LedgerTreeAccount, LedgerTreeClass, LedgerTreeGroup} from "@/apis/models/ledger";
import {formatDecimal} from "@/views/Inventory/shared/options";
import {useSmartTranslation} from "@/hooks/use-translation";
import {getAccountTypeLabel} from "@/constants/AccountType";
import {accountLedgerPath} from "../gl-menu";

/** Report money: negatives (abnormal balances) in brackets, zero as a dash. */
export function money(value: number | string | null | undefined, blankZero = true): string {
    const n = Number(value ?? 0);
    if (blankZero && Math.abs(n) < 0.005) {
        return "-";
    }
    return n < 0 ? `(${formatDecimal(-n)})` : formatDecimal(n);
}

export const today = () => moment().format("YYYY-MM-DD");

type Range = {from: string, to: string};

/** Common periods for report toolbars. */
function presets(t: (k: string) => string): {label: string, range: () => Range}[] {
    const fmt = (m: moment.Moment) => m.format("YYYY-MM-DD");
    return [
        {label: t('periodThisMonth'), range: () => ({from: fmt(moment().startOf("month")), to: fmt(moment().endOf("month"))})},
        {label: t('periodLastMonth'), range: () => ({from: fmt(moment().subtract(1, "month").startOf("month")), to: fmt(moment().subtract(1, "month").endOf("month"))})},
        {label: t('periodThisYear'), range: () => ({from: fmt(moment().startOf("year")), to: fmt(moment().endOf("year"))})},
        {label: t('periodLastYear'), range: () => ({from: fmt(moment().subtract(1, "year").startOf("year")), to: fmt(moment().subtract(1, "year").endOf("year"))})},
    ];
}

export function useYearToDate(): [Range, (r: Range) => void] {
    return useState<Range>({from: moment().startOf("year").format("YYYY-MM-DD"), to: today()});
}

/** From / to dates with quick period buttons. */
export function DateRangeBar({range, onChange}: {range: Range, onChange: (r: Range) => void}) {
    const {t} = useSmartTranslation();
    return (
        <div className="d-flex flex-wrap align-items-center gap-2">
            <Form.Control type="date" value={range.from} onChange={(e) => onChange({...range, from: e.target.value})} aria-label={t('dateFrom')} style={{width: 160}} />
            <span className="text-muted">–</span>
            <Form.Control type="date" value={range.to} onChange={(e) => onChange({...range, to: e.target.value})} aria-label={t('dateTo')} style={{width: 160}} />
            <ButtonGroup size="sm">
                {presets(t).map(p => (
                    <Button key={p.label} variant="outline-secondary" onClick={() => onChange(p.range())}>{p.label}</Button>
                ))}
            </ButtonGroup>
        </div>
    );
}

/** Report page: toolbar (filters + print) above a printable card. */
export function ReportPage({title, subtitle, toolbar, children}: {title: string, subtitle?: ReactNode, toolbar?: ReactNode, children: ReactNode}) {
    const {t} = useSmartTranslation();
    return (
        <div className="app-body">
            <SimpleBar className="nicescroll-bar">
                <div className="container-fluid py-3">
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-3 d-print-none">
                        {toolbar}
                        <Button variant="outline-secondary" size="sm" className="ms-auto" onClick={() => window.print()}>
                            <Printer size={14} className="me-1" />{t('print')}
                        </Button>
                    </div>
                    <Card className="card-border gl-report">
                        <Card.Body>
                            <div className="gl-report-head">
                                <h4 className="mb-0">{title}</h4>
                                {subtitle && <div className="text-muted small">{subtitle}</div>}
                            </div>
                            {children}
                        </Card.Body>
                    </Card>
                </div>
            </SimpleBar>
        </div>
    );
}

export function ClassBadges({normalBalance, statement}: {normalBalance: string, statement?: string}) {
    const {t} = useSmartTranslation();
    return (
        <>
            <Badge bg="light" className={normalBalance === "credit" ? "badge-soft-warning" : "badge-soft-info"}>
                {t(normalBalance === "credit" ? 'normalCredit' : 'normalDebit')}
            </Badge>
            {statement && (
                <Badge bg="light" className="badge-soft-secondary">
                    {t(statement === "profit_loss" ? 'statementProfitLoss' : 'statementBalanceSheet')}
                </Badge>
            )}
        </>
    );
}

export type TreeColumn<T> = {
    key: keyof T & string,
    label: string,
    // defaults to money()
    render?: (value: number, row: T) => ReactNode,
    width?: number,
};

type TreeTableProps<T> = {
    classes: LedgerTreeClass<T>[],
    columns: TreeColumn<T>[],
    // show each class's normal balance / statement badges
    classBadges?: boolean,
    // extra cells after the account name (e.g. account type)
    accountExtra?: (account: LedgerTreeAccount<T>) => ReactNode,
    // rows after a class's total (e.g. earnings on the balance sheet)
    afterClass?: (cls: LedgerTreeClass<T>) => ReactNode,
    emptyText?: string,
    // grand totals under the table
    footer?: ReactNode,
};

/**
 * Class → group (nested) → account table in sequence order, with group and class subtotals.
 * Groups collapse to their total; account names link to the account's ledger.
 */
export function LedgerTreeTable<T>({classes, columns, classBadges, accountExtra, afterClass, emptyText, footer}: TreeTableProps<T>) {
    const {t} = useSmartTranslation();
    const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
    const toggle = (id: number) => setCollapsed(prev => {
        const next = new Set(prev);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        return next;
    });

    const cells = (values: T, className = "") => columns.map(col => (
        <td key={col.key} className={`text-end ${className}`} style={col.width ? {width: col.width} : undefined}>
            {col.render ? col.render(Number(values[col.key] ?? 0), values) : money(values[col.key] as unknown as number)}
        </td>
    ));

    const renderGroup = (group: LedgerTreeGroup<T>, depth: number): ReactNode => {
        const isCollapsed = collapsed.has(group.id);
        const hasChildren = group.accounts.length > 0 || group.groups.length > 0;
        return (
            <Fragment key={`g${group.id}`}>
                <tr className="gl-tree-group" onClick={() => hasChildren && toggle(group.id)}>
                    <td style={{paddingLeft: `${0.75 + depth * 1.25}rem`}}>
                        <span className="d-inline-flex align-items-center gap-1">
                            {hasChildren ? (isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />) : <span style={{width: 14}} />}
                            <span className="text-muted small me-1">{group.code}</span>{group.name}
                        </span>
                    </td>
                    {isCollapsed ? cells(group.totals, "fw-semibold") : columns.map(col => <td key={col.key} />)}
                </tr>
                {!isCollapsed && (
                    <>
                        {group.accounts.map(account => (
                            <tr key={`a${account.id}`} className={account.status === "inactive" ? "gl-tree-account text-muted" : "gl-tree-account"}>
                                <td style={{paddingLeft: `${2 + depth * 1.25}rem`}}>
                                    <Link to={accountLedgerPath(account.id)} className="text-reset">
                                        <span className="text-muted small me-2">{account.code}</span>{account.name}
                                    </Link>
                                    {accountExtra?.(account)}
                                </td>
                                {cells(account as unknown as T)}
                            </tr>
                        ))}
                        {group.groups.map(child => renderGroup(child, depth + 1))}
                        {hasChildren && (
                            <tr className="gl-tree-subtotal">
                                <td style={{paddingLeft: `${0.75 + depth * 1.25}rem`}}>{t('totalOf', {name: group.name})}</td>
                                {cells(group.totals)}
                            </tr>
                        )}
                    </>
                )}
            </Fragment>
        );
    };

    if (!classes.length) {
        return <p className="text-muted mb-0 py-4 text-center">{emptyText ?? t('noData')}</p>;
    }

    return (
        <div className="table-responsive">
            <Table size="sm" className="gl-tree mb-0">
                <thead>
                    <tr>
                        <th>{t('account')}</th>
                        {columns.map(col => <th key={col.key} className="text-end" style={col.width ? {width: col.width} : undefined}>{col.label}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {classes.map(cls => (
                        <Fragment key={`c${cls.id}`}>
                            <tr className="gl-tree-class">
                                <td colSpan={columns.length + 1}>
                                    <span className="d-inline-flex align-items-center gap-2">
                                        {cls.name}
                                        {classBadges && <ClassBadges normalBalance={cls.normal_balance} statement={cls.financial_statement} />}
                                    </span>
                                </td>
                            </tr>
                            {cls.groups.map(group => renderGroup(group, 0))}
                            <tr className="gl-tree-class-total">
                                <td>{t('totalOf', {name: cls.name})}</td>
                                {cells(cls.totals)}
                            </tr>
                            {afterClass?.(cls)}
                        </Fragment>
                    ))}
                </tbody>
                {footer && <tfoot className="gl-tree-footer">{footer}</tfoot>}
            </Table>
        </div>
    );
}

/** Account type as a small badge (bank, cash, tax…). */
export function AccountTypeBadge({type}: {type: string}) {
    const {t} = useSmartTranslation();
    if (!type || type === "normal") {
        return null;
    }
    return <Badge bg="light" className="badge-soft-primary ms-2">{t(getAccountTypeLabel(type))}</Badge>;
}
