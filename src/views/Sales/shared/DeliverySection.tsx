import {useState} from "react";
import {Button, Col, Form, Row} from "react-bootstrap";
import {Control, FieldValues, UseFormSetValue, useFormState, useWatch} from "react-hook-form";
import type {CompanyAddress} from "@/apis/models/company";
import type {DocumentDeliveryAddress} from "@/apis/models/sales-document";
import type {SalesOrderRequest} from "@/apis/requests/sales-order-api";
import {useGetCustomerBranches} from "@/apis/requests/customer-branch-api";
import {useGetInventoryLocationOptions} from "@/apis/requests/inventory-location-api";
import {useGetShippingCompanyOptions} from "@/apis/requests/sales-lookup-api";
import {SelectField, TextField} from "@/components/FormField/FormFields";
import {useSmartTranslation} from "@/hooks/use-translation";
import {DocCard} from "./DocCard";
import {EMPTY_DELIVERY_ADDRESS, toDeliveryAddress} from "./sales-form";

const ADDRESS_PARTS = ["address1", "address2", "address3", "postcode", "city", "state", "country"] as const;
const DELIVERY_FIELDS = ["deliver_to", "delivery_address", "contact_no", "contact_email"];

export const sameAddress = (a: DocumentDeliveryAddress | undefined, b: DocumentDeliveryAddress) =>
    ADDRESS_PARTS.every(part => (a?.[part] ?? "").trim() === (b[part] ?? "").trim());

export const addressLine = (address: CompanyAddress | DocumentDeliveryAddress | undefined) =>
    [address?.address1, address?.address2, address?.address3, [address?.postcode, address?.city].filter(Boolean).join(" "), address?.state]
        .filter(Boolean).join(", ");

export type DeliveryAddressState = ReturnType<typeof useDeliveryAddress>;

/**
 * Whether the goods go to the branch's billing (primary) address. While they do, the delivery
 * address card stays hidden; unticking "Deliver to the billing address" clears the address and
 * opens the card, ticking it again copies the billing address back in.
 */
export function useDeliveryAddress<T extends FieldValues>(control: Control<T>, setValue: UseFormSetValue<T>) {
    // react-hook-form can't resolve paths on an open generic, so work on the order's field names
    const form = control as unknown as Control<SalesOrderRequest>;
    const set = setValue as unknown as UseFormSetValue<SalesOrderRequest>;
    const [customerId, branchId, address] = useWatch({control: form, name: ["customer_id", "branch_id", "delivery_address"]});
    const {errors} = useFormState({control: form});
    const {data: branches} = useGetCustomerBranches(customerId);
    // unticked by the user: keep the card open even while the address happens to match
    const [differs, setDiffers] = useState(false);

    const branch = branches?.find(b => b.id === branchId);
    const billing = branch?.addresses?.find(a => a.is_primary) ?? branch?.addresses?.[0];
    // until the branch has loaded, assume the saved address is the billing one
    const same = !differs && (!branch || sameAddress(address, toDeliveryAddress(billing)));
    const hasError = DELIVERY_FIELDS.some(field => (errors as Record<string, unknown>)[field]);

    const setSame = (value: boolean) => {
        setDiffers(!value);
        if (value) {
            set("deliver_to", branch?.name ?? null);
            set("delivery_address", toDeliveryAddress(billing));
        } else {
            set("deliver_to", null);
            set("contact_no", null);
            set("delivery_address", {...EMPTY_DELIVERY_ADDRESS});
        }
    };

    return {
        hasBranch: !!branchId,
        billing,
        same,
        // the delivery address card is on screen
        shown: !!branchId && (!same || hasError),
        setSame,
    };
}

/** "Deliver to the billing address" tick with the billing address under it — at the foot of the customer card. */
export function DeliverToBillingCheck({delivery, readOnly}: {delivery: DeliveryAddressState, readOnly?: boolean}) {
    const {t} = useSmartTranslation();
    if (!delivery.hasBranch) {
        return null;
    }
    return (
        <div className="doc-card-foot">
            <Form.Check type="checkbox" id="deliver-to-billing" className="mb-1" label={t('deliverToBilling')}
                checked={delivery.same} disabled={readOnly} onChange={(e) => delivery.setSame(e.target.checked)} />
            <div className="small text-muted">
                {t('billingAddress')}: {addressLine(delivery.billing) || t('noBillingAddress')}
            </div>
            {delivery.shown && <div className="small fw-semibold text-primary mt-1">{t('deliveryAddressBelow')} ↓</div>}
        </div>
    );
}

