import {Card, Col, Row} from "react-bootstrap";
import {CreditCard, FileText} from "react-feather";
import {Link} from "@/components/Access/Guarded";
import {Customer} from "@/apis/models/customer";
import {useGetCustomerOpenItems} from "@/apis/requests/sales-billing-api";
import {formatDecimal} from "@/views/Inventory/shared/options";
import {useSmartTranslation} from "@/hooks/use-translation";
import {INVOICES_PATH, PAYMENTS_PATH} from "../sales-menu";

/** What the customer owes right now, with shortcuts to bill or receive. */
export function AccountSummary({customer}: {customer: Customer}) {
    const {t} = useSmartTranslation();
    const {data} = useGetCustomerOpenItems(customer.id);
    const limit = Number(customer.credit_limit);
    const owed = (data?.invoices ?? []).reduce((sum, i) => sum + i.open, 0);

    const tile = (label: string, value: string, tone?: string) => (
        <Col sm={6} lg={3}>
            <div className="small text-muted">{label}</div>
            <div className={`fs-5 fw-semibold ${tone ?? "text-dark"}`}>{value}</div>
        </Col>
    );

    return (
        <Card className="border-0 bg-light mb-3">
            <Card.Body className="py-3">
                <Row className="g-3 align-items-center">
                    {tile(t('outstandingInvoices'), formatDecimal(owed))}
                    {tile(t('overdue'), formatDecimal(data?.overdue ?? 0), (data?.overdue ?? 0) > 0 ? "text-danger" : undefined)}
                    {tile(t('unappliedCredit'), formatDecimal(data?.unallocated ?? 0))}
                    {tile(t('creditAvailable'), limit > 0 ? formatDecimal(limit - (data?.balance ?? 0)) : t('noLimit'),
                        limit > 0 && limit - (data?.balance ?? 0) < 0 ? "text-danger" : undefined)}
                </Row>
                <div className="d-flex gap-2 mt-3">
                    <Link to={`${INVOICES_PATH}/create`} className="btn btn-outline-primary btn-sm"><FileText size={14} className="me-1" />{t('newInvoice')}</Link>
                    <Link to={`${PAYMENTS_PATH}/create`} className="btn btn-outline-primary btn-sm"><CreditCard size={14} className="me-1" />{t('receivePayment')}</Link>
                </div>
            </Card.Body>
        </Card>
    );
}
