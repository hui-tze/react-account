import {useEffect} from "react";
import {Badge, Col, Form, Row} from "react-bootstrap";
import {Control, Controller, FieldValues, UseFormGetValues, UseFormSetValue, useWatch} from "react-hook-form";
import {Customer, CustomerBranch} from "@/apis/models/customer";
import type {DocumentDeliveryAddress} from "@/apis/models/sales-document";
import {useGetCustomerOptions} from "@/apis/requests/customer-api";
import {useGetCustomerBranches} from "@/apis/requests/customer-branch-api";
import {useGetSalesPersonOptions} from "@/apis/requests/sales-lookup-api";
import {useGetSalesTypeOptions} from "@/apis/requests/sales-type-api";
import {useGetPaymentTermOptions} from "@/apis/requests/payment-term-api";
import {useGetCreditStatusOptions} from "@/apis/requests/credit-status-api";
import {useGetCurrencyOptions} from "@/apis/requests/currency-api";
import {SelectField} from "@/components/FormField/FormFields";
import {formatDecimal} from "@/views/Inventory/shared/options";
import {useSmartTranslation} from "@/hooks/use-translation";
import {CustomerPicker} from "./CustomerPicker";
import {toDeliveryAddress} from "./sales-form";

/** The fields this section reads and fills — any sales document form has them. */
export type PartyValues = {
    customer_id: number | null,
    branch_id: number | null,
    sales_type_id: number | null,
    payment_term_id: number | null,
    sales_person_id: number | null,
    inventory_location_id: number | null,
    shipping_company_id: number | null,
    exchange_rate: number | null,
    deliver_to: string | null,
    delivery_address: DocumentDeliveryAddress,
};

type PartySectionProps<T extends FieldValues> = {
    control: Control<T>,
    setValue: UseFormSetValue<T>,
    getValues: UseFormGetValues<T>,
    // which credit rule applies: orders and invoices can be blocked by credit status
    creditCheck: "order" | "invoice" | "none",
    // saved ids, so inactive choices stay visible
    saved?: {sales_type_id?: number | null, payment_term_id?: number | null, sales_person_id?: number | null},
    readOnly?: boolean,
    // customer can't change (e.g. already delivered / converted)
    lockCustomer?: boolean,
    // credit notes have no payment terms or salesperson of their own
    showTerms?: boolean,
    showSalesPerson?: boolean,
};

const activeOptions = <R extends {id: number, status: string}>(rows: R[] | undefined, selected: number | null | undefined, label: (r: R) => string) =>
    (rows ?? []).filter(r => r.status === "active" || r.id === selected).map(r => ({value: r.id, label: label(r)}));

/**
 * Customer, branch, price list, terms and salesperson, with the customer's credit at a glance.
 * Picking a customer applies its terms and lands on its first branch; picking a branch applies
 * the branch's price list, salesperson, warehouse, shipper and delivery address. Defaults are
 * applied only on a user's pick, never over a saved document's values.
 */
