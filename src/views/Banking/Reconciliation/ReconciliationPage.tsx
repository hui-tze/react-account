import {useEffect, useState} from "react";
import {useAccess} from "@/providers/access";
import {formatDate} from "@/utils/display-format";
import {Alert, Badge, Button, Card, Col, Form, Row, Spinner, Table} from "react-bootstrap";
import {CheckCircle} from "react-feather";
import {useSearchParams} from "react-router-dom";
import {ActionButton, Link} from "@/components/Access/Guarded";
import SimpleBar from "simplebar-react";
import {bankingApi} from "@/apis/requests/banking-api";
import {ConditionalError} from "@/components/Display/ErrorBoundary";
import {useNotification} from "@/hooks/notification";
import {useSmartTranslation} from "@/hooks/use-translation";
import {ledgerDocumentPath} from "@/views/GeneralLedger/gl-menu";
import {money, today} from "@/views/GeneralLedger/shared/report-ui";
import {ReconcileGuide} from "./ReconcileGuide";

/**
 * Tick the register lines that appear on a bank statement. The reconciled balance (earlier
 * statements + what is ticked here) must equal the statement's closing balance to finish.
 */
export function Reconciliation() {
    const {t} = useSmartTranslation();
    const notify = useNotification();
    const [search, setSearch] = useSearchParams();
    // refreshed after ticking / finishing so the bank account cards show the new reconciled balance and date
    const {data: accounts, mutate: refreshAccounts} = bankingApi.useAccounts({revalidateOnFocus: false});
    const accountId = search.get("account") ?? (accounts?.find(a => a.is_default) ?? accounts?.[0])?.id?.toString() ?? "";
    // ?date= opens a given statement (e.g. one started but not finished)
    const [statementDate, setStatementDate] = useState(search.get("date") ?? today());
    const [statementBalance, setStatementBalance] = useState<string>("");
    const [busy, setBusy] = useState(false);
    // ticking lines and finishing change the bank records: banking "edit"
    const {canHere} = useAccess();
    const canReconcile = canHere("edit");
    const {data: state, error, mutate} = bankingApi.useReconciliation(accountId || null, statementDate || null, {revalidateOnFocus: false});

    // reopening a finished statement prefills its closing balance
    useEffect(() => {
        if (state && statementBalance === "" && state.bank_account.last_reconciled_at === state.statement_date) {
            setStatementBalance(String(state.bank_account.ending_reconcile_balance));
        }
    }, [state, statementBalance]);

    const code = state?.bank_account.currency_code ?? "";
    const balance = statementBalance === "" ? null : Number(statementBalance);
    const difference = balance === null || !state ? null : Math.round((balance - state.reconciled_balance) * 100) / 100;
    const allTicked = !!state && state.items.length > 0 && state.items.every(i => i.reconciled);
    const finished = !!state && state.bank_account.last_reconciled_at === state.statement_date && difference === 0;

    const mark = async (ids: number[], reconciled: boolean) => {
        if (!state || !ids.length || !canReconcile) {
            return;
        }
        setBusy(true);
        try {
            await mutate(await bankingApi.mark(state.bank_account.id, state.statement_date, ids, reconciled), {revalidate: false});
            void refreshAccounts();
        } catch (err) {
            notify.error(err);
        } finally {
            setBusy(false);
        }
    };

    const finish = async () => {
        if (!state || balance === null || !canReconcile) {
            return;
        }
        setBusy(true);
        try {
            await mutate(await bankingApi.finish(state.bank_account.id, state.statement_date, balance), {revalidate: false});
            void refreshAccounts();
            notify.success(t('bankReconcileFinished', {date: state.statement_date}));
        } catch (err) {
            notify.error(err);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="app-body">
            <SimpleBar className="nicescroll-bar">
                <div className="container-fluid py-3">
                    <Row className="g-2 align-items-start mb-3">
                        <Col md={4}>
                            <Form.Label>{t('bankAccount')}</Form.Label>
                            <Form.Select value={accountId} onChange={(e) => { setSearch({account: e.target.value}); setStatementBalance(""); }}>
                                {(accounts ?? []).map(a => <option key={a.id} value={a.id}>{a.account_name} · {a.account_number} ({a.currency_code})</option>)}
                            </Form.Select>
                        </Col>
                        <Col md={4}>
                            <Form.Label>{t('bankStatementDate')}</Form.Label>
                            <Form.Control type="date" value={statementDate} onChange={(e) => { setStatementDate(e.target.value); setStatementBalance(""); }} />
                            <Form.Text className="d-block">{t('bankStatementDateHint')}</Form.Text>
                        </Col>
                        <Col md={4}>
                            <Form.Label>{t('bankStatementBalance')}{code ? ` (${code})` : ""}</Form.Label>
                            <Form.Control type="number" step="0.01" className="text-end" value={statementBalance} onChange={(e) => setStatementBalance(e.target.value)}
                                placeholder="0.00" style={{width: 300}} />
                            <Form.Text className="d-block">{t('bankStatementBalanceHint')}</Form.Text>
                        </Col>
                        {!!state?.statements.length && (
                            <Col md={4}>
                                <Form.Label>{t('bankPreviousStatements')}</Form.Label>
                                <Form.Select value="" onChange={(e) => { if (e.target.value) { setStatementDate(e.target.value); setStatementBalance(""); } }}>
                                    <option value="">{t('pleaseSelect')}</option>
                                    {state.statements.map(d => <option key={d} value={d}>{d}</option>)}
                                </Form.Select>
                            </Col>
                        )}
                    </Row>

                    {error ? <ConditionalError error={error} /> : !state ? <div className="loader-pendulums mt-10" /> : (
                        <>
                            <ReconcileGuide balanceEntered={balance !== null} anyTicked={state.items.some(i => i.reconciled)} balanced={difference === 0} finished={finished} />

                            <div className="gl-summary-strip mb-3">
                                <div><div className="small text-muted">{t('bankLastStatement')}</div>
                                    <div className="fw-semibold text-dark">{state.bank_account.last_reconciled_at
                                        ? `${state.bank_account.last_reconciled_at} · ${code} ${money(state.bank_account.ending_reconcile_balance, false)}` : t('bankNever')}</div></div>
                                <div><div className="small text-muted">{t('bankOpeningReconciled')}</div><div className="fw-semibold text-dark">{money(state.opening_reconciled, false)}</div></div>
                                <div><div className="small text-muted">{t('bankClearedNow')}</div><div className="fw-semibold text-dark">{money(state.cleared, false)}</div></div>
                                <div><div className="small text-muted">{t('bankReconciledBalance')}</div><div className="fs-5 fw-bold text-dark">{code} {money(state.reconciled_balance, false)}</div></div>
                                <div><div className="small text-muted">{t('bankDifference')}</div>
                                    <div className={`fs-5 fw-bold ${difference === null ? "text-muted" : difference === 0 ? "text-success" : "text-danger"}`}>
                                        {difference === null ? "—" : money(difference, false)}
                                    </div></div>
                                <div className="ms-auto align-self-center d-flex gap-2">
                                    {busy && <Spinner animation="border" size="sm" className="align-self-center" />}
                                    <ActionButton action="edit" variant="primary" disabled={busy || difference !== 0} onClick={finish} title={difference !== 0 ? t('bankFinishHint') : undefined}>
                                        <CheckCircle size={14} className="me-1" />{t('bankFinishReconciliation')}
                                    </ActionButton>
                                </div>
                            </div>
                            <p className="small text-muted">{t('bankBookBalanceAt', {date: state.statement_date})}: {code} {money(state.book_balance, false)}</p>
                            {/* ticking saves each line, but only Finish records the statement on the account */}
                            {state.bank_account.last_reconciled_at !== state.statement_date && state.items.some(item => item.reconciled) && (
                                <Alert variant="warning" className="py-2 small">
                                    {t('bankStatementNotFinished', {date: state.statement_date, balance: `${code ?? ""} ${money(state.reconciled_balance, false)}`})}
                                </Alert>
                            )}

                            <Card className="card-border">
                                <Card.Body className="p-0">
                                    <Table size="sm" hover className="mb-0 align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="ps-3" style={{width: 40}}>
                                                    <Form.Check type="checkbox" aria-label={t('bankTickAll')} checked={allTicked} disabled={busy || !canReconcile || !state.items.length}
                                                        onChange={() => mark(state.items.filter(i => i.reconciled === allTicked).map(i => i.id), !allTicked)} />
                                                </th>
                                                <th>{t('date')}</th>
                                                <th>{t('referenceNo')}</th>
                                                <th>{t('bankPartyOrPayee')}</th>
                                                <th className="text-end">{t('bankMoneyIn')}</th>
                                                <th className="text-end pe-3">{t('bankMoneyOut')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {state.items.length === 0 && (
                                                <tr><td colSpan={6} className="text-center text-muted py-4">{t('bankNothingToReconcile')}</td></tr>
                                            )}
                                            {state.items.map(item => {
                                                const path = ledgerDocumentPath(item.trans_type, item.trans_id);
                                                return (
                                                    <tr key={item.id} className={item.reconciled ? "table-success" : undefined} role="button" onClick={() => !busy && mark([item.id], !item.reconciled)}>
                                                        <td className="ps-3" onClick={(e) => e.stopPropagation()}>
                                                            <Form.Check type="checkbox" aria-label={item.reference_no} checked={item.reconciled} disabled={busy || !canReconcile}
                                                                onChange={() => mark([item.id], !item.reconciled)} />
                                                        </td>
                                                        <td>{formatDate(item.trans_date)}</td>
                                                        <td onClick={(e) => e.stopPropagation()}>
                                                            {path ? <Link to={path} className="fw-semibold">{item.reference_no}</Link> : <span className="fw-semibold">{item.reference_no}</span>}
                                                            <div className="small text-muted">{item.trans_type_label}</div>
                                                        </td>
                                                        <td>{item.party_name}</td>
                                                        <td className="text-end">{money(item.money_in)}</td>
                                                        <td className="text-end pe-3">{money(item.money_out)}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                            {difference !== null && difference !== 0 && (
                                <Alert variant="warning" className="small py-2 mt-3">{t('bankDifferenceHint', {amount: money(difference, false)})}</Alert>
                            )}
                            {finished && (
                                <Badge bg="light" className="badge-soft-success mt-3">{t('bankStatementReconciled')}</Badge>
                            )}
                        </>
                    )}
                </div>
            </SimpleBar>
        </div>
    );
}
