import {Col, Row} from "react-bootstrap";
import {useRequestForm} from "@/hooks/use-request-handler";
import {CustomerBranch} from "@/apis/models/customer";
import {CustomerBranchRequest} from "@/apis/requests/customer-branch-api";
import {StatusField, TextAreaField, TextField} from "@/components/FormField/FormFields";
import SettingsFormPage, {FormSectionTitle} from "@/views/Settings/shared/SettingsFormPage";
import {RecordFormProps} from "@/views/Settings/shared/SettingsEditPage";
import {AddressRows} from "@/views/Settings/Organization/Profile/AddressRows";
import {addressesToForm, addressesToPayload, blankToNull} from "@/views/Settings/Organization/Profile/profile-form";
import {useSmartTranslation} from "@/hooks/use-translation";
import {CUSTOMERS_PATH} from "../../sales-menu";
import {BranchDefaultsFields} from "../BranchDefaultsFields";

type BranchFormProps = RecordFormProps<CustomerBranch, CustomerBranchRequest> & {
    customerId: number,
    customerName?: string,
};

export function BranchForm({record, customerId, customerName, onSubmit, onSuccess, onDelete}: BranchFormProps) {
    const {t} = useSmartTranslation();

    const {control, watch, setValue, submitting, handleSubmitRequest} = useRequestForm<CustomerBranchRequest>({
        formOptions: {
            defaultValues: {
                customer_id: customerId,
                name: record?.name ?? "",
                short_name: record?.short_name ?? "",
                sales_type_id: record?.sales_type_id ?? null,
                sales_area_id: record?.sales_area_id ?? null,
                sales_group_id: record?.sales_group_id ?? null,
                sales_person_id: record?.sales_person_id ?? null,
                location_id: record?.location_id ?? null,
                shipping_id: record?.shipping_id ?? null,
                tax_group_id: record?.tax_group_id ?? null,
                receivable_account_id: record?.receivable_account_id ?? null,
                sales_account_id: record?.sales_account_id ?? null,
                sales_discount_account_id: record?.sales_discount_account_id ?? null,
                payment_discount_account_id: record?.payment_discount_account_id ?? null,
                notes: record?.notes ?? "",
                status: record?.status ?? "active",
                addresses: addressesToForm(record?.addresses),
            },
        },
    });

    const submit = (values: CustomerBranchRequest) => onSubmit({
        ...values,
        name: values.name.trim(),
        short_name: blankToNull(values.short_name),
        notes: blankToNull(values.notes),
        addresses: addressesToPayload(values.addresses),
    });

    return (
        <SettingsFormPage
            onSubmit={handleSubmitRequest({request: submit, onSuccess})}
            submitting={submitting}
            isEditing={!!record}
            backTo={`${CUSTOMERS_PATH}/${customerId}`}
            onDelete={onDelete}
        >
            <FormSectionTitle title={customerName ? t('branchOf', {name: customerName}) : t('branch')} />
            <Row className="gx-3">
                <Col md={6}>
                    <TextField control={control} name="name" label={t('branchName')} required maxLength={255} />
                </Col>
                <Col md={3}>
                    <TextField control={control} name="short_name" label={t('shortName')} maxLength={60} />
                </Col>
                <Col md={3}>
                    <StatusField control={control} name="status" />
                </Col>
            </Row>

            <BranchDefaultsFields control={control} prefix="" saved={record} />

            <hr className="my-3" />
            <AddressRows control={control} watch={watch} setValue={setValue} />

            <hr className="my-3" />
            <TextAreaField control={control} name="notes" label={t('notes')} rows={3} />
        </SettingsFormPage>
    );
}