export function PartySection<T extends FieldValues>(props: PartySectionProps<T>) {
    // react-hook-form can't resolve paths on an open generic, so work on the slice type
    const {control, setValue, getValues, creditCheck, saved, readOnly, lockCustomer, showTerms = true, showSalesPerson = true} = props as unknown as PartySectionProps<PartyValues>;
    const {t} = useSmartTranslation();
    const customerId = useWatch({control, name: "customer_id"});

    const {data: customers} = useGetCustomerOptions();
    const {data: branches} = useGetCustomerBranches(customerId);
    const {data: salesTypes} = useGetSalesTypeOptions();
    const {data: terms} = useGetPaymentTermOptions();
    const {data: salesPersons} = useGetSalesPersonOptions();
    const {data: creditStatuses} = useGetCreditStatusOptions();
    const {data: currencies} = useGetCurrencyOptions();

    const customer = customers?.find(c => c.id === customerId);
    const currency = currencies?.find(c => c.id === customer?.currency_id);
    const creditStatus = creditStatuses?.find(s => s.id === customer?.credit_status_id);
    const blocked = creditStatus && (creditCheck === "order" ? !creditStatus.allow_order : creditCheck === "invoice" ? !creditStatus.allow_invoice : false);

    const applyBranch = (branch: CustomerBranch) => {
        setValue("sales_type_id", branch.sales_type_id ?? getValues("sales_type_id"));
        setValue("sales_person_id", branch.sales_person_id);
        setValue("inventory_location_id", branch.location_id);
        setValue("shipping_company_id", branch.shipping_id);
        setValue("deliver_to", branch.name);
        setValue("delivery_address", toDeliveryAddress(branch.addresses?.find(a => a.is_primary) ?? branch.addresses?.[0]));
    };

    const applyCustomer = (picked: Customer | undefined) => {
        setValue("branch_id", null);
        if (picked) {
            setValue("payment_term_id", picked.payment_terms_id);
            setValue("exchange_rate", null);
        }
    };

    // a freshly picked customer lands on its first active branch (with that branch's defaults)
    useEffect(() => {
        if (readOnly || !branches || getValues("branch_id")) {
            return;
        }
        const first = branches.find(b => b.status === "active");
        if (first) {
            setValue("branch_id", first.id);
            applyBranch(first);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [branches]);

    return (
        <>
            <Row className="gx-3">
                <Col md={7}>
                    <CustomerPicker control={control} name="customer_id" customers={customers ?? []} label={t('customer')}
                        disabled={readOnly || lockCustomer} onPicked={applyCustomer} />
                </Col>
                <Col md={5}>
                    <Controller
                        control={control}
                        name="branch_id"
                        rules={{required: '*' + t('required')}}
                        render={({field, fieldState}) => (
                            <Form.Group className="mb-3">
                                <Form.Label className="require-label">{t('branch')}</Form.Label>
                                <Form.Select
                                    value={field.value ?? ""}
                                    isInvalid={!!fieldState.error}
                                    disabled={readOnly || lockCustomer || !customerId}
                                    onBlur={field.onBlur}
                                    onChange={(e) => {
                                        const id = e.target.value ? Number(e.target.value) : null;
                                        field.onChange(id);
                                        const branch = branches?.find(b => b.id === id);
                                        if (branch) {
                                            applyBranch(branch);
                                        }
                                    }}
                                >
                                    <option value="">{t('pleaseSelect')}</option>
                                    {(branches ?? []).filter(b => b.status === "active" || b.id === field.value).map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">{fieldState.error?.message}</Form.Control.Feedback>
                            </Form.Group>
                        )}
                    />
                </Col>
            </Row>

            {customer && (
                <div className={`sales-credit-strip ${blocked ? "is-blocked" : ""}`}>
                    <span>
                        <span className="label">{t('creditStatus')}</span>
                        <Badge bg="light" className={blocked ? "badge-soft-danger" : "badge-soft-success"}>{creditStatus?.name ?? "-"}</Badge>
                    </span>
                    <span><span className="label">{t('creditLimit')}</span>{Number(customer.credit_limit) > 0 ? formatDecimal(customer.credit_limit) : t('noLimit')}</span>
                    <span><span className="label">{t('discountShort')}</span>{formatDecimal(customer.default_discount)}%</span>
                    <span><span className="label">{t('currency')}</span><span className="fw-semibold">{currency?.code ?? "-"}</span></span>
                    {blocked && <span className="text-danger fw-semibold w-100">{t(creditCheck === "order" ? 'customerOnHoldOrders' : 'customerOnHoldInvoices')}</span>}
                </div>
            )}

            <Row className="gx-3">
                <Col sm={showTerms || showSalesPerson ? 4 : 12}>
                    <SelectField control={control} name="sales_type_id" label={t('priceList')} numeric required placeholder="" disabled={readOnly || lockCustomer}
                        options={activeOptions(salesTypes, saved?.sales_type_id, s => s.tax_included ? `${s.name} (${t('inclTax')})` : s.name)} />
                </Col>
                {showTerms && (
                    <Col sm={4}>
                        <SelectField control={control} name="payment_term_id" label={t('paymentTerms')} numeric required placeholder="" disabled={readOnly}
                            options={activeOptions(terms, saved?.payment_term_id, p => p.name)} />
                    </Col>
                )}
                {showSalesPerson && (
                    <Col sm={4}>
                        <SelectField control={control} name="sales_person_id" label={t('salesPerson')} numeric placeholder="" disabled={readOnly}
                            options={activeOptions(salesPersons, saved?.sales_person_id, p => p.name)} />
                    </Col>
                )}
            </Row>
        </>
    );
}
