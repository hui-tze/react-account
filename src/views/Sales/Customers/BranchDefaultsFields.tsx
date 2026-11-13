import {Col, Row} from "react-bootstrap";
import {Control, FieldValues, Path} from "react-hook-form";
import {useGetSalesTypeOptions} from "@/apis/requests/sales-type-api";
import {useGetSalesAreaOptions} from "@/apis/requests/sales-area-api";
import {useGetSalesGroupOptions} from "@/apis/requests/sales-group-api";
import {useGetTaxGroupOptions} from "@/apis/requests/tax-group-api";
import {useGetInventoryLocationOptions} from "@/apis/requests/inventory-location-api";
import {useGetSalesPersonOptions, useGetShippingCompanyOptions} from "@/apis/requests/sales-lookup-api";
import {CustomerBranchDefaults} from "@/apis/requests/customer-branch-api";
import {SelectField} from "@/components/FormField/FormFields";
import {FormSectionTitle} from "@/views/Settings/shared/SettingsFormPage";
import {useAccountOptions} from "@/views/Settings/shared/options";
import {useSmartTranslation} from "@/hooks/use-translation";

type Option = {id: number, status: string};

/** Active options plus the currently saved value, so an inactive default stays visible. */
function activeOptions<T extends Option>(rows: T[] | undefined, selected: number | null | undefined, label: (row: T) => string) {
    return (rows ?? [])
        .filter(r => r.status === "active" || r.id === selected)
        .map(r => ({value: r.id, label: label(r)}));
}

type BranchDefaultsFieldsProps<T extends FieldValues> = {
    control: Control<T>,
    // "" for a branch form, "branch." for the first branch inside the new-customer form
    prefix: "" | "branch.",
    // saved values, so inactive defaults stay selectable
    saved?: Partial<CustomerBranchDefaults>,
};

/**
 * What a branch defaults onto its sales documents: price list, salesperson, taxes,
 * deliver-from location, shipping company and the GL accounts sales post to.
 */
export function BranchDefaultsFields<T extends FieldValues>({control, prefix, saved}: BranchDefaultsFieldsProps<T>) {
    const {t} = useSmartTranslation();
    const {data: salesTypes} = useGetSalesTypeOptions();
    const {data: salesPersons} = useGetSalesPersonOptions();
    const {data: areas} = useGetSalesAreaOptions();
    const {data: groups} = useGetSalesGroupOptions();
    const {data: taxGroups} = useGetTaxGroupOptions();
    const {data: locations} = useGetInventoryLocationOptions();
    const {data: shippers} = useGetShippingCompanyOptions();
    const {options: accountOptions} = useAccountOptions();

    const name = (field: keyof CustomerBranchDefaults) => `${prefix}${field}` as Path<T>;

    return (
        <>
            <FormSectionTitle title={t('salesDefaults')} hint={t('salesDefaultsHint')} />
            <Row className="gx-3">
                <Col md={4}>
                    <SelectField control={control} name={name("sales_type_id")} label={t('priceList')} numeric required placeholder=""
                        options={activeOptions(salesTypes, saved?.sales_type_id, s => s.name)} hint={t('priceListHint')} />
                </Col>
                <Col md={4}>
                    <SelectField control={control} name={name("tax_group_id")} label={t('taxGroup')} numeric placeholder=""
                        options={activeOptions(taxGroups, saved?.tax_group_id, g => g.name)} hint={t('taxGroupHint')} />
                </Col>
                <Col md={4}>
                    <SelectField control={control} name={name("sales_person_id")} label={t('salesPerson')} numeric placeholder=""
                        options={activeOptions(salesPersons, saved?.sales_person_id, p => p.name)} />
                </Col>
                <Col md={4}>
                    <SelectField control={control} name={name("location_id")} label={t('deliverFrom')} numeric placeholder=""
                        options={activeOptions(locations, saved?.location_id, l => `${l.code} - ${l.name}`)} />
                </Col>
                <Col md={4}>
                    <SelectField control={control} name={name("shipping_id")} label={t('shippingCompany')} numeric placeholder=""
                        options={activeOptions(shippers, saved?.shipping_id, s => s.name)} />
                </Col>
                <Col md={2}>
                    <SelectField control={control} name={name("sales_area_id")} label={t('salesArea')} numeric placeholder=""
                        options={activeOptions(areas, saved?.sales_area_id, a => a.name)} />
                </Col>
                <Col md={2}>
                    <SelectField control={control} name={name("sales_group_id")} label={t('salesGroup')} numeric placeholder=""
                        options={activeOptions(groups, saved?.sales_group_id, g => g.name)} />
                </Col>
            </Row>

            <FormSectionTitle title={t('glAccounts')} hint={t('branchAccountsHint')} />
            <Row className="gx-3">
                <Col md={6}>
                    <SelectField control={control} name={name("receivable_account_id")} label={t('receivableAccount')} numeric required placeholder="" options={accountOptions} />
                </Col>
                <Col md={6}>
                    <SelectField control={control} name={name("sales_account_id")} label={t('salesAccount')} numeric required placeholder="" options={accountOptions} />
                </Col>
                <Col md={6}>
                    <SelectField control={control} name={name("sales_discount_account_id")} label={t('salesDiscountAccount')} numeric required placeholder="" options={accountOptions} />
                </Col>
                <Col md={6}>
                    <SelectField control={control} name={name("payment_discount_account_id")} label={t('paymentDiscountAccount')} numeric required placeholder="" options={accountOptions} />
                </Col>
            </Row>
        </>
    );
}

/** Branch GL account → its System Setup default (prefilled by useSetupDefaults). */
export const BRANCH_ACCOUNT_DEFAULTS = {
    receivable_account_id: "default_receivable_account_id",
    sales_account_id: "default_sales_account_id",
    sales_discount_account_id: "default_sales_discount_account_id",
    payment_discount_account_id: "default_prompt_payment_discount_account_id",
} as const;

/** The same, for the first branch inside the new-customer form. */
export const BRANCH_ACCOUNT_DEFAULTS_FIRST_BRANCH = {
    "branch.receivable_account_id": "default_receivable_account_id",
    "branch.sales_account_id": "default_sales_account_id",
    "branch.sales_discount_account_id": "default_sales_discount_account_id",
    "branch.payment_discount_account_id": "default_prompt_payment_discount_account_id",
} as const;

export const EMPTY_BRANCH_DEFAULTS: CustomerBranchDefaults = {
    sales_type_id: null,
    sales_area_id: null,
    sales_group_id: null,
    sales_person_id: null,
    location_id: null,
    shipping_id: null,
    tax_group_id: null,
    receivable_account_id: null,
    sales_account_id: null,
    sales_discount_account_id: null,
    payment_discount_account_id: null,
};
