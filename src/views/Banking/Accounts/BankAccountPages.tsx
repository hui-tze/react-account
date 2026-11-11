import {useCallback, useEffect, useState} from "react";
import {DocRef} from "@/views/Documents/DocumentPreview";
import {Badge, Card, Col, Form, Row} from "react-bootstrap";
import {CheckSquare, List, Settings} from "react-feather";
import {useParams} from "react-router-dom";
import {Link} from "@/components/Access/Guarded";
import SimpleBar from "simplebar-react";
import type {SWRResponse} from "swr";
import type {BankRegisterRow, BankRegisterSummary} from "@/apis/models/banking";
import type {PaginationResponse} from "@/apis/pagination";
import {bankingApi} from "@/apis/requests/banking-api";
import {ConditionalError} from "@/components/Display/ErrorBoundary";
import SettingsListPage from "@/views/Settings/shared/SettingsListPage";
import {SearchBox} from "@/views/Sales/shared/SearchBox";
import {useSmartTranslation} from "@/hooks/use-translation";
import {ledgerDocumentPath} from "@/views/GeneralLedger/gl-menu";
import {money} from "@/views/GeneralLedger/shared/report-ui";
import {BANK_ACCOUNT_SETTINGS_PATH, bankReconcilePath, bankRegisterPath} from "../banking-menu";

const Loading = () => <div className="loader-pendulums mt-10" />;

