import {useCallback, useState} from "react";
import {formatDate} from "@/utils/display-format";
import {DocRef} from "@/views/Documents/DocumentPreview";
import {Badge, Card, Form, Table} from "react-bootstrap";
import {Link} from "@/components/Access/Guarded";
import type {TaxDetailRow} from "@/apis/models/ledger";
import {ledgerApi} from "@/apis/requests/ledger-api";
import {ConditionalError} from "@/components/Display/ErrorBoundary";
import {AutoGenerateRemoteTable} from "@/components/@hk-data-table/tables";
import {useSmartTranslation} from "@/hooks/use-translation";
import {accountLedgerPath, ledgerDocumentPath} from "../gl-menu";
import {DateRangeBar, money, ReportPage, useYearToDate} from "../shared/report-ui";

const NO_FILTERS = {};

/** Output and input tax per tax type, the tax accounts in the ledger, and the documents behind them. */
export function TaxReport() {
    const {t} = useSmartTranslation();
    const [range, setRange] = useYearToDate();
    const [taxTypeId, setTaxTypeId] = useState("");
    const [direction, setDirection] = useState("");
    const {data, error, isLoading} = ledgerApi.useTaxSummary(range.from || null, range.to || null);

    const useFetcher = useCallback((params: URLSearchParams) => {
        const query = new URLSearchParams(params);
        Object.entries({date_from: range.from, date_to: range.to, tax_type_id: taxTypeId, direction}).forEach(([k, v]) => {
            if (v) {
                query.set(k, v);
            }
        });
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return ledgerApi.useTaxDetails(query);
    }, [range, taxTypeId, direction]);

    return (
        <ReportPage
            title={t('menu_AllTaxes')}
            subtitle={t('glPeriod', {from: formatDate(range.from), to: formatDate(range.to)})}
            toolbar={<DateRangeBar range={range} onChange={setRange} />}
        >
            {error ? <ConditionalError error={error} /> : isLoading || !data ? <div className="loader-pendulums my-5" /> : (
                <>
                    <div className="table-responsive mb-4">
                        <Table size="sm" className="gl-tree mb-0">
                            <thead>
                                <tr>
                                    <th>{t('taxType')}</th>
                                    <th className="text-end">{t('taxOutputTaxable')}</th>
                                    <th className="text-end">{t('taxOutput')}</th>
                                    <th className="text-end">{t('taxInputTaxable')}</th>
                                    <th className="text-end">{t('taxInput')}</th>
                                    <th className="text-end">{t('taxNetPayable')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.taxes.length === 0 && (
                                    <tr><td colSpan={6} className="text-center text-muted py-4">{t('glNoTax')}</td></tr>
                                )}
                                {data.taxes.map(tax => (
                                    <tr key={tax.tax_type_id} className="gl-tree-account" role="button" onClick={() => setTaxTypeId(String(tax.tax_type_id))}>
                                        <td>
                                            <span className="fw-semibold text-dark me-2">{tax.code}</span>{tax.name}
                                            {tax.einv_tax_type && <Badge bg="light" className="badge-soft-secondary ms-2">MyInvois {tax.einv_tax_type}</Badge>}
                                        </td>
                                        <td className="text-end">{money(tax.output_taxable)}</td>
                                        <td className="text-end">{money(tax.output_tax)}</td>
                                        <td className="text-end">{money(tax.input_taxable)}</td>
                                        <td className="text-end">{money(tax.input_tax)}</td>
                                        <td className="text-end fw-semibold">{money(tax.net_payable, false)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="gl-tree-footer">
                                <tr>
                                    <td>{t('total')}</td>
                                    <td className="text-end">{money(data.totals.output_taxable, false)}</td>
                                    <td className="text-end">{money(data.totals.output_tax, false)}</td>
                                    <td className="text-end">{money(data.totals.input_taxable, false)}</td>
                                    <td className="text-end">{money(data.totals.input_tax, false)}</td>
                                    <td className="text-end">{money(data.totals.net_payable, false)}</td>
                                </tr>
                            </tfoot>
                        </Table>
                    </div>

                    {data.accounts.length > 0 && (
                        <Card className="card-border mb-4">
                            <Card.Header className="fw-semibold">{t('glTaxAccounts')}</Card.Header>
                            <Card.Body className="p-0">
                                <Table size="sm" className="mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="ps-3">{t('account')}</th>
                                            <th className="text-end">{t('debit')}</th>
                                            <th className="text-end">{t('credit')}</th>
                                            <th className="text-end pe-3">{t('glNetCredit')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.accounts.map(a => (
                                            <tr key={a.id}>
                                                <td className="ps-3"><Link to={accountLedgerPath(a.id)}><span className="text-muted small me-2">{a.code}</span>{a.name}</Link></td>
                                                <td className="text-end">{money(a.debit)}</td>
                                                <td className="text-end">{money(a.credit)}</td>
                                                <td className="text-end pe-3 fw-semibold">{money(a.net_credit, false)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    )}

                    <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                        <h6 className="mb-0 me-auto">{t('glTaxDocuments')}</h6>
                        <Form.Select size="sm" value={taxTypeId} onChange={(e) => setTaxTypeId(e.target.value)} style={{width: 220}} aria-label={t('taxType')}>
                            <option value="">{t('glAllTaxTypes')}</option>
                            {data.taxes.map(tax => <option key={tax.tax_type_id} value={tax.tax_type_id}>{tax.code} - {tax.name}</option>)}
                        </Form.Select>
                        <Form.Select size="sm" value={direction} onChange={(e) => setDirection(e.target.value)} style={{width: 180}}>
                            <option value="">{t('taxOutputAndInput')}</option>
                            <option value="output">{t('taxOutput')}</option>
                            <option value="input">{t('taxInput')}</option>
                        </Form.Select>
                    </div>
                    <AutoGenerateRemoteTable<TaxDetailRow>
                        useFetcher={useFetcher}
                        params={NO_FILTERS}
                        hover
                        canClickRow={() => false}
                        columns={[
                            {accessor: "trans_date", title: t('date')},
                            {accessor: "reference_no", title: t('referenceNo'), render: (row) => {
                                const path = ledgerDocumentPath(row.trans_type, row.trans_id);
                                return (
                                    <>
                                        {path ? <DocRef type={row.trans_type} id={row.trans_id} reference={row.reference_no} className="fw-semibold" /> : <span className="fw-semibold">{row.reference_no}</span>}
                                        <div className="small text-muted">{row.trans_type_label}</div>
                                    </>
                                );
                            }},
                            {accessor: "party_name", title: t('glParty')},
                            {accessor: "tax_code", title: t('taxType'), render: (row) => (
                                <>
                                    {row.tax_code} <span className="text-muted small">{row.rate}%</span>
                                    <div><Badge bg="light" className={row.direction === "output" ? "badge-soft-info" : "badge-soft-warning"}>
                                        {row.direction === "output" ? t('taxOutput') : t('taxInput')}
                                    </Badge></div>
                                </>
                            )},
                            {accessor: "taxable", title: t('taxTaxable'), tdClasses: "text-end", render: (row) => money(row.taxable, false)},
                            {accessor: "tax", title: t('taxAmount'), tdClasses: "text-end fw-semibold", render: (row) => money(row.tax, false)},
                        ]}
                    />
                </>
            )}
        </ReportPage>
    );
}
