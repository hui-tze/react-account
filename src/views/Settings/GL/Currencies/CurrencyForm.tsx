import {Button, Col, Container, Form, Row, Spinner} from "react-bootstrap";
import {ActionButton} from "@/components/Access/Guarded";
import {useNavigate} from "react-router-dom";
import SimpleBar from "simplebar-react";
import {useRequestForm} from "@/hooks/use-request-handler";
import {Currency} from "@/apis/models/currency";
import {CurrencyRequest} from "@/apis/requests/currency-api";
import {useSmartTranslation} from "@/hooks/use-translation";

export type CurrencyFormProps = {
    currency?: Currency,
    onSubmit: (formData: CurrencyRequest) => Promise<void>,
    onSuccess?: () => Promise<void>,
    onDelete?: () => void,
};

export function CurrencyForm({currency, onSubmit, onSuccess, onDelete}: CurrencyFormProps) {
    const {t} = useSmartTranslation();
    const navigate = useNavigate();

    const {register, registerSelect, formState, submitting, handleSubmitRequest} = useRequestForm<CurrencyRequest>({
        formOptions: {
            defaultValues: {
                code: currency?.code ?? "",
                name: currency?.name ?? "",
                symbol: currency?.symbol ?? "",
                decimal_places: currency?.decimal_places ?? 2,
                status: currency?.status ?? "active",
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
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="require-label">{t('code')}</Form.Label>
                                    <Form.Control
                                        type="text"
                                        maxLength={3}
                                        placeholder="MYR"
                                        className="text-uppercase"
                                        {...register("code", {
                                            required: '*' + t('required'),
                                            setValueAs: (value: string) => value.trim().toUpperCase(),
                                        })}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.code?.message}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={8}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="require-label">{t('name')}</Form.Label>
                                    <Form.Control type="text" maxLength={255} placeholder="Malaysian Ringgit" {...register("name", {required: '*' + t('required')})} />
                                    <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="gx-3">
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="require-label">{t('symbol')}</Form.Label>
                                    <Form.Control type="text" maxLength={10} placeholder="RM" {...register("symbol", {required: '*' + t('required')})} />
                                    <Form.Control.Feedback type="invalid">{errors.symbol?.message}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="require-label">{t('decimalPlaces')}</Form.Label>
                                    <Form.Control type="number" min={0} max={6} step={1} {...register("decimal_places", {
                                        required: '*' + t('required'),
                                        valueAsNumber: true,
                                        min: {value: 0, message: t('decimalPlacesRange')},
                                        max: {value: 6, message: t('decimalPlacesRange')},
                                    })} />
                                    <Form.Control.Feedback type="invalid">{errors.decimal_places?.message}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
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
                            <Button variant="outline-secondary" type="button" onClick={() => navigate("/settings/gl/currencies")}>{t('cancel')}</Button>
                            <ActionButton action={onDelete ? "edit" : "create"} type="submit" variant="primary" disabled={submitting}>
                                <Spinner as="span" animation="border" size="sm" className={submitting ? "me-2" : "d-none"} />
                                {currency ? t('saveChanges') : t('create')}
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