/** Every bank account with its balance, reconciliation status and shortcuts. */
export function BankAccounts() {
    const {t} = useSmartTranslation();
    const {data: accounts, error} = bankingApi.useAccounts();

    if (error) {
        return <ConditionalError error={error} />;
    }
    if (!accounts) {
        return <Loading />;
    }

    return (
        <div className="app-body">
            <SimpleBar className="nicescroll-bar">
                <div className="container-fluid py-3">
                    {accounts.length === 0 && (
                        <Card className="card-border text-center p-5">
                            <p className="text-muted">{t('bankNoAccounts')}</p>
                            <div><Link to={BANK_ACCOUNT_SETTINGS_PATH} className="btn btn-primary btn-sm">{t('bankAddAccount')}</Link></div>
                        </Card>
                    )}
                    <Row className="g-3">
                        {accounts.map(account => (
                            <Col key={account.id} md={6} xl={4}>
                                <Card className={`card-border h-100 bank-account-card ${account.status !== "active" ? "opacity-50" : ""}`}>
                                    <Card.Body className="d-flex flex-column">
                                        <div className="d-flex align-items-start gap-2 mb-3">
                                            <div className="flex-grow-1 min-w-0">
                                                <h6 className="mb-0 text-truncate">{account.account_name}</h6>
                                                <div className="small text-muted">{account.account_number} · {t(`bankType_${account.type}`)}</div>
                                            </div>
                                            <Badge bg="light" className="badge-soft-primary">{account.currency_code}</Badge>
                                            {account.is_default && <Badge bg="light" className="badge-soft-secondary">{t('defaultCompany')}</Badge>}
                                        </div>
                                        <div className="small text-muted">{t('bankBookBalance')}</div>
                                        <div className={`bank-account-balance ${account.balance < 0 ? "text-danger" : ""}`}>
                                            {account.currency_code} {money(account.balance, false)}
                                        </div>
                                        <div className="d-flex flex-wrap gap-3 small mt-2 mb-3">
                                            <span><span className="text-muted">{t('bankReconciledBalance')}:</span> {money(account.reconciled_balance, false)}</span>
                                            <span><span className="text-muted">{t('bankLastReconciled')}:</span> {account.last_reconciled_at ?? t('bankNever')}</span>
                                            {account.open_statement_date && (
                                                <Link to={`${bankReconcilePath(account.id)}&date=${account.open_statement_date}`} className="badge badge-soft-danger text-decoration-none">
                                                    {t('bankStatementInProgress', {date: account.open_statement_date})}
                                                </Link>
                                            )}
                                            {account.unreconciled_count > 0 && (
                                                <Badge bg="light" className="badge-soft-warning">{t('bankUnreconciledCount', {count: account.unreconciled_count})}</Badge>
                                            )}
                                        </div>
                                        <div className="small text-muted mb-3">{t('bankGlAccount')}: {account.gl_account}</div>
                                        <div className="d-flex gap-2 mt-auto">
                                            <Link to={bankRegisterPath(account.id)} className="btn btn-sm btn-outline-primary"><List size={14} className="me-1" />{t('bankRegister')}</Link>
                                            <Link to={bankReconcilePath(account.id)} className="btn btn-sm btn-outline-secondary"><CheckSquare size={14} className="me-1" />{t('menu_Reconciliation')}</Link>
                                            <Link to={`${BANK_ACCOUNT_SETTINGS_PATH}/${account.id}`} className="btn btn-sm btn-flush-dark ms-auto" title={t('edit')}><Settings size={14} /></Link>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            </SimpleBar>
        </div>
    );
}

/** One account's register: every movement with a running balance in the account's currency. */
export function BankAccountRegister() {
    const {t} = useSmartTranslation();
    const {id = ""} = useParams();
    const {data: accounts} = bankingApi.useAccounts({revalidateOnFocus: false});
    const account = accounts?.find(a => String(a.id) === id);
    const [filters, setFilters] = useState({q: "", date_from: "", date_to: "", reconciled: "", include_voided: ""});
    const [summary, setSummary] = useState<BankRegisterSummary | null>(null);
    const set = (key: keyof typeof filters) => (value: string) => setFilters(f => ({...f, [key]: value}));

    const useFetcher = useCallback((params: URLSearchParams) => {
        const query = new URLSearchParams(params);
        Object.entries(filters).forEach(([k, v]) => {
            if (v) {
                query.set(k, v);
            }
        });
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const response = bankingApi.useRegister(id, query);
        const pageSummary = response.data?.summary ?? null;
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => setSummary(pageSummary), [pageSummary]);
        return response as unknown as SWRResponse<PaginationResponse<BankRegisterRow>>;
    }, [id, filters]);

    const code = summary?.currency_code ?? account?.currency_code ?? "";

    return (
        <SettingsListPage<BankRegisterRow>
            useFetcher={useFetcher}
            editPath={(row) => ledgerDocumentPath(row.trans_type, row.trans_id) ?? "#"}
            canClickRow={(row) => !!ledgerDocumentPath(row.trans_type, row.trans_id)}
            rowClassName={(row) => row.status === "inactive" ? "gl-row-voided" : undefined}
            toolbar={(
                <>
                    <div className="d-flex flex-wrap align-items-center gap-2 pt-3">
                        <h5 className="mb-0 me-2">{account?.account_name}</h5>
                        <span className="text-muted small">{account?.account_number}</span>
                        <Link to={bankReconcilePath(Number(id))} className="btn btn-sm btn-outline-secondary ms-auto"><CheckSquare size={14} className="me-1" />{t('menu_Reconciliation')}</Link>
                    </div>
                    <Row className="g-2 py-3 align-items-center">
                        <Col md={3}><SearchBox value={filters.q} onChange={set("q")} placeholder={t('referenceNo')} /></Col>
                        <Col md="auto" className="d-flex align-items-center gap-2">
                            <Form.Control type="date" value={filters.date_from} onChange={(e) => set("date_from")(e.target.value)} aria-label={t('dateFrom')} />
                            <span className="text-muted">–</span>
                            <Form.Control type="date" value={filters.date_to} onChange={(e) => set("date_to")(e.target.value)} aria-label={t('dateTo')} />
                        </Col>
                        <Col md="auto">
                            <Form.Select value={filters.reconciled} onChange={(e) => set("reconciled")(e.target.value)} aria-label={t('menu_Reconciliation')}>
                                <option value="">{t('bankAllLines')}</option>
                                <option value="no">{t('bankUnreconciled')}</option>
                                <option value="yes">{t('bankReconciled')}</option>
                            </Form.Select>
                        </Col>
                        <Col md="auto">
                            <Form.Check type="switch" id="bank-include-voided" label={t('glIncludeVoided')} checked={!!filters.include_voided}
                                onChange={(e) => set("include_voided")(e.target.checked ? "1" : "")} />
                        </Col>
                    </Row>
                    {summary && (
                        <div className="gl-summary-strip mb-3">
                            {[
                                {label: t('openingBalance'), value: summary.opening},
                                {label: t('bankMoneyIn'), value: summary.money_in},
                                {label: t('bankMoneyOut'), value: summary.money_out},
                            ].map(f => (
                                <div key={f.label}><div className="small text-muted">{f.label}</div><div className="fw-semibold text-dark">{code} {money(f.value, false)}</div></div>
                            ))}
                            <div><div className="small text-muted">{t('closingBalance')}</div><div className="fs-5 fw-bold text-dark">{code} {money(summary.closing, false)}</div></div>
                        </div>
                    )}
                </>
            )}
            columns={[
                {accessor: "trans_date", title: t('date'), width: 110},
                {accessor: "reference_no", title: t('referenceNo'), render: (row) => (
                    <>
                        <DocRef type={row.trans_type} id={row.trans_id ?? row.id} reference={row.reference_no} />
                        <div className="small text-muted">{row.trans_type_label}</div>
                    </>
                )},
                {accessor: "party_name", title: t('bankPartyOrPayee'), render: (row) => (
                    <>
                        {row.party_name}
                        {row.status === "inactive" && <Badge bg="light" className="badge-soft-danger ms-1">{t('salesState_voided')}</Badge>}
                    </>
                )},
                {accessor: "money_in", title: t('bankMoneyIn'), tdClasses: "text-end", render: (row) => money(row.money_in)},
                {accessor: "money_out", title: t('bankMoneyOut'), tdClasses: "text-end", render: (row) => money(row.money_out)},
                {accessor: "balance", title: t('balance'), tdClasses: "text-end fw-semibold", render: (row) => row.balance === undefined ? "" : money(row.balance, false)},
                {accessor: "reconciled_date", title: t('bankReconciled'), render: (row) => row.reconciled_date
                    ? <Badge bg="light" className="badge-soft-success">{row.reconciled_date.slice(0, 10)}</Badge>
                    : <span className="text-muted small">—</span>},
            ]}
        />
    );
}
