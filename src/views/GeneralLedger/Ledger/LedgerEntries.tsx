import {useCallback, useEffect, useState} from "react";
import {DocRef} from "@/views/Documents/DocumentPreview";
import {Badge, Col, Form, Row} from "react-bootstrap";
import type {SWRResponse} from "swr";
import type {PaginationResponse} from "@/apis/pagination";
import {useSearchParams} from "react-router-dom";
import type {LedgerEntry, LedgerSummary} from "@/apis/models/ledger";
import {ledgerApi} from "@/apis/requests/ledger-api";
import {useGetAllAccountClass} from "@/apis/requests/account-class-api";
import {useAccountOptions} from "@/views/Settings/shared/options";
import SettingsListPage from "@/views/Settings/shared/SettingsListPage";
import {SearchBox} from "@/views/Sales/shared/SearchBox";
import {AccountTypeOptions} from "@/constants/AccountType";
import {useSmartTranslation} from "@/hooks/use-translation";
import {ledgerDocumentPath} from "../gl-menu";
import {money} from "../shared/report-ui";

type Filters = {
    account_id: string,
    account_class_id: string,
    account_type: string,
    trans_type: string,
    date_from: string,
    date_to: string,
    q: string,
    include_voided: string,
};

/** Opening, movement and closing of the selected account. */
function SummaryStrip({summary}: {summary: LedgerSummary}) {
    const {t} = useSmartTranslation();
    const facts = [
        {label: t('openingBalance'), value: money(summary.opening, false)},
        {label: t('debit'), value: money(summary.debit, false)},
        {label: t('credit'), value: money(summary.credit, false)},
        {label: t('closingBalance'), value: money(summary.closing, false), strong: true},
    ];
    return (
        <div className="gl-summary-strip mb-3">
            {facts.map(f => (
                <div key={f.label}>
                    <div className="small text-muted">{f.label}</div>
                    <div className={f.strong ? "fs-5 fw-bold text-dark" : "fw-semibold text-dark"}>{f.value}</div>
                </div>
            ))}
            <div className="ms-auto align-self-center">
                <Badge bg="light" className={summary.normal_balance === "credit" ? "badge-soft-warning" : "badge-soft-info"}>
                    {t(summary.normal_balance === "credit" ? 'normalCredit' : 'normalDebit')}
                </Badge>
            </div>
        </div>
    );
}

