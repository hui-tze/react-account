import {Col, Row} from "react-bootstrap";
import {useRequestForm} from "@/hooks/use-request-handler";
import {PaymentTerm} from "@/apis/models/payment-term";
import {PaymentTermRequest} from "@/apis/requests/payment-term-api";
import {SelectField, StatusField, TextField} from "@/components/FormField/FormFields";
import SettingsFormPage from "@/views/Settings/shared/SettingsFormPage";
import {RecordFormProps} from "@/views/Settings/shared/SettingsEditPage";
import {useSmartTranslation} from "@/hooks/use-translation";
import {describePaymentTerm, PAYMENT_TERMS_PATH, usePaymentTermTypeOptions} from "./index";

export function PaymentTermForm({record, onSubmit, onSuccess, onDelete}: RecordFormProps<PaymentTerm, PaymentTermRequest>) {
    const {t} = useSmartTranslation();
    const typeOptions = usePaymentTermTypeOptions();

    const {control, watch, submitting, handleSubmitRequest} = useRequestForm<PaymentTermRequest>({
        formOptions: {
            defaultValues: {
                name: record?.name ?? "",
                type: record?.type ?? "day",
                days_before_due: record?.days_before_due ?? 30,
                day_in_following_month: record?.day_in_following_month ?? 1,
                status: record?.status ?? "active",
            },
        },
    });

    const type = watch("type");
    const daysBeforeDue = watch("days_before_due");
    const dayInFollowingMonth = watch("day_in_following_month");

    // the backend columns are non-null integers — zero out whichever one the chosen type doesn't use
    const submit = (data: PaymentTermRequest) => onSubmit({
        ...data,
        days_before_due: data.type === "day" ? (data.days_before_due ?? 0) : 0,
        day_in_following_month: data.type === "following_month" ? (data.day_in_following_month ?? 0) : 0,
    });

    return (
        <SettingsFormPage
            onSubmit={handleSubmitRequest({request: submit, onSuccess})}
            submitting={submitting}
            isEditing={!!record}
            backTo={PAYMENT_TERMS_PATH}
            onDelete={onDelete}
        >
            <Row className="gx-3">
                <Col md={8}>
                    <TextField control={control} name="name" label={t('name')} required maxLength={255} />
                </Col>
                <Col md={4}>
                    <StatusField control={control} name="status" />
                </Col>
                <Col md={8}>
                    <SelectField
                        control={control}
                        name="type"
                        label={t('paymentTermType')}
                        required
                        options={typeOptions}
                        hint={type ? describePaymentTerm(t, {type, days_before_due: daysBeforeDue, day_in_following_month: dayInFollowingMonth}) : undefined}
                    />
                </Col>
                {type === "day" && (
                    <Col md={4}>
                        <TextField
                            control={control}
                            name="days_before_due"
                            label={t('daysBeforeDue')}
                            type="number"
                            numeric
                            required
                            min={0}
                            step={1}
                            rules={{min: {value: 0, message: t('daysBeforeDueMin')}}}
                        />
                    </Col>
                )}
                {type === "following_month" && (
                    <Col md={4}>
                        <TextField
                            control={control}
                            name="day_in_following_month"
                            label={t('dayInFollowingMonth')}
                            type="number"
                            numeric
                            required
                            min={1}
                            max={31}
                            step={1}
                            rules={{
                                min: {value: 1, message: t('dayInFollowingMonthRange')},
                                max: {value: 31, message: t('dayInFollowingMonthRange')},
                            }}
                        />
                    </Col>
                )}
            </Row>
        </SettingsFormPage>
    );
}
