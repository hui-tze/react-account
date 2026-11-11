import {Button, Col, Container, Form, Row, Spinner} from "react-bootstrap";
import {ActionButton} from "@/components/Access/Guarded";
import {useNavigate} from "react-router-dom";
import SimpleBar from "simplebar-react";
import {useRequestForm} from "@/hooks/use-request-handler";
import {Currency} from "@/apis/models/currency";
import {ExchangeRate} from "@/apis/models/exchange-rate";
import {ExchangeRateRequest} from "@/apis/requests/exchange-rate-api";
import {useGetCurrencyOptions} from "@/apis/requests/currency-api";
import {ConditionalErrorContent} from "@/components/Display/ErrorBoundary";
import {useSmartTranslation} from "@/hooks/use-translation";

export type ExchangeRateFormProps = {
    exchangeRate?: ExchangeRate,
    onSubmit: (formData: ExchangeRateRequest) => Promise<void>,
    onSuccess?: () => Promise<void>,
    onDelete?: () => void,
};

export function ExchangeRateForm(props: ExchangeRateFormProps) {
    const {data: currencies, error} = useGetCurrencyOptions();

    if (error) {
        return <ConditionalErrorContent error={error} />;
    }

    // wait for the options so the native select mounts with the saved currency already selectable.
    if (!currencies) {
        return <div className="loader-pendulums mt-10" />;
    }

    const editingCurrency = props.exchangeRate?.currency;
    const options = editingCurrency && !currencies.some(c => c.id === editingCurrency.id)
        ? [editingCurrency, ...currencies]
        : currencies;

    return <ExchangeRateFormBody {...props} currencies={options} />;
}

function ExchangeRateFormBody({exchangeRate, currencies, onSubmit, onSuccess, onDelete}: ExchangeRateFormProps & {currencies: Currency[]}) {
    const {t} = useSmartTranslation();
    const navigate = useNavigate();

    const {register, registerSelect, formState, submitting, handleSubmitRequest} = useRequestForm<ExchangeRateRequest>({
        formOptions: {
            defaultValues: {
                currency_id: exchangeRate?.currency_id,
                rate_date: exchangeRate?.rate_date ?? "",
                rate: exchangeRate?.rate ?? "",
                status: exchangeRate?.status ?? "active",
            },
        },
    });
    const errors = formState.errors;

    return (
        <div className="app-body">
            <SimpleBar className="nicescroll-bar">
                <Container fluid className="py-3">
                    <Form noValidate onSubmit={handleSubmitRequest({request: onSubmit, onSuccess})}>
                        <Row className="gx-3">
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="require-label">{t('currency')}</Form.Label>
                                    <Form.Select {...registerSelect("currency_id", {
                                        setValueAs: (value) => value === "" || value == null ? undefined : Number(value),
                                        validate: (value) => (value != null && !Number.isNaN(value)) || '*' + t('required'),
                                    })}>
                                        <option value="">{t('selectCurrency')}</option>
                                        {currencies.map(c => (
                                            <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                                        ))}
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">{errors.currency_id?.message}</Form.Control.Feedback>
                                    {currencies.length === 0 && (
                                        <Form.Text className="text-muted">{t('noCurrencyYet')}</Form.Text>
                                    )}
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="require-label">{t('rateDate')}</Form.Label>
                                    <Form.Control type="date" {...register("rate_date", {required: '*' + t('required')})} />
                                    <Form.Control.Feedback type="invalid">{errors.rate_date?.message}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="gx-3">
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="require-label">{t('rate')}</Form.Label>
                                    <Form.Control type="number" min={0} step="0.000001" {...register("rate", {
                                        required: '*' + t('required'),
                                        min: {value: 0, message: t('rateMustBePositive')},
                                    })} />
                                    <Form.Control.Feedback type="invalid">{errors.rate?.message}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('status')}</Form.Label>
                                    <Form.Select {...registerSelect("status")}>
                                        <option value="active">{t('active')}</option>
                                        <option value="inactive">{t('inactive')}</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-flex gap-2 mt-3">
                            <Button variant="outline-secondary" type="button" onClick={() => navigate("/settings/gl/exchange-rates")}>{t('cancel')}</Button>
                            <ActionButton action={onDelete ? "edit" : "create"} type="submit" variant="primary" disabled={submitting}>
                                <Spinner as="span" animation="border" size="sm" className={submitting ? "me-2" : "d-none"} />
                                {exchangeRate ? t('saveChanges') : t('create')}
                            </ActionButton>
                            {onDelete && (
                                <ActionButton action="delete" variant="outline-danger" type="button" className="ms-auto" onClick={onDelete}>{t('delete')}</ActionButton>
                            )}
                        </div>
                    </Form>
                </Container>
            </SimpleBar>
        </div>
    );
}