/** Every posting, filterable; one account selected turns it into that account's ledger with a running balance. */
export function LedgerEntries() {
    const {t} = useSmartTranslation();
    const [search] = useSearchParams();
    const [filters, setFilters] = useState<Filters>({
        account_id: search.get("account_id") ?? "",
        account_class_id: "",
        account_type: "",
        trans_type: search.get("trans_type") ?? "",
        date_from: search.get("date_from") ?? "",
        date_to: search.get("date_to") ?? "",
        q: "",
        include_voided: "",
    });
    const [summary, setSummary] = useState<LedgerSummary | null>(null);
    const accounts = useAccountOptions();
    const {data: classes} = useGetAllAccountClass();
    const {data: transTypes} = ledgerApi.useTransTypes();
    const set = (key: keyof Filters) => (value: string) => setFilters(f => ({...f, [key]: value}));
    const byAccount = !!filters.account_id;

    // the table calls this as a hook with its paging params; the summary of the page comes along
    const useFetcher = useCallback((params: URLSearchParams) => {
        const query = new URLSearchParams(params);
        Object.entries(filters).forEach(([key, value]) => {
            if (value) {
                query.set(key, value);
            }
        });
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const response = ledgerApi.useEntries(query);
        const pageSummary = response.data?.summary ?? null;
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => setSummary(pageSummary), [pageSummary]);
        // the table only reads data / meta; the extra summary is handled above
        return response as unknown as SWRResponse<PaginationResponse<LedgerEntry>>;
    }, [filters]);

    return (
        <SettingsListPage<LedgerEntry>
            useFetcher={useFetcher}
            tableKey={String(byAccount)}
            editPath={(row) => ledgerDocumentPath(row.trans_type, row.trans_id) ?? "#"}
            canClickRow={(row) => !!ledgerDocumentPath(row.trans_type, row.trans_id)}
            rowClassName={(row) => row.status === "inactive" ? "gl-row-voided" : undefined}
            toolbar={(
                <>
                    <Row className="g-2 py-3 align-items-center">
                        <Col md={4}>
                            <Form.Select value={filters.account_id} onChange={(e) => set("account_id")(e.target.value)} aria-label={t('account')}>
                                <option value="">{t('glAllAccounts')}</option>
                                {accounts.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </Form.Select>
                        </Col>
                        <Col md="auto">
                            <Form.Select value={filters.account_class_id} onChange={(e) => set("account_class_id")(e.target.value)} aria-label={t('accountClass')}>
                                <option value="">{t('glAllClasses')}</option>
                                {[...(classes ?? [])].sort((a, b) => a.sequence - b.sequence || a.code.localeCompare(b.code))
                                    .map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </Form.Select>
                        </Col>
                        <Col md="auto">
                            <Form.Select value={filters.account_type} onChange={(e) => set("account_type")(e.target.value)} aria-label={t('accountType')}>
                                <option value="">{t('glAllAccountTypes')}</option>
                                {AccountTypeOptions.map(o => <option key={String(o.value)} value={String(o.value)}>{t(o.label)}</option>)}
                            </Form.Select>
                        </Col>
                        <Col md="auto">
                            <Form.Select value={filters.trans_type} onChange={(e) => set("trans_type")(e.target.value)} aria-label={t('documentType')}>
                                <option value="">{t('einvAllTypes')}</option>
                                {(transTypes ?? []).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </Form.Select>
                        </Col>
                    </Row>
                    <Row className="g-2 pb-3 align-items-center">
                        <Col md={4}>
                            <SearchBox value={filters.q} onChange={set("q")} placeholder={t('glSearchEntries')} />
                        </Col>
                        <Col md="auto" className="d-flex align-items-center gap-2">
                            <Form.Control type="date" value={filters.date_from} onChange={(e) => set("date_from")(e.target.value)} aria-label={t('dateFrom')} />
                            <span className="text-muted">–</span>
                            <Form.Control type="date" value={filters.date_to} onChange={(e) => set("date_to")(e.target.value)} aria-label={t('dateTo')} />
                        </Col>
                        <Col md="auto">
                            <Form.Check type="switch" id="gl-include-voided" label={t('glIncludeVoided')} checked={!!filters.include_voided}
                                onChange={(e) => set("include_voided")(e.target.checked ? "1" : "")} />
                        </Col>
                    </Row>
                    {byAccount && summary && <SummaryStrip summary={summary} />}
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
                {accessor: "account_code", title: t('account'), hidden: byAccount, render: (row) => (
                    <>
                        <span className="text-muted small me-1">{row.account_code}</span>{row.account_name}
                        <div className="small text-muted">{row.class_name}</div>
                    </>
                )},
                {accessor: "memo", title: t('description'), render: (row) => (
                    <>
                        {row.party_name && <div className="text-dark">{row.party_name}</div>}
                        {row.memo && <div className="small text-muted">{row.memo}</div>}
                        {row.status === "inactive" && <Badge bg="light" className="badge-soft-danger">{t('salesState_voided')}</Badge>}
                    </>
                )},
                {accessor: "debit", title: t('debit'), tdClasses: "text-end", render: (row) => money(row.debit)},
                {accessor: "credit", title: t('credit'), tdClasses: "text-end", render: (row) => money(row.credit)},
                {accessor: "balance", title: t('balance'), tdClasses: "text-end fw-semibold", hidden: !byAccount,
                    render: (row) => row.balance === undefined ? "" : money(row.balance, false)},
            ]}
        />
    );
}