/** Deliver from (warehouse) and shipping company — two columns for the details card. */
export function DeliveryFromFields<T extends FieldValues>({control, locationRequired, readOnly}: {control: Control<T>, locationRequired?: boolean, readOnly?: boolean}) {
    const form = control as unknown as Control<SalesOrderRequest>;
    const {t} = useSmartTranslation();
    const {data: locations} = useGetInventoryLocationOptions();
    const {data: shippers} = useGetShippingCompanyOptions();

    return (
        <>
            <Col sm={12}>
                <SelectField control={form} name="inventory_location_id" label={t('deliverFrom')} numeric placeholder="" required={locationRequired} disabled={readOnly}
                    options={(locations ?? []).map(l => ({value: l.id, label: `${l.code} - ${l.name}`}))} />
            </Col>
            <Col sm={12}>
                <SelectField control={form} name="shipping_company_id" label={t('shippingCompany')} numeric placeholder="" disabled={readOnly}
                    options={(shippers ?? []).map(s => ({value: s.id, label: s.name}))} />
            </Col>
        </>
    );
}

type DeliverySectionProps<T extends FieldValues> = {
    // any form with the order's delivery fields (order, quotation, direct invoice / delivery)
    control: Control<T>,
    delivery: DeliveryAddressState,
    // delivery notes keep no contact email
    showEmail?: boolean,
    readOnly?: boolean,
};

/** "2b · Delivery address" — only on screen while the goods go somewhere other than the billing address. */
export function DeliverySection<T extends FieldValues>({control, delivery, showEmail = true, readOnly}: DeliverySectionProps<T>) {
    const form = control as unknown as Control<SalesOrderRequest>;
    const {t} = useSmartTranslation();
    if (!delivery.shown) {
        return null;
    }

    return (
        <DocCard
            sub
            title={t('deliveryAddress')}
            hint={t('deliveryAddressHint')}
            actions={!readOnly && (
                <Button variant="link" size="sm" className="p-0" onClick={() => delivery.setSame(true)}>{t('useBillingAddress')}</Button>
            )}
        >
            <Row className="gx-4">
                <Col md={6}>
                    <TextField control={form} name="deliver_to" label={t('deliverTo')} maxLength={255} disabled={readOnly} placeholder={t('siteOrCompanyName')} />
                </Col>
                <Col md={6}>
                    <TextField control={form} name="delivery_address.recipient_name" label={t('contactPerson')} maxLength={255} disabled={readOnly} placeholder={t('nameOnSite')} />
                </Col>
                <Col md={6}>
                    <TextField control={form} name="delivery_address.address1" label={t('addressLine1')} disabled={readOnly} />
                </Col>
                <Col md={6}>
                    <TextField control={form} name="delivery_address.address2" label={t('addressLine2')} disabled={readOnly} placeholder={t('optional')} />
                </Col>
                <Col sm={6} lg={3}>
                    <TextField control={form} name="delivery_address.postcode" label={t('postcode')} maxLength={20} disabled={readOnly} />
                </Col>
                <Col sm={6} lg={3}>
                    <TextField control={form} name="delivery_address.city" label={t('city')} disabled={readOnly} />
                </Col>
                <Col sm={6} lg={3}>
                    <TextField control={form} name="delivery_address.state" label={t('state')} disabled={readOnly} />
                </Col>
                <Col sm={6} lg={3}>
                    <TextField control={form} name="delivery_address.country" label={t('country')} disabled={readOnly} />
                </Col>
                <Col md={6}>
                    <TextField control={form} name="contact_no" label={t('contactNo')} maxLength={50} disabled={readOnly} />
                </Col>
                {showEmail && (
                    <Col md={6}>
                        <TextField control={form} name="contact_email" label={t('contactEmail')} type="email" disabled={readOnly}
                            rules={{pattern: {value: /^\S+@\S+\.\S+$/, message: t('invalidEmail')}}} />
                    </Col>
                )}
            </Row>
        </DocCard>
    );
}
