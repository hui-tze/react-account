import {ReactNode} from "react";
import {Col, Row} from "react-bootstrap";
import {Edit2} from "react-feather";
import {Link} from "react-router-dom";
import type {CompanyAddress, CompanyContact} from "@/apis/models/company";
import {useGetOwnUserProfile} from "@/apis/requests/user-profile-api";
import {useGetOneCompany} from "@/apis/requests/company-api";
import {useGetOneCustomer} from "@/apis/requests/customer-api";
import {useSmartTranslation} from "@/hooks/use-translation";
import {ORGANIZATION_PROFILE_PATH} from "@/views/Settings/Organization/Profile";
import {CUSTOMERS_PATH} from "../sales-menu";

/** Primary (or first) address as printable lines. */
function addressLines(addresses?: CompanyAddress[] | null): string[] {
    const address = (addresses ?? []).find(a => a.is_primary) ?? addresses?.[0];
    if (!address) {
        return [];
    }
    return [
        address.address1,
        address.address2,
        address.address3,
        [address.postcode, address.city].filter(Boolean).join(" "),
        [address.state, address.country].filter(Boolean).join(", "),
    ].filter((line): line is string => !!line && line.trim() !== "");
}

function firstContact(contacts?: CompanyContact[] | null) {
    const people = (contacts ?? []).map(c => c.person).filter(Boolean);
    return {
        phone: people.map(p => p?.phone).find(Boolean) ?? null,
        email: people.map(p => p?.email).find(Boolean) ?? null,
    };
}

/** Name, registration, address and contact block (our company or the customer). */
function PartyBlock({name, ids, lines, phone, email}: {name?: string | null, ids: (string | null)[], lines: string[], phone?: string | null, email?: string | null}) {
    return (
        <div className="invoice-doc-party">
            <h6 className="mb-1">{name}</h6>
            {ids.filter(Boolean).length > 0 && <p className="invoice-doc-party-ids">{ids.filter(Boolean).join(" · ")}</p>}
            {lines.map(line => <p key={line}>{line}</p>)}
            {phone && <p>{phone}</p>}
            {email && <p>{email}</p>}
        </div>
    );
}

/** Our business details at the top of the document, as they print. */
export function BusinessInfo() {
    const {t} = useSmartTranslation();
    const {data: profile} = useGetOwnUserProfile({revalidateOnFocus: false});
    const {data: company} = useGetOneCompany(profile?.company_id, {revalidateOnFocus: false});

    if (!company) {
        return <div className="invoice-doc-party text-muted small">…</div>;
    }
    const contact = firstContact(company.contacts);

    return (
        <>
            <div className="invoice-doc-eyebrow">{t('invoiceFrom')}</div>
            <PartyBlock
                name={company.name}
                ids={[
                    company.registration_no ? `${t('registrationNoShort')} ${company.registration_no}` : null,
                    company.tin ? `${t('tin')} ${company.tin}` : null,
                    company.tax_no ? `${t('sstNo')} ${company.tax_no}` : null,
                ]}
                lines={addressLines(company.addresses)}
                phone={contact.phone}
                email={contact.email}
            />
            <Link to={ORGANIZATION_PROFILE_PATH} className="d-inline-flex align-items-center small mt-1">
                <Edit2 size={12} className="me-1" />{t('editInfo')}
            </Link>
        </>
    );
}

/** The billed customer's printable details, under the customer picker. */
export function CustomerInfo({customerId}: {customerId: number | null | undefined}) {
    const {t} = useSmartTranslation();
    const {data: customer} = useGetOneCustomer(customerId || null, {revalidateOnFocus: false});

    if (!customerId || !customer) {
        return null;
    }
    const contact = firstContact(customer.contacts);

    return (
        <div className="invoice-doc-billto">
            <PartyBlock
                name={customer.name}
                ids={[
                    customer.tin ? `${t('tin')} ${customer.tin}` : null,
                    customer.registration_no ? `${t('registrationNoShort')} ${customer.registration_no}` : null,
                ]}
                lines={addressLines(customer.addresses)}
                phone={contact.phone}
                email={contact.email}
            />
            <Link to={`${CUSTOMERS_PATH}/${customerId}`} target="_blank" className="d-inline-flex align-items-center small mt-1">
                <Edit2 size={12} className="me-1" />{t('editInfo')}
            </Link>
        </div>
    );
}

type InvoiceDocLayoutProps = {
    // big document title, e.g. "Invoice"
    title: string,
    // under the title: number / status
    subtitle?: ReactNode,
    // reference, dates, terms… shown as label / value rows
    meta: ReactNode,
    billTo: ReactNode,
    shipTo?: ReactNode,
    itemsTitle: string,
    itemsHint?: string,
    items: ReactNode,
    // left of the totals: notes, e-invoice
    notes: ReactNode,
    totals: ReactNode,
};

/**
 * A sales document laid out like the printed invoice: business details and the document
 * header on top, billed-to / ship-to, the item table, then notes beside the totals.
 */
export function InvoiceDocLayout({title, subtitle, meta, billTo, shipTo, itemsTitle, itemsHint, items, notes, totals}: InvoiceDocLayoutProps) {
    const {t} = useSmartTranslation();

    return (
        <div className="invoice-doc p-md-5 p-3">
            <Row className="gy-4">
                <Col lg={6}>
                    <BusinessInfo />
                </Col>
                <Col lg={6} xxl={5} className="offset-xxl-1">
                    <div className="invoice-doc-title-wrap">
                        <h2 className="invoice-doc-title">{title}</h2>
                        {subtitle}
                    </div>
                    <div className="invoice-doc-meta">{meta}</div>
                </Col>
            </Row>

            <div className="separator separator-light" />

            <Row className="gy-4">
                <Col lg={6}>
                    <h6 className="invoice-doc-heading">{t('billedTo')}</h6>
                    {billTo}
                </Col>
                {shipTo && (
                    <Col lg={6} xxl={5} className="offset-xxl-1">
                        <h6 className="invoice-doc-heading">{t('shipTo')}</h6>
                        {shipTo}
                    </Col>
                )}
            </Row>

            <div className="invoice-doc-items mt-5">
                <div className="d-flex flex-wrap align-items-baseline gap-2 mb-2">
                    <h6 className="invoice-doc-heading mb-0">{itemsTitle}</h6>
                    {itemsHint && <span className="small text-muted">{itemsHint}</span>}
                </div>
                {items}
            </div>

            <Row className="mt-4 gy-4">
                <Col lg={6} className="order-2 order-lg-1">
                    {notes}
                </Col>
                <Col lg={6} xxl={5} className="offset-xxl-1 order-1 order-lg-2">
                    <div className="invoice-doc-totals">{totals}</div>
                </Col>
            </Row>
        </div>
    );
}
