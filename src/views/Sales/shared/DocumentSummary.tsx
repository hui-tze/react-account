import {ReactNode} from "react";
import {formatQuantity, formatDate} from "@/utils/display-format";
import {Col, Container, Row, Table} from "react-bootstrap";
import {Link} from "@/components/Access/Guarded";
import SimpleBar from "simplebar-react";
import {CreditAllocation, CustomerTransDocument} from "@/apis/models/sales-document";
import {FormSectionTitle} from "@/views/Settings/shared/SettingsFormPage";
import {formatDecimal} from "@/views/Inventory/shared/options";
import {useSmartTranslation} from "@/hooks/use-translation";
import {salesDocumentPath} from "../sales-menu";

type Fact = {label: string, value: ReactNode};

/** What the summary reads of a document — customer or supplier. */
type SummaryDocument = Pick<CustomerTransDocument, "tax_included" | "subtotal" | "grand_total"> & {
    taxes?: CustomerTransDocument["taxes"],
    lines?: {id: number, item_code: string, description: string, quantity: string | number, unit_price: string | number, discount_percent?: string | number, line_total: string | number, item?: {uom: string | null} | null}[],
};

type DocumentSummaryProps = {
    document: SummaryDocument,
    currencyCode?: string,
    // where an applied document opens (default: the sales screens)
    pathOf?: (type: string, id: number) => string | null,
    // supplier side: applied to bills
    party?: "customer" | "supplier",
    banner?: ReactNode,
    facts: Fact[],
    // item lines and totals (credit notes); payments have none
    showLines?: boolean,
    // invoices the document is applied to
    allocations?: Pick<CreditAllocation, "id" | "type" | "reference_no" | "date" | "grand_total" | "amount">[],
    children?: ReactNode,
};

/** Read-only page of a posted document: key facts, lines with totals, and where it was applied. */
export function DocumentSummary({document, currencyCode, pathOf = salesDocumentPath, party = "customer", banner, facts, showLines, allocations, children}: DocumentSummaryProps) {
    const {t} = useSmartTranslation();
    const code = currencyCode ?? "";
    // supplier documents have no line discount
    const hasDiscount = (document.lines ?? []).some(line => line.discount_percent !== undefined);

    return (
        <div className="app-body">
            <SimpleBar className="nicescroll-bar">
                <Container fluid className="py-3">
                    {banner}

                    <Row className="g-3 mb-3">
                        {facts.map(fact => (
                            <Col key={fact.label} sm={6} lg={3}>
                                <div className="small text-muted">{fact.label}</div>
                                <div className="fw-semibold text-dark">{fact.value || "-"}</div>
                            </Col>
                        ))}
                    </Row>

                    {showLines && (
                        <>
                            <FormSectionTitle title={t('items')} />
                            <div className="table-responsive mb-2">
                                <Table className="align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>{t('item')}</th>
                                            <th className="text-end">{t('quantity')}</th>
                                            <th className="text-end">{document.tax_included ? t('priceInclTax') : t('price')}</th>
                                            {hasDiscount && <th className="text-end">{t('discountPercentShort')}</th>}
                                            <th className="text-end">{t('amount')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(document.lines ?? []).map(line => (
                                            <tr key={line.id}>
                                                <td><div className="fw-semibold text-dark">{line.item_code}</div><div className="small text-muted">{line.description}</div></td>
                                                <td className="text-end">{formatQuantity(line.quantity)} <span className="text-muted small">{line.item?.uom}</span></td>
                                                <td className="text-end">{formatDecimal(line.unit_price)}</td>
                                                {hasDiscount && <td className="text-end">{Number(line.discount_percent) > 0 ? `${formatDecimal(line.discount_percent ?? 0)}%` : "-"}</td>}
                                                <td className="text-end fw-semibold">{formatDecimal(line.line_total)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                            <div className="ms-auto mb-3" style={{maxWidth: 380}}>
                                <Table size="sm" borderless className="mb-0">
                                    <tbody>
                                        <tr><td className="text-muted">{t('subtotal')}</td><td className="text-end">{formatDecimal(document.subtotal)}</td></tr>
                                        {(document.taxes ?? []).map(tax => (
                                            <tr key={tax.tax_type_id}>
                                                <td className="text-muted">{document.tax_included ? t('taxIncludedLine', {name: tax.name, rate: tax.rate}) : t('taxLine', {name: tax.name, rate: tax.rate})}</td>
                                                <td className="text-end">{formatDecimal(tax.tax_amount)}</td>
                                            </tr>
                                        ))}
                                        <tr className="border-top"><td className="fw-bold pt-2">{t('total')} ({code})</td><td className="text-end fw-bold fs-5 pt-2">{formatDecimal(document.grand_total)}</td></tr>
                                    </tbody>
                                </Table>
                            </div>
                        </>
                    )}

                    {allocations && (
                        <>
                            <FormSectionTitle title={t('appliedTo')} />
                            {allocations.length === 0 ? <p className="text-muted small">{t('notAppliedYet')}</p> : (
                                <Table size="sm" className="mb-3">
                                    <thead className="table-light">
                                        <tr><th>{party === "supplier" ? t('bill') : t('invoice')}</th><th>{t('date')}</th><th className="text-end">{party === "supplier" ? t('billTotal') : t('invoiceTotal')}</th><th className="text-end">{t('applied')}</th></tr>
                                    </thead>
                                    <tbody>
                                        {allocations.map(a => {
                                            const path = pathOf(a.type, a.id);
                                            return (
                                                <tr key={a.id}>
                                                    <td>{path ? <Link to={path}>{a.reference_no}</Link> : a.reference_no}</td>
                                                    <td>{formatDate(a.date)}</td>
                                                    <td className="text-end">{formatDecimal(a.grand_total)}</td>
                                                    <td className="text-end fw-semibold">{formatDecimal(a.amount)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </Table>
                            )}
                        </>
                    )}
                    {children}
                </Container>
            </SimpleBar>
        </div>
    );
}
