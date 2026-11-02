import {useState} from "react";
import {Button, Col, Row} from "react-bootstrap";
import {Truck} from "react-feather";
import {Control, FieldValues, useFormState, useWatch} from "react-hook-form";
import type {SalesOrderRequest} from "@/apis/requests/sales-order-api";
import {useGetInventoryLocationOptions} from "@/apis/requests/inventory-location-api";
import {useGetShippingCompanyOptions} from "@/apis/requests/sales-lookup-api";
import {SelectField, TextField} from "@/components/FormField/FormFields";
import {useSmartTranslation} from "@/hooks/use-translation";
import {DocCard} from "./DocCard";

type DeliverySectionProps<T extends FieldValues> = {
    // any form with the order's delivery fields (order, quotation, direct invoice / delivery)
    control: Control<T>,
    // orders ship from a location; quotations may leave it open
    locationRequired?: boolean,
    // delivery notes keep no contact email
    showEmail?: boolean,
    readOnly?: boolean,
    // inline under a "Ship to" heading (invoice layout) instead of a card
    plain?: boolean,
};

const DELIVERY_FIELDS = ["inventory_location_id", "shipping_company_id", "deliver_to", "delivery_address", "contact_no", "contact_email"];

/**
 * Where the goods come from and go to — a collapsible card. The branch fills these in,
 * so closed it shows a one-line summary; it opens by itself when something needs attention.
 */
export function DeliverySection<T extends FieldValues>(props: DeliverySectionProps<T>) {
    // react-hook-form can't resolve paths on an open generic, so work on the order's field names
    const {control, locationRequired, showEmail = true, readOnly, plain} = props as unknown as DeliverySectionProps<SalesOrderRequest>;
    const {t} = useSmartTranslation();
    const {data: locations} = useGetInventoryLocationOptions();
    const {data: shippers} = useGetShippingCompanyOptions();
    const [locationId, shipperId, deliverTo, address] = useWatch({control, name: ["inventory_location_id", "shipping_company_id", "deliver_to", "delivery_address"]});
    const {errors} = useFormState({control});

    const locationOptions = (locations ?? []).map(l => ({value: l.id, label: `${l.code} - ${l.name}`}));
    const shipperOptions = (shippers ?? []).map(s => ({value: s.id, label: s.name}));

    const summary = [
        locations?.find(l => l.id === locationId)?.name,
        shippers?.find(s => s.id === shipperId)?.name,
        [deliverTo, address?.address1, address?.city].filter(Boolean).join(", "),
    ].filter(Boolean).join(" · ") || t('noDeliveryDetails');
    const hasError = DELIVERY_FIELDS.some(field => (errors as Record<string, unknown>)[field]);
    const [open, setOpen] = useState(!!locationRequired && !locationId);

    const fields = (
        <Row className="gx-3">
            <Col sm={6}>
                <SelectField control={control} name="inventory_location_id" label={t('deliverFrom')} options={locationOptions} numeric placeholder=""
                    required={locationRequired} disabled={readOnly} />
            </Col>
            <Col sm={6}>
                <SelectField control={control} name="shipping_company_id" label={t('shippingCompany')} options={shipperOptions} numeric placeholder="" disabled={readOnly} />
            </Col>
            <Col sm={6}>
                <TextField control={control} name="deliver_to" label={t('deliverTo')} maxLength={255} disabled={readOnly} />
            </Col>
            <Col sm={6}>
                <TextField control={control} name="contact_no" label={t('contactNo')} maxLength={50} disabled={readOnly} />
            </Col>
            <Col sm={12}>
                <TextField control={control} name="delivery_address.address1" label={t('addressLine1')} disabled={readOnly} />
            </Col>
            <Col sm={12}>
                <TextField control={control} name="delivery_address.address2" label={t('addressLine2')} disabled={readOnly} />
            </Col>
            <Col sm={6} lg={3}>
                <TextField control={control} name="delivery_address.postcode" label={t('postcode')} maxLength={20} disabled={readOnly} />
            </Col>
            <Col sm={6} lg={3}>
                <TextField control={control} name="delivery_address.city" label={t('city')} disabled={readOnly} />
            </Col>
            <Col sm={6} lg={3}>
                <TextField control={control} name="delivery_address.state" label={t('state')} disabled={readOnly} />
            </Col>
            <Col sm={6} lg={3}>
                <TextField control={control} name="delivery_address.country" label={t('country')} disabled={readOnly} />
            </Col>
            {showEmail && (
                <Col sm={12}>
                    <TextField control={control} name="contact_email" label={t('contactEmail')} type="email" disabled={readOnly}
                        rules={{pattern: {value: /^\S+@\S+\.\S+$/, message: t('invalidEmail')}}} />
                </Col>
            )}
        </Row>
    );

    if (plain) {
        const shown = open || hasError;
        return (
            <div className="invoice-doc-shipto">
                <p className="text-muted mb-1">{summary}</p>
                <Button variant="link" size="sm" className="p-0 mb-2" onClick={() => setOpen(!shown)}>
                    {shown ? t('hideDeliveryDetails') : t(readOnly ? 'showDeliveryDetails' : 'editDeliveryDetails')}
                </Button>
                {shown && fields}
            </div>
        );
    }

    return (
        <DocCard
            icon={Truck}
            title={t('delivery')}
            collapsible
            // a document still missing its warehouse starts open
            defaultOpen={!!locationRequired && !locationId}
            forceOpen={hasError}
            summary={summary}
        >
            {fields}
        </DocCard>
    );
}
